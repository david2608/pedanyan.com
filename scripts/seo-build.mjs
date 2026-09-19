/* ===========================================================================
   Emits, from ONE source of truth (scripts/seo/site-meta.mjs + the portfolio
   content JSON the app itself renders):

     public/robots.txt
     public/sitemap.xml
     src/seo/routes.generated.json   (consumed by the browser head manager)

   Run before every build. Because the sitemap and the head metadata come from
   the same list, a project added to portfolio-content.json cannot end up in
   one and missing from the other.
   =========================================================================== */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  SITE, PERSON, STATIC_ROUTES, PROJECT_HEADLINES, PUBLIC_WORK,
  NOINDEX_PATHS, LEGACY_ALIASES
} from "./seo/site-meta.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (p) => JSON.parse(await readFile(path.join(root, p), "utf8"));

const clean = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

/* Google truncates a description around 155-160 characters. Cutting on a word
   boundary and appending nothing is better than an ellipsis, which reads as
   truncated copy rather than a summary. */
const describe = (s, limit = 158) => {
  const t = clean(s);
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—-]$/, "");
};

const content = await read("src/davit-wireframe/portfolio-content.json");

const projectRoutes = content.projects.map((p) => {
  const slug = p.project.slug;
  const intro = p.sections.find((s) => s.id === "intro") ?? p.sections[0] ?? {};
  const title = p.project.title ?? slug;
  const headline = PROJECT_HEADLINES[slug];
  /* The description leads with the card's own claim, then the standfirst: the
     claim is the specific thing, and a snippet that opens with a specific
     thing is the one worth clicking. */
  const body = [headline, clean(intro.subtitle)].filter(Boolean).join(" ");
  return {
    path: `/am/projects/${slug}`,
    title: `${title} — Case Study by Davit Pedanyan`,
    description: describe(body),
    type: "CreativeWork",
    name: title,
    headline: headline ?? null,
    priority: "0.8",
    changefreq: "yearly"
  };
});

const publicWorkRoutes = PUBLIC_WORK.map((e) => ({
  path: `/am/public-work/${e.slug}`,
  title: `${clean(e.title)} — Davit Pedanyan`,
  description: describe(
    `${clean(e.title)} Public work by Davit Pedanyan, product designer and educator in Armenia.`
  ),
  type: "Article",
  name: clean(e.title),
  datePublished: e.published ?? null,
  inLanguage: e.lang ?? SITE.locale,
  priority: "0.6",
  changefreq: "yearly"
}));

const routes = [...STATIC_ROUTES, ...projectRoutes, ...publicWorkRoutes];

/* ---- routes.generated.json ------------------------------------------------ */
await mkdir(path.join(root, "src/seo"), { recursive: true });
await writeFile(
  path.join(root, "src/seo/routes.generated.json"),
  JSON.stringify(
    { site: SITE, person: PERSON, routes, noindex: NOINDEX_PATHS },
    null,
    2
  ) + "\n",
  "utf8"
);

/* ---- robots.txt -----------------------------------------------------------
   An allow-list of named agents would be a trap: it silently blocks every
   crawler nobody thought to name. `User-agent: *` with a full Allow is the
   correct default, and the named blocks below exist only to be explicit about
   the agents Davit asked about — they grant nothing extra, they just make the
   file self-documenting and survive a future reviewer adding a Disallow.

   No crawl-delay: Google ignores it outright and Bing/Yandex honour it, so
   setting one can only ever slow indexing on a site this size.
   --------------------------------------------------------------------------- */
const robots = `# https://pedanyan.com — robots.txt
# Everything is public. Nothing here is a paywall, a staging copy or a login.

User-agent: *
Allow: /

# Working drafts kept reachable by URL for comparison, deliberately unlinked.
# They are near-duplicates of the live case studies, so they are excluded from
# crawling as well as carrying a noindex tag.
${NOINDEX_PATHS.map((p) => `Disallow: ${p}`).join("\n")}

# Search crawlers (explicit, for clarity — all are already covered by *)
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: YandexBot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Applebot
Allow: /

# AI answer engines that surface links back to the source.
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: cohere-ai
Allow: /

# Model-training crawlers that do not send traffic back are a separate
# decision from search indexing. They are ALLOWED here because Davit has not
# asked to opt out; removing a name from this list does not block it — only
# adding a Disallow line under that agent does.
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`;
await writeFile(path.join(root, "public/robots.txt"), robots, "utf8");

/* ---- sitemap.xml ---------------------------------------------------------- */
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map(
    (r) => `  <url>
    <loc>${SITE.origin}${r.path === "/" ? "/" : r.path}</loc>
    <lastmod>${r.datePublished ?? today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n");

await writeFile(
  path.join(root, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  "utf8"
);

console.log(
  `seo-build: ${routes.length} URLs (${STATIC_ROUTES.length} static, ${projectRoutes.length} projects, ${publicWorkRoutes.length} public work)`
);
console.log(`seo-build: ${Object.keys(LEGACY_ALIASES).length} legacy aliases to 301 in .htaccess`);
console.log(`seo-build: ${NOINDEX_PATHS.length} noindex drafts`);
