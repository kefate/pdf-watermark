import assert from "node:assert/strict";

import {
  WATERMARK_SETTINGS_STORAGE_KEY,
  loadStoredWatermarkSettings,
  saveWatermarkSettings,
} from "../src/settings-storage.mjs";
import { DEFAULT_WATERMARK } from "../src/watermark-core.mjs";

class MemoryStorage {
  #items = new Map();

  getItem(key) {
    return this.#items.has(key) ? this.#items.get(key) : null;
  }

  setItem(key, value) {
    this.#items.set(key, String(value));
  }
}

const storage = new MemoryStorage();

assert.equal(loadStoredWatermarkSettings(storage), null);

saveWatermarkSettings(storage, {
  text: "Internal use",
  color: "#2563eb",
  fontSize: "68",
  gap: "180",
  opacity: "0.4",
});

assert.deepEqual(JSON.parse(storage.getItem(WATERMARK_SETTINGS_STORAGE_KEY)), {
  text: "Internal use",
  color: "#2563eb",
  fontSize: 68,
  gap: 180,
  opacity: 0.4,
});

assert.deepEqual(loadStoredWatermarkSettings(storage), {
  text: "Internal use",
  color: "#2563eb",
  fontSize: 68,
  gap: 180,
  opacity: 0.4,
});

storage.setItem(
  WATERMARK_SETTINGS_STORAGE_KEY,
  JSON.stringify({
    text: "",
    color: "red",
    fontSize: "999",
    gap: "0",
    opacity: "3",
    fileName: "private.pdf",
  }),
);

assert.deepEqual(loadStoredWatermarkSettings(storage), {
  text: DEFAULT_WATERMARK.text,
  color: DEFAULT_WATERMARK.color,
  fontSize: 120,
  gap: 24,
  opacity: 1,
});

storage.setItem(WATERMARK_SETTINGS_STORAGE_KEY, "{");
assert.equal(loadStoredWatermarkSettings(storage), null);
