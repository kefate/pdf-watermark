import { normalizeWatermarkSettings } from "./watermark-core.mjs";

export const WATERMARK_SETTINGS_STORAGE_KEY = "pdfWatermarkSettings";

export function loadStoredWatermarkSettings(storage) {
  try {
    const rawSettings = storage?.getItem(WATERMARK_SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return null;
    }

    const parsedSettings = JSON.parse(rawSettings);

    if (!parsedSettings || typeof parsedSettings !== "object" || Array.isArray(parsedSettings)) {
      return null;
    }

    return toStoredSettings(parsedSettings);
  } catch {
    return null;
  }
}

export function saveWatermarkSettings(storage, settings) {
  try {
    storage?.setItem(WATERMARK_SETTINGS_STORAGE_KEY, JSON.stringify(toStoredSettings(settings)));
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
}

function toStoredSettings(settings) {
  const normalized = normalizeWatermarkSettings(settings);

  return {
    text: normalized.text,
    color: normalized.color,
    fontSize: normalized.fontSize,
    gap: normalized.gap,
    opacity: normalized.opacity,
  };
}
