import assert from "node:assert/strict";
import fs from "node:fs/promises";

const packageJson = JSON.parse(await fs.readFile(new URL("../package.json", import.meta.url), "utf8"));
const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
const viteConfig = await fs.readFile(new URL("../vite.config.js", import.meta.url), "utf8");
const lockfile = JSON.parse(await fs.readFile(new URL("../package-lock.json", import.meta.url), "utf8"));
const workflow = await fs.readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");
const gitignore = await fs.readFile(new URL("../.gitignore", import.meta.url), "utf8");

assert.equal(packageJson.type, "module");
assert.equal(packageJson.scripts.dev, "vite");
assert.equal(packageJson.scripts.build, "vite build");
assert.equal(packageJson.scripts.test, "node tests/run-tests.mjs");
assert.ok(packageJson.dependencies["pdf-lib"]);
assert.ok(packageJson.dependencies["pdfjs-dist"]);
assert.ok(packageJson.devDependencies.vite);

assert.match(viteConfig, /base:\s*["']\.\/["']/);
assert.match(html, /src="\/src\/app\.js"/);
assert.doesNotMatch(html, /vendor\//);

assert.ok(lockfile.packages["node_modules/pdf-lib"]);
assert.ok(lockfile.packages["node_modules/pdfjs-dist"]);
assert.ok(lockfile.packages["node_modules/vite"]);

assert.match(workflow, /actions\/checkout@v4/);
assert.match(workflow, /actions\/setup-node@v4/);
assert.match(workflow, /node-version:\s*22/);
assert.match(workflow, /npm ci/);
assert.match(workflow, /npm test/);
assert.match(workflow, /npm run build/);
assert.match(workflow, /actions\/upload-pages-artifact@v3/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(workflow, /path:\s*dist/);

assert.match(gitignore, /node_modules\//);
assert.match(gitignore, /dist\//);
