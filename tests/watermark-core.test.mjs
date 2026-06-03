import assert from "node:assert/strict";

import {
  createWatermarkTiles,
  getCanvasRotationRadians,
  getPreviewPageNumbers,
  hexToRgb,
  makeOutputFileName,
  PREVIEW_PAGE_LIMIT,
  QUICK_COLORS,
  WATERMARK_ROTATION_DEGREES,
} from "../src/watermark-core.mjs";

const almostEqual = (actual, expected) => {
  assert.ok(Math.abs(actual - expected) < 0.0001, `${actual} !== ${expected}`);
};

{
  const color = hexToRgb("#336699");

  almostEqual(color.r, 0.2);
  almostEqual(color.g, 0.4);
  almostEqual(color.b, 0.6);
}

assert.throws(() => hexToRgb("336699"), /Invalid hex color/);

{
  const tiles = createWatermarkTiles({
    pageWidth: 600,
    pageHeight: 800,
    textWidth: 140,
    fontSize: 36,
    gap: 120,
  });

  assert.ok(tiles.length > 20, "expected repeated watermarks across the page");
  assert.ok(tiles.some((tile) => tile.x < 0 && tile.y < 0), "expected off-page start coverage");
  assert.ok(tiles.some((tile) => tile.x > 600 && tile.y > 800), "expected off-page end coverage");
}

assert.equal(makeOutputFileName("contract.pdf"), "contract-watermarked.pdf");
assert.equal(makeOutputFileName("scan"), "scan-watermarked.pdf");

assert.equal(WATERMARK_ROTATION_DEGREES, 32);
almostEqual(getCanvasRotationRadians(), (-32 * Math.PI) / 180);

assert.equal(PREVIEW_PAGE_LIMIT, 5);
assert.deepEqual(getPreviewPageNumbers(3), [1, 2, 3]);
assert.deepEqual(getPreviewPageNumbers(8), [1, 2, 3, 4, 5]);

assert.deepEqual(
  QUICK_COLORS.map((color) => color.value),
  ["#000000", "#ffffff", "#808080", "#dc2626", "#2563eb"],
);
