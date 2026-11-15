import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const UPLOADS_ROOT = path.resolve(process.cwd(), 'public', 'uploads');
const MAX_IMAGE_WIDTH = 1080;
const TARGET_MAX_IMAGE_BYTES = 500 * 1024; // 500KB target limit

export interface OptimizedImageResult {
  buffer: Buffer;
  ext: string;
  mimeType: string;
}

/**
 * Optimizes raster images with Sharp:
 * - Auto-rotates based on EXIF
 * - Resizes down to max width 1080px (without enlarging smaller images)
 * - Converts to WebP at quality 80 (with adaptive pass if > 500KB)
 * Non-raster assets (PDF, SVG, ICO) are returned untouched.
 */
export async function optimizeImageBuffer(
  buffer: Buffer,
  mimeType: string,
  originalExt: string
): Promise<OptimizedImageResult> {
  const lowerMime = (mimeType || '').toLowerCase();
  const lowerExt = (originalExt || '').toLowerCase();

  const isRasterImage =
    lowerMime.startsWith('image/') &&
    !lowerMime.includes('svg') &&
    !lowerMime.includes('icon') &&
    lowerExt !== '.svg' &&
    lowerExt !== '.ico';

  if (!isRasterImage) {
    return {
      buffer,
      ext: originalExt || '.bin',
      mimeType: mimeType || 'application/octet-stream',
    };
  }

  try {
    const firstPass = await sharp(buffer, { animated: true })
      .rotate()
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    let finalBuffer = firstPass;

    if (firstPass.length > TARGET_MAX_IMAGE_BYTES) {
      const secondPass = await sharp(buffer, { animated: true })
        .rotate()
        .resize({ width: 960, withoutEnlargement: true })
        .webp({ quality: 65 })
        .toBuffer();

      if (secondPass.length < firstPass.length) {
        finalBuffer = secondPass;
      }
    }

    return {
      buffer: finalBuffer,
      ext: '.webp',
      mimeType: 'image/webp',
    };
  } catch (err) {
    console.warn('Sharp image optimization failed, falling back to original buffer:', err);
    return {
      buffer,
      ext: originalExt || '.png',
      mimeType: mimeType || 'image/png',
    };
  }
}

/**
 * Extracts canonical `/uploads/<folder>/<file>` path from relative or full URLs.
 */
export function normalizeUploadUrl(rawUrl?: unknown): string | null {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const idx = trimmed.indexOf('/uploads/');
  if (idx === -1) return null;

  let rel = trimmed.slice(idx);
  rel = rel.split(/[?#]/)[0];

  try {
    rel = decodeURIComponent(rel);
  } catch {
    // Preserve raw string if malformed URI component
  }

  rel = rel.replace(/\\/g, '/');
  if (rel.includes('..') || rel.length <= '/uploads/'.length) {
    return null;
  }

  return rel;
}

/**
 * Resolves a local `/uploads/...` URL to a strictly contained filesystem path.
 */
export function resolveUploadFilePath(rawUrl?: unknown): string | null {
  const normalized = normalizeUploadUrl(rawUrl);
  if (!normalized) return null;

  const relativePart = normalized.replace(/^\/uploads\//, '');
  if (!relativePart) return null;

  const resolved = path.resolve(UPLOADS_ROOT, relativePart);
  if (!resolved.startsWith(UPLOADS_ROOT + path.sep)) {
    return null;
  }

  return resolved;
}

/**
 * Physically deletes a local file inside `public/uploads` if it exists.
 */
export async function deleteLocalUploadFile(
  rawUrl?: unknown
): Promise<{ deleted: boolean; bytesFreed: number }> {
  const filePath = resolveUploadFilePath(rawUrl);
  if (!filePath) return { deleted: false, bytesFreed: 0 };

  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) return { deleted: false, bytesFreed: 0 };
    await fs.unlink(filePath);
    return { deleted: true, bytesFreed: stats.size };
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      console.warn(`Could not delete file at ${filePath}:`, err?.message || err);
    }
    return { deleted: false, bytesFreed: 0 };
  }
}

/**
 * Deletes `oldUrl` from disk when a field is replaced with a different value or cleared.
 */
export async function deleteReplacedFileIfUnused(
  oldUrl?: unknown,
  newUrl?: unknown
): Promise<void> {
  const oldNorm = normalizeUploadUrl(oldUrl);
  if (!oldNorm) return;

  const newNorm = normalizeUploadUrl(newUrl);
  if (oldNorm === newNorm) return;

  await deleteLocalUploadFile(oldNorm);
}

/**
 * Recursively extracts all `/uploads/...` URLs from any document, array, object, or HTML string.
 */
export function extractAllLocalUploadUrls(
  input: unknown,
  collected: Set<string> = new Set<string>(),
  visited: WeakSet<object> = new WeakSet<object>()
): Set<string> {
  if (!input) return collected;

  if (typeof input === 'string') {
    if (input.includes('/uploads/')) {
      const matches = input.match(/\/uploads\/[^\s"'<>`\\)]+/g);
      if (matches) {
        for (const match of matches) {
          const norm = normalizeUploadUrl(match);
          if (norm) collected.add(norm);
        }
      }
    }
    return collected;
  }

  if (typeof input !== 'object') return collected;
  if (input instanceof Date || Buffer.isBuffer(input) || input instanceof Uint8Array) {
    return collected;
  }
  if ((input as any)._bsontype) {
    return collected;
  }

  if (visited.has(input as object)) return collected;
  visited.add(input as object);

  if (Array.isArray(input)) {
    for (const item of input) {
      extractAllLocalUploadUrls(item, collected, visited);
    }
    return collected;
  }

  const obj =
    typeof (input as any).toObject === 'function'
      ? (input as any).toObject()
      : (input as Record<string, unknown>);

  if (obj && typeof obj === 'object') {
    for (const val of Object.values(obj)) {
      extractAllLocalUploadUrls(val, collected, visited);
    }
  }

  return collected;
}

/**
 * Compares all local `/uploads/...` references in `oldDoc` vs `newDoc` and deletes any
 * uploaded files that were removed or replaced during the update/delete operation.
 */
export async function deleteRemovedUploadUrlsBetweenDocs(
  oldDoc: unknown,
  newDoc: unknown
): Promise<void> {
  if (!oldDoc) return;
  const oldUrls = extractAllLocalUploadUrls(oldDoc);
  if (oldUrls.size === 0) return;

  const newUrls = newDoc ? extractAllLocalUploadUrls(newDoc) : new Set<string>();

  for (const oldUrl of Array.from(oldUrls)) {
    if (!newUrls.has(oldUrl)) {
      await deleteLocalUploadFile(oldUrl);
    }
  }
}
