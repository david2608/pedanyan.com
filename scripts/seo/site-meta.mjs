/* ===========================================================================
   THE SINGLE SOURCE OF TRUTH FOR EVERYTHING A SEARCH ENGINE SEES.
   ---------------------------------------------------------------------------
   Plain ESM on purpose: this file is imported by BOTH the Node build scripts
   (which write robots.txt, the sitemap and the prerendered HTML) and, via the
   JSON it generates, by the browser head manager. One list, so the sitemap can
   never drift from the router.

   EVERY FACT BELOW IS QUOTED FROM THE REPO. Nothing here is inferred, rounded
   up or filled in from outside knowledge. Where the project does not state
   something — a city, a degree, an award, a certification — the field is
   simply absent rather than guessed, because a structured-data graph that
   asserts something unverifiable is worse than one that says less.
   =========================================================================== */

export const SITE = {
  /* CONFIRM BEFORE DEPLOY: every canonical URL, the sitemap and every og:url
     is built from this. If the live site answers on www., change it here and
     nowhere else. */
  origin: "https://pedanyan.com",
  name: "Davit Pedanyan",
  shortName: "Pedanyan",
  /* siteData.ts:5 */
  tagline: "Designer, educator, and creative culture builder from Armenia.",
  locale: "en",
  /* public/brand — replaced by the build if a better share image exists */
  ogImage: "/brand/og-default.png",
  ogImageWidth: 1200,
  ogImageHeight: 630
};

/* ---------------------------------------------------------------------------
   THE PERSON. Only what the repository already asserts.

   Deliberately NOT included, because the repo does not state them and I will
   not invent them: date of birth, street address or city, alumniOf, any
   degree, certification, award or honour. `worksFor` carries no dates because
   most `years` values in notionContent.generated.json read "Verify dates".
   --------------------------------------------------------------------------- */
export const PERSON = {
  name: "Davit Pedanyan",
  /* notionContent.generated.json:166-167 — current role. An array because the
     site describes him all three ways and an entity resolver should match any
     of them, not just the current title. */
  jobTitle: ["Head of Design", "Product Designer", "Design Leader"],
  /* public/hero-frames/avatar.webp — the portrait the site already uses in the
     contact chat. A Person node with no image is a weaker entity. */
  image: "/hero-frames/avatar.webp",
  /* CONFIRMED BY DAVIT, 24 Sep 2026, from his own CV — the only fact in this
     file that is not quoted from the repo, and it is here because working
     language is decisive for the remote roles this site is aimed at. Delete
     these three lines if that ever stops being accurate. */
  knowsLanguage: [
    { code: "hy", name: "Armenian" },
    { code: "ru", name: "Russian" },
    { code: "en", name: "English" }
  ],
  /* siteData.ts:5, :7 and notionContent.generated.json:44-49 */
  description:
    "Davit Pedanyan is a product designer, design leader and educator from Armenia. He designs products, teaches beginners, and runs public formats for Armenia's creative community.",
  /* siteData.ts:5 — country only; no city is stated anywhere in the project */
  addressCountry: "AM",
  knowsAbout: [
    "Product Design",
    "Design Leadership",
    "Design Strategy",
    "DesignOps",
    "Design Systems",
    "User Experience Design",
    "User Interface Design",
    "Design Education",
    "Mentoring"
  ],
  /* Only URLs the site itself links to. The `socials` array in
     notionContent.generated.json:22-33 points at bare linkedin.com /
     instagram.com / facebook.com roots — placeholders, not profiles — so they
     are excluded: a sameAs pointing at a site's homepage asserts nothing and
     weakens the entity. */
  sameAs: [
    "https://www.linkedin.com/in/davit-pedanyan/",
    "https://medium.com/@pedanyandavid",
    "https://t.me/pedanyan"
  ],
  /* siteData.ts:122 */
  email: "davit@pedanyan.com",
  /* notionContent.generated.json:166 */
  worksFor: { name: "Freedx" },
  /* notionContent.generated.json:174-239, plus DavitWireframe.tsx:315-333 */
  pastEmployers: [
    "Lynon",
    "T-Bank",
    "Delux",
    "CloudChipr",
    "Webb Fontaine",
    "Material Exchange",
    "The Bank of London",
    "Uphold",
    "Liga Insurance",
    "Armenian Code Academy"
  ],
  /* siteData.ts:81 — "Founder of Pedanyan School and artmart" */
  founderOf: ["Pedanyan School", "artmart"]
};

/* ---------------------------------------------------------------------------
   STATIC ROUTES. `changefreq`/`priority` are advisory only — Google ignores
   both, Bing and Yandex treat them as weak hints. They are here because they
   cost nothing, not because they do much.
   --------------------------------------------------------------------------- */
export const STATIC_ROUTES = [
  {
    path: "/",
    title: "Davit Pedanyan — Product Designer and Design Leader, Armenia",
    description:
      "Product designer, design leader and educator from Armenia. Product design, design strategy, DesignOps and design systems for startup and enterprise teams.",
    type: "ProfilePage",
    priority: "1.0",
    changefreq: "monthly"
  },
  {
    path: "/am/portfolio",
    title: "Work — Case Studies by Davit Pedanyan",
    /* {CASE_COUNT} is filled in by seo-build from the published project list,
       so this sentence cannot go stale the way "Nine" did. */
    description:
      "{CASE_COUNT} product design case studies: the decisions behind each one, what changed, and the trade-offs. Fintech, insurance, cloud and marketplace products.",
    type: "CollectionPage",
    priority: "0.9",
    changefreq: "monthly"
  },
  {
    path: "/am/designer",
    title: "Davit Pedanyan — Designer Profile, Experience and Practice",
    description:
      "Twenty years of product design across fintech, insurance and enterprise platforms, and nine years teaching design in Armenia.",
    type: "ProfilePage",
    priority: "0.9",
    changefreq: "monthly"
  },
  {
    path: "/am/public-work",
    title: "Talks, Events and Writing — Davit Pedanyan",
    description:
      "Public work in Armenia's design community: UX Storm events, workshops, jury appearances, conference talks and published writing.",
    type: "CollectionPage",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    path: "/am/story",
    title: "Story — Davit Pedanyan, Designer, Educator, Culture Builder",
    description:
      "How the work fits together: designing products, teaching beginners, and building creative culture in Armenia.",
    type: "AboutPage",
    priority: "0.7",
    changefreq: "yearly"
  },
  {
    path: "/am/design-talent",
    title: "Design Talent — Davit Pedanyan",
    description:
      "Design talent and placement: designers trained through project work, critique and one finished portfolio case.",
    type: "WebPage",
    priority: "0.6",
    changefreq: "yearly"
  }
];

/* Card headlines, PortfolioPages.tsx:202-212 — the one-line claim each case
   study makes. Used as the meta description's first sentence, so the snippet
   says something specific rather than repeating the project name. */
export const PROJECT_HEADLINES = {
  "tinkoff-checkout": "From checkout drop-off to a clearer path to payment.",
  cloudchipr: "$500K saved in cloud costs.",
  "material-exchange": "Cut material management from 61 to 23 minutes.",
  securion: "Multi-factor security for digital assets.",
  "material-exchange-photo-lab": "Designed for 30% more material engagement.",
  "hotel-apartments": "Made extended stays bookable online.",
  tempo: "Safe document delivery, from sender to recipient.",
  icredo: "A loan conversation, not a long form.",
  liga: "An accident report you can file standing up.",
  "8images": "A configurator that works inside someone else’s page.",
  nesba: "One clear path from cash flow to investing."
};

/* ---------------------------------------------------------------------------
   HAND-WRITTEN META DESCRIPTIONS.

   The generated fallback is `headline + standfirst`, and for most projects that
   reads badly: the standfirst was written as a subtitle sitting UNDER the
   headline, so on its own it repeats it ("Made extended stays bookable online.
   online booking service specializing in extended-stay hotel room booking"),
   starts lowercase, and carries no full stop.

   A meta description is the two lines a hiring manager reads in a results page
   before deciding whether to open the case. Ten of them is an hour's work, so
   they are written by hand here. Every claim is one the case study itself
   makes — nothing is added.

   A project with no entry falls back to the generated join, which is now
   normalised and cut on sentence boundaries, so a new case study is never
   blocked on this list.
   --------------------------------------------------------------------------- */
export const PROJECT_DESCRIPTIONS = {
  /* tinkoffCase.tsx — "Conversion improved by approximately 30%." */
  "tinkoff-checkout":
    "Rebuilding trust and purchase context in the Tinkoff e-commerce checkout, for roughly a 30% relative improvement in conversion.",
  cloudchipr:
    "A cloud-cost platform that saved customers $500K, by making cost operations something engineering and finance teams could act on together.",
  "material-exchange":
    "A digital asset management platform and marketplace for material sourcing, where one core task went from 61 minutes to 23.",
  securion:
    "Multi-factor security for a mobile crypto wallet and exchange, designed so the protection is visible without becoming the obstacle.",
  "material-exchange-photo-lab":
    "A cross-platform photo editing extension for material photography, designed for 30% more engagement with the materials themselves.",
  "hotel-apartments":
    "Making extended stays bookable online: a booking service for long-stay hotel rooms, and the brand identity that had to carry it.",
  tempo:
    "Safe delivery for important documents and time-sensitive items, designed around the handover between sender and recipient.",
  icredo:
    "A loan you ask for the way you would ask a friend, and understand before you say yes — a lending conversation instead of a long form.",
  liga:
    "The insurance app you hope never to open, redesigned around the ten minutes when you have to file an accident report standing up.",
  nesba:
    "A unified Saudi wealth experience that turns everyday cash flow into one clear path to investing.",
  "8images":
    "A 3D product configurator built to work inside someone else's page, at a size you do not control, on a model you did not choose."
};

/* Drafts are reachable by URL so they can be compared against the live page
   (PortfolioPages.tsx:140-168) but are deliberately not linked. They must stay
   out of the sitemap AND carry `noindex`, or they become duplicates of the
   pages they clone — which is exactly the kind of near-duplicate that costs a
   small site its crawl budget. */
export const NOINDEX_PATHS = [
  "/am/projects/tempo-v2",
  "/am/projects/tempo-v3",
  "/am/projects/liga-steep"
];

/* Legacy single-segment aliases still resolved by the router
   (DavitWireframe.tsx:4918-4925). They render the same page as
   /am/projects/<slug>, so they are duplicates: 301 them in .htaccess and keep
   them out of the sitemap. */
export const LEGACY_ALIASES = {
  "/cloudchipr": "/am/projects/cloudchipr",
  "/material-exchange": "/am/projects/material-exchange",
  "/securion": "/am/projects/securion",
  "/material-exchange-photo-lab": "/am/projects/material-exchange-photo-lab",
  "/hotel-apartments": "/am/projects/hotel-apartments"
};

/* ---------------------------------------------------------------------------
   PUBLIC WORK. Only the nine slugs that actually render an on-site article
   (`publicArticleCopy`, DavitWireframe.tsx:704) are real URLs. The three
   Medium pieces carry `externalUrl` and render as outbound links, so they have
   no page of their own here — listing them in the sitemap would be listing
   URLs that do not exist.
   --------------------------------------------------------------------------- */
/* NOTE: this list is maintained by hand and duplicates the entries in
   src/davit-wireframe/DavitWireframe.tsx. Adding a talk to the site does not
   add it to the sitemap, llms.txt or the route meta — it has to be added here
   too, and nothing enforces that. The KOORSOO talk was published and silently
   left out of all three until the counts were checked. Worth deriving one list
   from the other. */
export const PUBLIC_WORK = [
  { slug: "creative-mornings-koorsoo", title: "KOORSOO — art as a small light through iterative uncertainty.", published: "2026-01-31", year: "2026" },
  { slug: "ux-storm-1-4", title: "UX Storm 1.4 — the new era of product designers.", published: "2025-12-12", year: "2025" },
  { slug: "design-in-2030", title: "Design in 2030 — a workshop for 100+ thinkers and practitioners.", published: "2025-10-11", year: "2025" },
  { slug: "ux-storm-1-2", title: "UX Storm 1.2 — shaping the future in UX design.", year: "2024" },
  { slug: "ux-storm-1-0", title: "UX Storm 1.0 — 200 applications, 120 seats, one shared room.", year: "2023" },
  { slug: "ux-design-battle-jury", title: "UXBattle — joining the jury for ideas under pressure.", year: "2025" },
  { slug: "ux-storm-1-1", title: "UX Storm 1.1 — making room for an honest design conversation.", year: "2024" },
  { slug: "tech-week-vanadzor", title: "Speaking at Tech Week Vanadzor — design as a regional conversation.", year: "2025" },
  { slug: "2x-masnageter", title: "2X ՄԱՍՆԱԳԵՏՆԵՐ #1 — taste, design, and AI in product work.", published: "2025-11-10", year: "2025", lang: "hy" },
  { slug: "how2b-ui-ux-designer", title: "How to be a UI/UX designer — a How2B speed interview.", published: "2024-12-24", year: "2024" }
];
