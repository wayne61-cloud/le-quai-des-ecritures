import { copyFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputDir = "gh-pages-dist";
const builtHtml = join(outputDir, "index.pages.html");
const indexHtml = join(outputDir, "index.html");

await writeFile(join(outputDir, ".nojekyll"), "");
await rename(builtHtml, indexHtml);
await copyFile(indexHtml, join(outputDir, "404.html"));
