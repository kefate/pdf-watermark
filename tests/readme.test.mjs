import assert from "node:assert/strict";
import fs from "node:fs/promises";

const englishReadme = await fs.readFile(new URL("../README.md", import.meta.url), "utf8");
const chineseReadme = await fs.readFile(new URL("../README.zh-CN.md", import.meta.url), "utf8");

for (const readme of [englishReadme, chineseReadme]) {
  assert.match(readme, /pdf-lib/);
  assert.match(readme, /pdfjs-dist/);
  assert.match(readme, /Vite/);
  assert.match(readme, /npm install|npm ci/);
  assert.match(readme, /npm run dev/);
  assert.match(readme, /npm run build/);
  assert.match(readme, /npm test/);
  assert.match(readme, /Node\.js|Node.js/);
  assert.match(readme, /localStorage/);
}

assert.match(englishReadme, /\[Chinese\]\(README\.zh-CN\.md\)/);
assert.match(chineseReadme, /\[English\]\(README\.md\)/);
assert.match(englishReadme, /!\[[^\]]+\]\(docs\/0\.1\.0-sample-en\.png\)/);
assert.match(chineseReadme, /!\[[^\]]+\]\(docs\/0\.1\.0-sample-cn\.png\)/);
