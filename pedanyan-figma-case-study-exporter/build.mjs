import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });

await build({
  entryPoints: ["src/code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  format: "iife",
  platform: "browser",
  target: "es2020"
});

const uiBundle = await build({
  entryPoints: ["src/ui.ts"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2020"
});

const template = await readFile("src/ui.html", "utf8");
const html = template.replace("/*__UI_BUNDLE__*/", uiBundle.outputFiles[0].text);
await writeFile("dist/ui.html", html);

console.log("Built dist/code.js and dist/ui.html");
