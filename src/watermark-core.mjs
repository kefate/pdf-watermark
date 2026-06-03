export const DEFAULT_WATERMARK = {
  text: "CONFIDENTIAL",
  color: "#1f2937",
  fontSize: 42,
  gap: 120,
  opacity: 0.22,
};

export const WATERMARK_ROTATION_DEGREES = 32;
export const PREVIEW_PAGE_LIMIT = 5;

export const QUICK_COLORS = [
  { key: "colorBlack", value: "#000000" },
  { key: "colorWhite", value: "#ffffff" },
  { key: "colorGray", value: "#808080" },
  { key: "colorRed", value: "#dc2626" },
  { key: "colorBlue", value: "#2563eb" },
];

export function hexToRgb(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error("Invalid hex color");
  }

  const value = Number.parseInt(hex.slice(1), 16);

  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
  };
}

export function createWatermarkTiles({ pageWidth, pageHeight, textWidth, fontSize, gap }) {
  const horizontalStep = Math.max(textWidth + gap, gap);
  const verticalStep = Math.max(fontSize + gap, gap);
  const startX = -horizontalStep;
  const startY = -verticalStep;
  const endX = pageWidth + horizontalStep;
  const endY = pageHeight + verticalStep;
  const tiles = [];

  let row = 0;
  for (let y = startY; y <= endY; y += verticalStep) {
    const stagger = row % 2 === 0 ? 0 : horizontalStep / 2;

    for (let x = startX - stagger; x <= endX; x += horizontalStep) {
      tiles.push({ x, y });
    }

    row += 1;
  }

  return tiles;
}

export function makeOutputFileName(fileName) {
  const safeName = fileName.trim() || "watermarked";

  if (/\.pdf$/i.test(safeName)) {
    return safeName.replace(/\.pdf$/i, "-watermarked.pdf");
  }

  return `${safeName}-watermarked.pdf`;
}

export function getCanvasRotationRadians() {
  return (-WATERMARK_ROTATION_DEGREES * Math.PI) / 180;
}

export function getPreviewPageNumbers(pageCount) {
  const safePageCount = Math.max(0, Math.floor(Number(pageCount) || 0));
  const previewCount = Math.min(safePageCount, PREVIEW_PAGE_LIMIT);

  return Array.from({ length: previewCount }, (_, index) => index + 1);
}

export function normalizeWatermarkSettings(settings) {
  return {
    text: String(settings.text || DEFAULT_WATERMARK.text).trim() || DEFAULT_WATERMARK.text,
    color: /^#[0-9a-f]{6}$/i.test(settings.color) ? settings.color : DEFAULT_WATERMARK.color,
    fontSize: clamp(Number(settings.fontSize), 12, 120, DEFAULT_WATERMARK.fontSize),
    gap: clamp(Number(settings.gap), 24, 360, DEFAULT_WATERMARK.gap),
    opacity: clamp(Number(settings.opacity), 0.05, 1, DEFAULT_WATERMARK.opacity),
  };
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
