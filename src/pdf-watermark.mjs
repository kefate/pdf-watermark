import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

import { createWatermarkTiles, hexToRgb, WATERMARK_ROTATION_DEGREES } from "./watermark-core.mjs";

export async function addWatermarkToPdfBytes(pdfBytes, settings) {
  const pdfDocument = await PDFDocument.load(pdfBytes);
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const color = hexToRgb(settings.color);
  const pages = pdfDocument.getPages();
  const watermarkColor = rgb(color.r, color.g, color.b);

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(settings.text, settings.fontSize);
    const tiles = createWatermarkTiles({
      pageWidth: width,
      pageHeight: height,
      textWidth,
      fontSize: settings.fontSize,
      gap: settings.gap,
    });

    for (const tile of tiles) {
      page.drawText(settings.text, {
        x: tile.x,
        y: tile.y,
        size: settings.fontSize,
        font,
        color: watermarkColor,
        opacity: settings.opacity,
        rotate: degrees(WATERMARK_ROTATION_DEGREES),
      });
    }
  }

  return pdfDocument.save();
}
