/* ===========================================================================
   PRERENDER — the change that actually makes this site indexable.

   Before: every URL served the same 20-line shell with an empty <div id="root">.
   Google renders JavaScript, eventually and on its own schedule; Bing does so
   far less reliably; Yandex and most AI answer crawlers barely at all. So the
   whole portfolio was, to most of the web's index, one untitled blank page.

   After: `vite build` is followed by a real browser visiting each route and
   writing the finished DOM to disk, so /am/projects/cloudchipr is a directory
   containing an index.html with the actual case-study text, the right <title>,
   its canonical link and its JSON-LD graph. Apache serves that file directly
   (see section 4 of public/.htaccess).

   WHY A REAL BROWSER AND NOT renderToString. The app is not SSR-safe: GSAP,
   ScrollTrigger, three.js and several components touch `window` during render.
   Making it SSR-safe would mean changing the animation code, which is exactly
   what Davit asked me not to touch. A headless browser runs the app the way a
   visitor does and needs no source changes at all.

   THIS IS NOT CLOAKING. The HTML written here is precisely what a browser
   produces for that URL; the crawler and the visitor get the same page.
   =========================================================================== */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import seo from "../src/seo/routes.generated.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon"
};

/* A static server that mirrors the .htaccess rules: real file first, SPA shell
   otherwise. Prerendering against anything else would capture a page the live
   host never serves. */
const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const candidates = [
    path.join(dist, url),
    path.join(dist, url, "index.html"),
    path.join(dist, "index.html")
  ];
  for (const file of candidates) {
    if (!file.startsWith(dist)) continue;
    try {
      const info = await stat(file);
      if (!info.isFile()) continue;
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
      res.end(body);
      return;
    } catch { /* try the next candidate */ }
  }
  res.writeHead(404).end("not found");
});

const port = await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", () => resolve(server.address().port));
});
const origin = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  /* Reduced motion so GSAP settles immediately rather than mid-flight: the
     prerendered DOM should be the page's RESTING state, which is also the
     state that carries all the text. */
  reducedMotion: "reduce",
  userAgent:
    "Mozilla/5.0 (compatible; PedanyanPrerender/1.0; +https://pedanyan.com) HeadlessChrome"
});

/* Media is pure weight here — the DOM is what we want, not the pixels. */
await page.route("**/*", (route) => {
  const type = route.request().resourceType();
  if (type === "image" || type === "media" || type === "font") return route.abort();
  return route.continue();
});

const routes = seo.routes.map((r) => r.path);
const written = [];
const failed = [];

for (const route of routes) {
  const target = `${origin}${route}`;
  try {
    await page.goto(target, { waitUntil: "networkidle", timeout: 45000 });

    /* Content is real when the router has mounted AND the lazy case-study
       chunk has resolved. Waiting on <main> alone captures the shell. */
    await page.waitForFunction(
      () => {
        const main = document.querySelector("main.dw-page");
        if (!main) return false;
        return (main.textContent || "").trim().length > 400;
      },
      { timeout: 30000 }
    );
    /* one more tick so the head manager's effect has flushed */
    await page.waitForTimeout(400);

    let html = await page.content();

    /* The dev server's module script must not survive into the built file, and
       the release marker is set by main.tsx anyway. */
    html = html.replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/g, "");

    const dir = route === "/" ? dist : path.join(dist, route);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), html, "utf8");
    written.push(`${route}  (${Math.round(html.length / 1024)} KB)`);
  } catch (error) {
    failed.push(`${route} — ${error.message.split("\n")[0]}`);
  }
}

await browser.close();
server.close();

console.log(`prerender: ${written.length}/${routes.length} routes written`);
written.forEach((w) => console.log(`  ok    ${w}`));
if (failed.length) {
  failed.forEach((f) => console.log(`  FAIL  ${f}`));
  /* A route that silently falls back to the SPA shell is worse than a failed
     build, because nobody notices until the page has been missing from the
     index for a month. */
  process.exitCode = 1;
}
