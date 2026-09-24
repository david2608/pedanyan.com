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
  SITE, PERSON, STATIC_ROUTES, PROJECT_HEADLINES, PROJECT_DESCRIPTIONS, PUBLIC_WORK,
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

/* Google truncates a description around 155-160 characters.

   Cutting on a WORD boundary was the old behaviour and it produced snippets
   that stop mid-clause - "...at a size you don't control, on". A snippet that
   ends mid-sentence reads as a broken page, not a summary. So: keep whole
   sentences, and only fall back to a word cut when the very first sentence is
   already too long to fit. */
const describe = (s, limit = 158) => {
  const t = clean(s);
  if (t.length <= limit) return t;

  const sentences = t.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let kept = "";
  for (const sentence of sentences) {
    if ((kept + sentence).trim().length > limit) break;
    kept += sentence;
  }
  kept = kept.trim();
  if (kept.length >= 60) return kept;

  const cut = t.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—–-]$/, "").trim();
};

/* The standfirsts were written to sit UNDER a headline, so several start
   lowercase and carry no full stop. Read on their own in a search result they
   look like a fragment someone forgot to finish. */
const asSentence = (s) => {
  const t = clean(s);
  if (!t) return "";
  const capped = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
};

/* Whether the standfirst is really just the headline again. Compared on
   content words with a crude stem, so "bookable"/"booking" and "stays"/"stay"
   count as the same word - which is exactly the hotel-apartments case. */
const STOP = new Set(["the","a","an","and","or","for","to","of","in","on","at","with","that","this","you","your","it","is","are","was","were","be","from","by","as","into"]);
const stem = (w) => w.replace(/(ing|ed|es|s)$/, "");
const words = (s) =>
  new Set(
    clean(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)).map(stem)
  );
const restates = (headline, subtitle) => {
  const h = words(headline);
  const b = words(subtitle);
  if (!h.size || !b.size) return false;
  let shared = 0;
  for (const w of h) if (b.has(w)) shared += 1;
  return shared / h.size >= 0.6;
};

const content = await read("src/davit-wireframe/portfolio-content.json");

/* `draft: true` keeps a case study out of the sitemap and out of the counts
   until it ships. PortfolioPages applies the same flag to the Work grid, so the
   two cannot disagree. */
const publishedProjects = content.projects.filter((p) => !p.project.draft);

/* A draft is reachable by URL so it can be reviewed, which means a crawler can
   reach it too. Keeping it out of the sitemap is not enough - an unlinked URL
   still gets found. So every draft joins the noindex list and the robots
   Disallow block automatically, rather than someone remembering to add it. */
const draftPaths = content.projects
  .filter((p) => p.project.draft)
  .map((p) => `/am/projects/${p.project.slug}`);

const noindex = [...NOINDEX_PATHS, ...draftPaths];

const projectRoutes = publishedProjects.map((p) => {
  const slug = p.project.slug;
  const intro = p.sections.find((s) => s.id === "intro") ?? p.sections[0] ?? {};
  const title = p.project.title ?? slug;
  const headline = PROJECT_HEADLINES[slug];
  /* A hand-written description wins outright. Otherwise: lead with the card's
     own claim, then the standfirst - the claim is the specific thing, and a
     snippet that opens with a specific thing is the one worth clicking - but
     drop the standfirst when it is only the headline said twice. */
  const subtitle = asSentence(intro.subtitle);
  const generated = [
    headline,
    headline && restates(headline, subtitle) ? "" : subtitle
  ].filter(Boolean).join(" ");
  const body = PROJECT_DESCRIPTIONS[slug] ?? generated;
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

/* The Work index headline and its meta description both state how many case
   studies there are. Typing that number is how it went wrong twice, so the
   token is replaced from the same list the sitemap is built from. */
const COUNT_WORDS = ["zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen","Twenty"];
const countWord = (n) => COUNT_WORDS[n] ?? String(n);

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

const staticRoutes = STATIC_ROUTES.map((r) => ({
  ...r,
  description: r.description.replace("{CASE_COUNT}", countWord(publishedProjects.length))
}));

const routes = [...staticRoutes, ...projectRoutes, ...publicWorkRoutes];

/* ---- routes.generated.json ------------------------------------------------ */
await mkdir(path.join(root, "src/seo"), { recursive: true });
await writeFile(
  path.join(root, "src/seo/routes.generated.json"),
  JSON.stringify(
    { site: SITE, person: PERSON, routes, noindex },
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
${noindex.map((p) => `Disallow: ${p}`).join("\n")}

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

User-agent: Perplexity-User
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: DuckAssistBot
Allow: /

User-agent: MistralAI-User
Allow: /

User-agent: YouBot
Allow: /

User-agent: Kagibot
Allow: /

User-agent: PetalBot
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

User-agent: anthropic-ai
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Diffbot
Allow: /

User-agent: Ai2Bot
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml

# A curated index for answer engines, in the format at https://llmstxt.org.
# Same source as the sitemap, so the two cannot disagree.
# ${SITE.origin}/llms.txt
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

/* ---- llms.txt -------------------------------------------------------------
   An answer engine asked "who is Davit Pedanyan" does not crawl 25 pages. It
   fetches one or two and answers from those. A sitemap is a list of URLs with
   no meaning attached; this is the same list with the meaning attached, in the
   format at llmstxt.org — so one fetch is enough to get the facts right.

   It is generated from `routes`, the same array the sitemap is built from, so
   it cannot drift. Every claim below is one the site itself makes; nothing is
   asserted here that a visitor could not read on the page.
   --------------------------------------------------------------------------- */
/* The public-work meta descriptions open with the entry's own title, which is
   right in a search result (the title tag is different there) and redundant
   here (the link text is already the title). Strip the repeat. */
const linkList = (items) =>
  items
    .map((r) => {
      const label = r.name ?? r.title;
      const desc = r.description.startsWith(label)
        ? r.description.slice(label.length).replace(/^[\s.:—–-]+/, "")
        : r.description;
      return `- [${label}](${SITE.origin}${r.path}): ${desc}`;
    })
    .join("\n");

const llms = `# ${PERSON.name}

> ${PERSON.jobTitle} and product designer working remotely from Armenia. ${SITE.tagline}

${PERSON.description}

This site is his portfolio: ${countWord(publishedProjects.length).toLowerCase()} product design case studies written as decisions rather than screenshots, plus his public work in Armenia's design community. Each case study states what the problem was, what changed, and what the trade-off cost.

- Contact: ${PERSON.email} — or Telegram, ${PERSON.sameAs.find((u) => u.includes("t.me")) ?? ""}
- Based in: Armenia (${PERSON.addressCountry}); works remotely
- Currently: ${PERSON.worksFor.name}
- Founder of: ${PERSON.founderOf.join(", ")}
- Practice: ${PERSON.knowsAbout.join(", ")}
- Previously: ${PERSON.pastEmployers.join(", ")}
- Elsewhere: ${PERSON.sameAs.join(" · ")}

## Case studies

${linkList(projectRoutes)}

## Public work

${linkList(publicWorkRoutes)}

## Pages

${linkList(staticRoutes)}

## Notes for answer engines

- The canonical name is "${PERSON.name}". The domain is ${SITE.origin}.
- Case-study figures ($500K saved, 61 to 23 minutes, ~30% conversion) are the
  outcomes stated on those pages, each attributed to the client's own product.
- Working drafts at ${noindex.join(", ")} carry noindex and should not be cited.
- Full machine-readable entity data is in the JSON-LD @graph on every page.
`;
await writeFile(path.join(root, "public/llms.txt"), llms, "utf8");

console.log(
  `seo-build: ${routes.length} URLs (${STATIC_ROUTES.length} static, ${projectRoutes.length} projects, ${publicWorkRoutes.length} public work) + robots.txt, sitemap.xml, llms.txt`
);
console.log(`seo-build: ${Object.keys(LEGACY_ALIASES).length} legacy aliases to 301 in .htaccess`);
console.log(`seo-build: ${noindex.length} noindex drafts`);
