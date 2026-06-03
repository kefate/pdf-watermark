import assert from "node:assert/strict";

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, TRANSLATIONS } from "../src/i18n.mjs";

assert.equal(DEFAULT_LANGUAGE, "en");
assert.deepEqual(SUPPORTED_LANGUAGES, ["en", "zh"]);

const englishKeys = Object.keys(TRANSLATIONS.en).sort();
const chineseKeys = Object.keys(TRANSLATIONS.zh).sort();

assert.deepEqual(chineseKeys, englishKeys);
assert.ok(TRANSLATIONS.en.generateButton.length > 0);
assert.ok(TRANSLATIONS.zh.generateButton.length > 0);
assert.ok(TRANSLATIONS.en.statusPreviewReady.includes("{count}"));
assert.ok(TRANSLATIONS.zh.statusPreviewReady.includes("{count}"));
assert.equal(TRANSLATIONS.en.githubLink, "GitHub ↗");
assert.equal(TRANSLATIONS.zh.githubLink, "GitHub ↗");
assert.equal(
  TRANSLATIONS.zh.privacyLine,
  "\ud83d\udd12 \u96f6\u7f51\u7edc\u8bf7\u6c42 \u00b7 \u5b8c\u5168\u79bb\u7ebf\u53ef\u7528 \u00b7 \u9690\u79c1\u81f3\u4e0a",
);
