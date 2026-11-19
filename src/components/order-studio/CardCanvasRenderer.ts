'use client';

import qrcode from 'qrcode-generator';
import {
  ArtworkFit,
  BadgeMode,
  BgConfig,
  CardDesignState,
  HH,
  HW,
  LoadedCardImages,
  MaterialOption,
  TipShape,
  VH,
  VW,
  getEffectiveBg,
  isGradientMode,
  resolveQrTargetUrl,
} from './types';

interface QRCodeMatrixInstance {
  addData(data: string): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

const CARD_FONT_STACK = 'var(--font-vazirmatn), "Vazirmatn", "Inter", sans-serif';

function resolveCanvasFontFamily(): string {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const computed = window.getComputedStyle(document.body).fontFamily;
    if (computed && computed.trim()) {
      return computed;
    }
  }
  return '"Vazirmatn", "Inter", sans-serif';
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

function drawFullDesignImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number,
  H: number,
  fit: ArtworkFit = 'cover'
) {
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);
  const scale =
    fit === 'contain'
      ? Math.min(W / img.width, H / img.height)
      : Math.max(W / img.width, H / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.restore();
}

function drawCardBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bg: BgConfig,
  material: MaterialOption
) {
  if (isGradientMode(bg)) {
    let grad: CanvasGradient;
    if (bg.gradType === 'radial') {
      grad = ctx.createRadialGradient(
        W * 0.5,
        H * 0.42,
        W * 0.04,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.72
      );
    } else {
      const rad = ((bg.angle - 90) * Math.PI) / 180;
      const cx = W / 2;
      const cy = H / 2;
      const r = Math.hypot(W, H) / 2;
      grad = ctx.createLinearGradient(
        cx - Math.cos(rad) * r,
        cy - Math.sin(rad) * r,
        cx + Math.cos(rad) * r,
        cy + Math.sin(rad) * r
      );
    }
    grad.addColorStop(0, bg.c1);
    grad.addColorStop(1, bg.c2);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bg.solidColor;
  }
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  if (material.brushed) {
    ctx.globalAlpha = 0.08;
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = y % 6 === 0 ? '#ffffff' : '#000000';
      ctx.fillRect(0, y, W, 1);
    }
  } else if (material.id === 'pvc-matte') {
    ctx.globalAlpha = 0.035;
    for (let i = 0; i < 3400; i++) {
      ctx.fillStyle = i % 2 ? '#ffffff' : '#000000';
      ctx.fillRect((i * 887) % W, (i * 521) % H, 2, 2);
    }
  }
  ctx.restore();

  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, 'rgba(255,255,255,0.02)');
  sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.03)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
}

function drawBadgedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baselineY: number,
  fontSize: number,
  fontWeight: number,
  textColor: string,
  badgeMode: BadgeMode,
  badgeColor: string,
  fontFamily: string,
  align: CanvasTextAlign = 'center',
  maxWidth = 620
) {
  if (!text) return;
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  const measured = Math.min(maxWidth, ctx.measureText(text).width);
  const padX = Math.round(fontSize * 1.15);
  const pillW = Math.max(measured + padX * 2, fontSize * 4.5);
  const pillH = Math.round(fontSize * 1.9);
  const cy = baselineY;

  let bx = x - pillW / 2;
  if (align === 'left') bx = x - padX;
  else if (align === 'right') bx = x - pillW + padX;
  const by = cy - pillH / 2;

  if (badgeMode === 'filled') {
    ctx.fillStyle = badgeColor;
    roundRect(ctx, bx, by, pillW, pillH, pillH / 2);
    ctx.fill();
  } else if (badgeMode === 'outline') {
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth = Math.max(3, fontSize * 0.12);
    roundRect(ctx, bx, by, pillW, pillH, pillH / 2);
    ctx.stroke();
  }

  ctx.fillStyle = textColor;
  ctx.fillText(text, x, cy + 2, maxWidth);
  ctx.restore();
}

function drawTipOrnament(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  shape: TipShape,
  color: string,
  pointDir: 'down' | 'up' | 'right' | 'left' = 'down'
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  const r = 14;

  if (shape === 'slash') {
    ctx.beginPath();
    if (pointDir === 'down' || pointDir === 'right') {
      ctx.moveTo(cx + r, cy - r);
      ctx.lineTo(cx - r, cy + r);
    } else {
      ctx.moveTo(cx - r, cy - r);
      ctx.lineTo(cx + r, cy + r);
    }
    ctx.stroke();
  } else if (shape === 'square') {
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  } else if (shape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.2);
    ctx.lineTo(cx + r * 1.2, cy);
    ctx.lineTo(cx, cy + r * 1.2);
    ctx.lineTo(cx - r * 1.2, cy);
    ctx.closePath();
    ctx.fill();
  } else if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'triangle') {
    ctx.beginPath();
    if (pointDir === 'down') {
      ctx.moveTo(cx, cy + r * 1.15);
      ctx.lineTo(cx - r * 1.15, cy - r * 0.9);
      ctx.lineTo(cx + r * 1.15, cy - r * 0.9);
    } else if (pointDir === 'up') {
      ctx.moveTo(cx, cy - r * 1.15);
      ctx.lineTo(cx - r * 1.15, cy + r * 0.9);
      ctx.lineTo(cx + r * 1.15, cy + r * 0.9);
    } else if (pointDir === 'right') {
      ctx.moveTo(cx + r * 1.15, cy);
      ctx.lineTo(cx - r * 0.9, cy - r * 1.15);
      ctx.lineTo(cx - r * 0.9, cy + r * 1.15);
    } else {
      ctx.moveTo(cx - r * 1.15, cy);
      ctx.lineTo(cx + r * 0.9, cy - r * 1.15);
      ctx.lineTo(cx + r * 0.9, cy + r * 1.15);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCircularNfc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, radius * 0.085);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2.6, radius * 0.075);
  const startX = cx - radius * 0.34;
  [0.24, 0.42, 0.6, 0.78].forEach((ratio) => {
    ctx.beginPath();
    ctx.arc(startX, cy, radius * ratio, -Math.PI * 0.36, Math.PI * 0.36);
    ctx.stroke();
  });
  ctx.restore();
}

function drawFallbackVectorMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  primaryColor: string,
  accentColor: string
) {
  ctx.save();
  const half = size / 2;
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(cx - half, cy - half * 0.15);
  ctx.lineTo(cx - half, cy - half);
  ctx.lineTo(cx - half * 0.15, cy - half);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + half, cy + half * 0.15);
  ctx.lineTo(cx + half, cy + half);
  ctx.lineTo(cx + half * 0.15, cy + half);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = size * 0.095;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy - half * 0.6);
  ctx.lineTo(cx + half * 0.55, cy + half * 0.55);
  ctx.lineTo(cx - half * 0.55, cy + half * 0.55);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawImageFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  boxSize: number
) {
  const ratio = Math.min(boxSize / img.width, boxSize / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
}

function drawMainLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  state: CardDesignState,
  images: LoadedCardImages
) {
  try {
    if (images.customLogoImg) {
      drawImageFitted(ctx, images.customLogoImg, cx, cy, size);
      return;
    }
    if (images.siteLogoImg) {
      drawImageFitted(ctx, images.siteLogoImg, cx, cy, size);
      return;
    }
  } catch {
    // Safe fallback to vector mark
  }
  drawFallbackVectorMark(ctx, cx, cy, size, state.colors.company, state.colors.tipShape);
}

function drawAryaSignature(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  state: CardDesignState,
  images: LoadedCardImages
) {
  try {
    if (images.siteLogoImg) {
      drawImageFitted(ctx, images.siteLogoImg, cx, cy, size);
      return;
    }
  } catch {
    // Safe fallback to vector mark
  }
  drawFallbackVectorMark(ctx, cx, cy, size, state.colors.name, state.colors.tipShape);
}

function drawRealQR(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  try {
    const factory = qrcode as unknown as (typeNumber: number, errorCorrectionLevel: string) => QRCodeMatrixInstance;
    const qr = factory(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const cell = size / count;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(x + c * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
    ctx.restore();
    return;
  } catch {
    // Deterministic fallback matrix if QR encoding ever fails
  }

  const N = 21;
  const cell = size / N;
  let h = 2166136261;
  for (let i = 0; i < url.length; i++) {
    h ^= url.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };
  const isF = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!isF(r, c) && rand() > 0.48) {
        ctx.fillRect(x + c * cell, y + r * cell, cell + 0.5, cell + 0.5);
      }
    }
  }
  const drawF = (fr: number, fc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          ctx.fillRect(x + (fc + c) * cell, y + (fr + r) * cell, cell + 0.5, cell + 0.5);
        }
      }
    }
  };
  drawF(0, 0);
  drawF(0, N - 7);
  drawF(N - 7, 0);
  ctx.restore();
}

export function drawCardFront(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  isVert: boolean,
  state: CardDesignState,
  material: MaterialOption,
  images: LoadedCardImages,
  dir: 'rtl' | 'ltr'
) {
  if (images.fullFrontImg) {
    drawFullDesignImage(ctx, images.fullFrontImg, W, H, state.fullFrontFit);
    return;
  }

  const bg = getEffectiveBg(state, 'front');
  const col = state.colors;
  const isRtl = dir === 'rtl';
  const fontFamily = resolveCanvasFontFamily() || CARD_FONT_STACK;

  drawCardBackground(ctx, W, H, bg, material);
  ctx.direction = isRtl ? 'rtl' : 'ltr';

  const compTxt = state.company.trim() || 'آریا لینک';
  const sloganTxt = state.slogan.trim();

  if (state.template === 'arya-svg') {
    if (isVert) {
      ctx.strokeStyle = col.frontLine1;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, 152);
      ctx.stroke();

      ctx.strokeStyle = col.frontLine2;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(W / 2, H);
      ctx.lineTo(W / 2, H - 152);
      ctx.stroke();

      drawTipOrnament(ctx, W / 2, 184, state.tipShape, col.tipShape, 'down');
      drawTipOrnament(ctx, W / 2, H - 184, state.tipShape, col.tipShape, 'up');

      drawMainLogo(ctx, W / 2, 460, 240, state, images);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `800 46px ${fontFamily}`;
      ctx.fillText(compTxt, W / 2, 665, W - 90);

      drawBadgedText(
        ctx,
        sloganTxt,
        W / 2,
        755,
        28,
        700,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        'center',
        W - 140
      );
    } else {
      ctx.strokeStyle = col.frontLine1;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(132, H / 2);
      ctx.stroke();

      ctx.strokeStyle = col.frontLine2;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(W, H / 2);
      ctx.lineTo(W - 132, H / 2);
      ctx.stroke();

      drawTipOrnament(ctx, 166, H / 2, state.tipShape, col.tipShape, 'right');
      drawTipOrnament(ctx, W - 166, H / 2, state.tipShape, col.tipShape, 'left');

      drawMainLogo(ctx, W / 2, 255, 200, state, images);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `800 48px ${fontFamily}`;
      ctx.fillText(compTxt, W / 2, 445, W - 260);

      drawBadgedText(
        ctx,
        sloganTxt,
        W / 2,
        530,
        27,
        700,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        'center',
        W - 320
      );
    }
  } else if (state.template === 'axis-metal') {
    if (isVert) {
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = col.frontLine1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, 275);
      ctx.stroke();
      ctx.strokeStyle = col.frontLine2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 790);
      ctx.lineTo(W / 2, 925);
      ctx.stroke();
      drawTipOrnament(ctx, W / 2, 304, state.tipShape, col.tipShape, 'down');
      drawMainLogo(ctx, W / 2, 465, 215, state, images);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `800 46px ${fontFamily}`;
      ctx.fillText(compTxt, W / 2, 645, W - 90);

      drawBadgedText(
        ctx,
        sloganTxt,
        W / 2,
        725,
        27,
        600,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        'center',
        W - 140
      );
      if (state.showNfc) drawCircularNfc(ctx, W / 2, 1015, 50, col.nfc);
    } else {
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = col.frontLine1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(205, H / 2);
      ctx.stroke();
      ctx.strokeStyle = col.frontLine2;
      ctx.beginPath();
      ctx.moveTo(W - 205, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      drawTipOrnament(ctx, 236, H / 2, state.tipShape, col.tipShape, 'right');
      drawTipOrnament(ctx, W - 236, H / 2, state.tipShape, col.tipShape, 'left');
      drawMainLogo(ctx, W / 2, 245, 185, state, images);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `800 48px ${fontFamily}`;
      ctx.fillText(compTxt, W / 2, 420, W - 320);

      drawBadgedText(
        ctx,
        sloganTxt,
        W / 2,
        498,
        26,
        600,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        'center',
        W - 360
      );
      if (state.showNfc) drawCircularNfc(ctx, W / 2, 625, 42, col.nfc);
    }
  } else if (state.template === 'executive') {
    if (isVert) {
      ctx.fillStyle = col.frontLine1;
      ctx.fillRect(isRtl ? W - 40 : 0, 0, 40, H);
      ctx.strokeStyle = col.frontLine2;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(140, 825);
      ctx.lineTo(W - 140, 825);
      ctx.stroke();
      drawMainLogo(ctx, W / 2, 345, 210, state, images);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `900 48px ${fontFamily}`;
      ctx.fillText(compTxt, W / 2, 605, W - 120);

      drawBadgedText(
        ctx,
        sloganTxt,
        W / 2,
        695,
        27,
        600,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        'center',
        W - 160
      );
      if (state.showNfc) drawCircularNfc(ctx, W / 2, 985, 46, col.nfc);
    } else {
      ctx.fillStyle = col.frontLine1;
      ctx.fillRect(isRtl ? W - 48 : 0, 0, 48, H);
      const tx = isRtl ? W - 115 : 115;
      ctx.strokeStyle = col.frontLine2;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, 395);
      ctx.lineTo(isRtl ? tx - 380 : tx + 380, 395);
      ctx.stroke();
      drawMainLogo(ctx, isRtl ? 235 : W - 235, H / 2, 210, state, images);

      ctx.textAlign = isRtl ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `900 54px ${fontFamily}`;
      ctx.fillText(compTxt, tx, 330, 620);

      drawBadgedText(
        ctx,
        sloganTxt,
        tx,
        475,
        28,
        600,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        isRtl ? 'right' : 'left',
        520
      );
      if (state.showNfc) drawCircularNfc(ctx, isRtl ? W - 150 : 150, 125, 38, col.nfc);
    }
  } else {
    // minimal
    ctx.strokeStyle = col.frontLine1;
    ctx.lineWidth = 3;
    roundRect(ctx, 32, 32, W - 64, H - 64, 34);
    ctx.stroke();
    ctx.strokeStyle = col.frontLine2;
    ctx.lineWidth = 3;
    if (isVert) {
      ctx.beginPath();
      ctx.moveTo(W / 2 - 90, 815);
      ctx.lineTo(W / 2 + 90, 815);
      ctx.stroke();
      if (state.showNfc) drawCircularNfc(ctx, isRtl ? 110 : W - 110, 115, 38, col.nfc);
      drawMainLogo(ctx, W / 2, 460, 220, state, images);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `800 46px ${fontFamily}`;
      ctx.fillText(compTxt, W / 2, 905, W - 120);

      drawBadgedText(
        ctx,
        sloganTxt,
        W / 2,
        995,
        27,
        600,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        'center',
        W - 160
      );
    } else {
      ctx.beginPath();
      ctx.moveTo(isRtl ? W - 95 : 95, 480);
      ctx.lineTo(isRtl ? W - 340 : 340, 480);
      ctx.stroke();
      if (state.showNfc) drawCircularNfc(ctx, isRtl ? 110 : W - 110, 110, 38, col.nfc);
      drawMainLogo(ctx, isRtl ? W - 165 : 165, 160, 130, state, images);

      const tx = isRtl ? W - 95 : 95;
      ctx.textAlign = isRtl ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col.company;
      ctx.font = `800 52px ${fontFamily}`;
      ctx.fillText(compTxt, tx, 550, 780);

      drawBadgedText(
        ctx,
        sloganTxt,
        tx,
        632,
        28,
        600,
        col.slogan,
        state.sloganBadgeMode,
        col.sloganBadge,
        fontFamily,
        isRtl ? 'right' : 'left',
        700
      );
    }
  }
}

export function drawCardBack(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  isVert: boolean,
  state: CardDesignState,
  material: MaterialOption,
  images: LoadedCardImages,
  dir: 'rtl' | 'ltr'
) {
  if (images.fullBackImg) {
    drawFullDesignImage(ctx, images.fullBackImg, W, H, state.fullBackFit);
    return;
  }

  const bg = getEffectiveBg(state, 'back');
  const col = state.colors;
  const isRtl = dir === 'rtl';
  const fontFamily = resolveCanvasFontFamily() || CARD_FONT_STACK;

  drawCardBackground(ctx, W, H, bg, material);
  ctx.direction = isRtl ? 'rtl' : 'ltr';

  const nameTxt = state.name.trim() || 'فرهاد آریا';
  const roleTxt = state.role.trim();
  const qrPayload = resolveQrTargetUrl(state);

  if (isVert) {
    if (state.showQr) drawRealQR(ctx, qrPayload, W / 2 - 115, 115, 230, col.qr);

    ctx.strokeStyle = col.backLine1;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2, state.showQr ? 385 : 180);
    ctx.lineTo(W / 2, 675);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = col.name;
    ctx.font = `800 54px ${fontFamily}`;
    ctx.fillText(nameTxt, W / 2, 745, W - 90);

    drawBadgedText(
      ctx,
      roleTxt,
      W / 2,
      832,
      30,
      600,
      col.role,
      state.roleBadgeMode,
      col.roleBadge,
      fontFamily,
      'center',
      W - 140
    );

    ctx.strokeStyle = col.backLine2;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2, 895);
    ctx.lineTo(W / 2, 955);
    ctx.stroke();

    if (state.showNfc) drawCircularNfc(ctx, W / 2, 1035, 48, col.nfc);
    drawAryaSignature(ctx, 84, H - 76, 56, state, images);
  } else {
    if (state.showQr) drawRealQR(ctx, qrPayload, 110, H / 2 - 135, 270, col.qr);

    ctx.strokeStyle = col.backLine1;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(450, 125);
    ctx.lineTo(450, H - 125);
    ctx.stroke();

    const tx = isRtl ? W - 100 : 520;
    ctx.textAlign = isRtl ? 'right' : 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = col.name;
    ctx.font = `800 54px ${fontFamily}`;
    ctx.fillText(nameTxt, tx, 270, 580);

    drawBadgedText(
      ctx,
      roleTxt,
      tx,
      365,
      30,
      600,
      col.role,
      state.roleBadgeMode,
      col.roleBadge,
      fontFamily,
      isRtl ? 'right' : 'left',
      560
    );

    ctx.strokeStyle = col.backLine2;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx, 445);
    ctx.lineTo(isRtl ? tx - 260 : tx + 260, 445);
    ctx.stroke();

    if (state.showNfc) drawCircularNfc(ctx, isRtl ? W - 145 : 565, 555, 44, col.nfc);
    drawAryaSignature(ctx, isRtl ? 84 : W - 84, H - 74, 54, state, images);
  }
}

/**
 * Loads an image safely with CORS verification so canvas.toDataURL() never throws SecurityError.
 */
export function loadCorsSafeImage(src: string | null | undefined): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src || !src.trim()) {
      resolve(null);
      return;
    }
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        const testCnv = document.createElement('canvas');
        testCnv.width = 4;
        testCnv.height = 4;
        const tc = testCnv.getContext('2d');
        if (!tc) {
          resolve(null);
          return;
        }
        tc.drawImage(img, 0, 0, 4, 4);
        tc.getImageData(0, 0, 1, 1);
        resolve(img);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generates high-resolution PNG Data URLs for Front & Back faces of the card ready for print production.
 */
export function renderPrintReadyDataUrls(
  state: CardDesignState,
  material: MaterialOption,
  images: LoadedCardImages,
  dir: 'rtl' | 'ltr'
): { frontDataUrl: string; backDataUrl: string } {
  const isVert = state.orientation === 'vertical';
  const W = isVert ? VW : HW;
  const H = isVert ? VH : HH;

  const frontCnv = document.createElement('canvas');
  frontCnv.width = W;
  frontCnv.height = H;
  const fCtx = frontCnv.getContext('2d');
  if (fCtx) {
    drawCardFront(fCtx, W, H, isVert, state, material, images, dir);
  }

  const backCnv = document.createElement('canvas');
  backCnv.width = W;
  backCnv.height = H;
  const bCtx = backCnv.getContext('2d');
  if (bCtx) {
    drawCardBack(bCtx, W, H, isVert, state, material, images, dir);
  }

  return {
    frontDataUrl: frontCnv.toDataURL('image/png'),
    backDataUrl: backCnv.toDataURL('image/png'),
  };
}
