/* ===========================================================================
   IndexNow — ping Bing, Yandex and Seznam that URLs changed.

   WHAT IT DOES AND DOES NOT DO. IndexNow tells participating engines that a
   URL is worth re-fetching. It does not guarantee indexing, it does not affect
   ranking, and GOOGLE DOES NOT PARTICIPATE — Google trialled it and never
   adopted it, so for Google the sitemap plus Search Console remain the route.
   Submitting here is a crawl hint, nothing more.

   WHY IT SUITS THIS SITE. The host is plain Apache over FTP with no build
   hooks, so there is no server-side "content changed" event. A deploy IS the
   change event, which makes a post-deploy CI step the natural trigger.

   The key file must stay reachable at https://pedanyan.com/<key>.txt and must
   contain exactly the key — that file is how the API proves the submitter
   controls the domain. It is published on purpose and is not a secret.
   =========================================================================== */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const KEY = "3f5f2a58ccf65b2a66f7f2ca5eff3e29";
const ENDPOINT = "https://api.indexnow.org/IndexNow";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seo = JSON.parse(await readFile(path.join(root, "src/seo/routes.generated.json"), "utf8"));

const host = new URL(seo.site.origin).host;
const urlList = seo.routes.map((r) => `${seo.site.origin}${r.path === "/" ? "/" : r.path}`);

const body = {
  host,
  key: KEY,
  keyLocation: `${seo.site.origin}/${KEY}.txt`,
  urlList
};

if (process.argv.includes("--dry-run")) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body)
});

/* 200 = accepted, 202 = accepted but the key is still being validated. Both
   are success. 403 means the key file is not reachable — check it deployed. */
console.log(`indexnow: HTTP ${res.status} for ${urlList.length} URLs`);
if (res.status === 403) {
  console.log(`indexnow: 403 usually means ${body.keyLocation} is not reachable yet.`);
}
if (!res.ok && res.status !== 202) {
  console.log(await res.text());
  process.exitCode = 1;
}
