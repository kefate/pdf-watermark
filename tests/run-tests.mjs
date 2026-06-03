import fs from "node:fs/promises";

const testFiles = (await fs.readdir(new URL(".", import.meta.url)))
  .filter((fileName) => fileName.endsWith(".test.mjs"))
  .sort();

for (const testFile of testFiles) {
  await import(`./${testFile}?run=${Date.now()}-${Math.random()}`);
  console.log(`PASS ${testFile}`);
}
