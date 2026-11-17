import { v2 as cloudinary } from 'cloudinary';
import ImageKit from 'imagekit';
import path from 'path';

/**
 * Configure Cloudinary service
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Configure ImageKit service
 */
export const imagekitClient = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export const cloudinaryClient = cloudinary;

/**
 * Helper to upload a Buffer directly to Cloudinary via upload_stream
 */
function uploadBufferToCloudinary(
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return reject(new Error('Cloudinary credentials are not configured in environment variables'));
    }

    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `${baseName}_${Date.now()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: cleanFolder || 'general',
        public_id: publicId,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }
        resolve(result.secure_url || result.url);
      }
    );

    uploadStream.on('error', (err) => {
      reject(err);
    });

    uploadStream.end(buffer);
  });
}

/**
 * Helper to upload a Buffer directly to ImageKit
 */
async function uploadBufferToImageKit(
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<string> {
  if (
    !process.env.IMAGEKIT_PUBLIC_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.IMAGEKIT_URL_ENDPOINT
  ) {
    throw new Error('ImageKit credentials are not configured in environment variables');
  }

  const cleanFolder = folder.startsWith('/') ? folder : `/${folder}`;
  const response = await imagekitClient.upload({
    file: buffer,
    fileName: fileName,
    folder: cleanFolder,
    useUniqueFileName: true,
  });

  if (!response?.url) {
    throw new Error('ImageKit upload did not return a valid URL');
  }

  return response.url;
}

/**
 * Dual Cloud Upload (Failover):
 * 1. Attempts to upload to Cloudinary and returns secure_url.
 * 2. If Cloudinary throws an error (e.g. quota exceeded or credentials failure),
 *    catches the error and immediately falls back to ImageKit, returning its URL.
 */
export async function uploadToCloud(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'general'
): Promise<string> {
  try {
    const secureUrl = await uploadBufferToCloudinary(fileBuffer, fileName, folder);
    return secureUrl;
  } catch (cloudinaryError: any) {
    console.warn(
      'Cloudinary upload failed, switching to ImageKit fallback:',
      cloudinaryError?.message || cloudinaryError
    );
    try {
      const imageKitUrl = await uploadBufferToImageKit(fileBuffer, fileName, folder);
      return imageKitUrl;
    } catch (imageKitError: any) {
      console.error(
        'ImageKit fallback upload also failed:',
        imageKitError?.message || imageKitError
      );
      throw new Error(
        `خطا در بارگذاری ابری: Cloudinary (${cloudinaryError?.message || 'ناموفق'}) و ImageKit (${imageKitError?.message || 'ناموفق'}) هر دو با خطا مواجه شدند.`
      );
    }
  }
}

/**
 * Extracts public_id and resource_type from a Cloudinary URL
 */
export function extractCloudinaryPublicId(url: string): {
  publicId: string;
  resourceType?: 'image' | 'raw' | 'video';
} | null {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const uploadIdx = cleanUrl.indexOf('/upload/');
    if (uploadIdx === -1) return null;

    const preUpload = cleanUrl.substring(0, uploadIdx);
    let resourceType: 'image' | 'raw' | 'video' = 'image';
    if (preUpload.endsWith('/raw')) {
      resourceType = 'raw';
    } else if (preUpload.endsWith('/video')) {
      resourceType = 'video';
    }

    const postUpload = cleanUrl.substring(uploadIdx + '/upload/'.length);
    const segments = postUpload.split('/');
    const pathSegments: string[] = [];
    let passedPrefix = false;

    for (const segment of segments) {
      if (!passedPrefix) {
        if (/^v\d+$/.test(segment)) {
          passedPrefix = true;
          continue;
        } else if (segment.includes(',') || /^[a-z]_[a-z0-9_-]+$/i.test(segment)) {
          // transformation segment, skip
          continue;
        } else {
          passedPrefix = true;
          pathSegments.push(segment);
        }
      } else {
        pathSegments.push(segment);
      }
    }

    if (pathSegments.length === 0) return null;

    const fullPathWithExt = pathSegments.join('/');
    if (resourceType === 'raw') {
      return { publicId: fullPathWithExt, resourceType };
    }

    const lastDot = fullPathWithExt.lastIndexOf('.');
    const publicId = lastDot !== -1 ? fullPathWithExt.substring(0, lastDot) : fullPathWithExt;
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

/**
 * Deletes a file from the appropriate cloud provider (or local storage fallback):
 * - If URL contains 'cloudinary', extracts Public ID and calls cloudinary.uploader.destroy.
 * - If URL contains 'imagekit', resolves fileId and calls imagekit.deleteFile.
 * - If URL contains '/uploads/', deletes the local file from disk.
 */
export async function deleteFromCloud(
  fileUrl?: unknown
): Promise<{ deleted: boolean; provider?: string }> {
  if (typeof fileUrl !== 'string' || !fileUrl.trim()) {
    return { deleted: false };
  }

  const trimmedUrl = fileUrl.trim();

  // 1. Cloudinary Delete
  if (trimmedUrl.includes('cloudinary')) {
    try {
      const parsed = extractCloudinaryPublicId(trimmedUrl);
      if (parsed?.publicId) {
        await cloudinary.uploader.destroy(parsed.publicId, {
          resource_type: parsed.resourceType || 'image',
          invalidate: true,
        });
        return { deleted: true, provider: 'cloudinary' };
      }
    } catch (err: any) {
      console.warn(`Failed to destroy file from Cloudinary (${trimmedUrl}):`, err?.message || err);
    }
    return { deleted: false, provider: 'cloudinary' };
  }

  // 2. ImageKit Delete
  if (trimmedUrl.includes('imagekit')) {
    try {
      const cleanUrl = trimmedUrl.split('?')[0].split('#')[0];
      let parsedUrl: URL | null = null;
      try {
        parsedUrl = new URL(cleanUrl);
      } catch {
        // In case a relative or raw path was passed
      }

      const fileName = parsedUrl ? path.basename(parsedUrl.pathname) : path.basename(cleanUrl);

      if (fileName) {
        const files = await imagekitClient.listFiles({
          name: fileName,
          limit: 10,
        });

        if (Array.isArray(files) && files.length > 0) {
          const matched =
            files.find(
              (f: any) =>
                f &&
                'filePath' in f &&
                typeof f.filePath === 'string' &&
                cleanUrl.endsWith(f.filePath)
            ) || files[0];

          if (matched && 'fileId' in matched && matched.fileId) {
            await imagekitClient.deleteFile(matched.fileId);
            return { deleted: true, provider: 'imagekit' };
          }
        }
      }
    } catch (err: any) {
      console.warn(`Failed to delete file from ImageKit (${trimmedUrl}):`, err?.message || err);
    }
    return { deleted: false, provider: 'imagekit' };
  }

  // 3. Backward Compatibility for Legacy Local Files (/uploads/...)
  if (trimmedUrl.includes('/uploads/')) {
    try {
      const { deleteLocalUploadFile } = await import('@/lib/storage/file-manager');
      const res = await deleteLocalUploadFile(trimmedUrl);
      return { deleted: res.deleted, provider: 'local' };
    } catch (err: any) {
      console.warn(`Failed to delete local upload file (${trimmedUrl}):`, err?.message || err);
    }
  }

  return { deleted: false };
}
