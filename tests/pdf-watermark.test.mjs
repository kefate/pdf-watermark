import assert from "node:assert/strict";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { addWatermarkToPdfBytes } from "../src/pdf-watermark.mjs";

const sourceDocument = await PDFDocument.create();
const sourceFont = await sourceDocument.embedFont(StandardFonts.Helvetica);

for (const label of ["Page 1", "Page 2"]) {
  const page = sourceDocument.addPage();
  page.drawText(label, {
    x: 48,
    y: 740,
    size: 24,
    font: sourceFont,
    color: rgb(0.1, 0.1, 0.1),
  });
}

const sourceBytes = await sourceDocument.save();
const outputBytes = await addWatermarkToPdfBytes(
  sourceBytes,
  {
    text: "TEST WATERMARK",
    color: "#0f766e",
    fontSize: 36,
    gap: 90,
    opacity: 0.3,
  },
);
const outputDocument = await PDFDocument.load(outputBytes);

assert.equal(outputDocument.getPageCount(), 2);
assert.ok(outputBytes.length > sourceBytes.length, "expected watermark output to add PDF content");
