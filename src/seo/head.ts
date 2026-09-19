import seo from "./routes.generated.json";

/* ===========================================================================
   Per-route head metadata and structured data.

   The prerender step bakes all of this into the static HTML, so a crawler that
   runs no JavaScript still sees a correct title, description, canonical and
   JSON-LD graph. This module is what produces it, and it also runs on every
   client-side navigation so the tags stay correct once the SPA takes over —
   the same code path both times, which is the only way the two can't drift.
   =========================================================================== */

type Route = {
  path: string;
  title: string;
  description: string;
  type: string;
  name?: string | null;
  headline?: string | null;
  datePublished?: string | null;
  inLanguage?: string | null;
};

const SITE = seo.site;
const PERSON = seo.person;
const ROUTES = seo.routes as Route[];
const NOINDEX = new Set(seo.noindex as string[]);

const byPath = new Map(ROUTES.map((r) => [r.path, r]));

const normalise = (p: string) => {
  const clean = p.replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
};

/* `/am/designer` and `/am/portfolio` render the same component but are
   different URLs, so each keeps its own entry rather than one canonicalising
   to the other — they have genuinely different intent and different copy. */
export function routeFor(pathname: string): Route {
  const p = normalise(pathname);
  return (
    byPath.get(p) ?? {
      path: p,
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.tagline,
      type: "WebPage"
    }
  );
}

function tag(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    el.setAttribute("data-seo", "");
    document.head.appendChild(el);
  }
  return el;
}

const meta = (name: string, content: string) => {
  const el = tag(`meta[name="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("name", name);
    return m;
  });
  el.setAttribute("content", content);
};

const prop = (property: string, content: string) => {
  const el = tag(`meta[property="${property}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("property", property);
    return m;
  });
  el.setAttribute("content", content);
};

const link = (rel: string, href: string) => {
  const el = tag(`link[rel="${rel}"]`, () => {
    const l = document.createElement("link");
    l.setAttribute("rel", rel);
    return l;
  });
  el.setAttribute("href", href);
};

/* --------------------------------------------------------------------------
   The structured-data graph.

   One `@graph` per page rather than several loose scripts, with real `@id`
   values, so Person / WebSite / WebPage / CreativeWork are LINKED rather than
   three unrelated assertions that happen to sit on the same page. The entity
   relationships are the whole point: a search engine should be able to follow
   "this page is about → this person" without inferring it from proximity.

   Nothing here is asserted that the project does not state. There is no
   `alumniOf`, no `award`, no `hasCredential` and no `birthDate`, because the
   repository contains none of those facts.
   -------------------------------------------------------------------------- */
function graphFor(route: Route) {
  const url = `${SITE.origin}${route.path === "/" ? "/" : route.path}`;
  const personId = `${SITE.origin}/#person`;
  const siteId = `${SITE.origin}/#website`;
  const pageId = `${url}#webpage`;

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name: PERSON.name,
    url: `${SITE.origin}/`,
    jobTitle: PERSON.jobTitle,
    description: PERSON.description,
    email: `mailto:${PERSON.email}`,
    nationality: { "@type": "Country", name: "Armenia" },
    address: { "@type": "PostalAddress", addressCountry: PERSON.addressCountry },
    knowsAbout: PERSON.knowsAbout,
    sameAs: PERSON.sameAs,
    worksFor: { "@type": "Organization", name: PERSON.worksFor.name },
    alumniOf: undefined,
    hasOccupation: {
      "@type": "Occupation",
      name: "Product Designer",
      occupationLocation: { "@type": "Country", name: "Armenia" },
      skills: PERSON.knowsAbout.join(", ")
    }
  };
  delete person.alumniOf;

  const website = {
    "@type": "WebSite",
    "@id": siteId,
    url: `${SITE.origin}/`,
    name: SITE.name,
    description: SITE.tagline,
    inLanguage: SITE.locale,
    publisher: { "@id": personId },
    /* The site has no search endpoint, so no SearchAction is declared —
       declaring one that does not resolve is worse than declaring none. */
    about: { "@id": personId }
  };

  const pageType =
    route.type === "CreativeWork" || route.type === "Article" ? "WebPage" : route.type;

  const page: Record<string, unknown> = {
    "@type": pageType,
    "@id": pageId,
    url,
    name: route.title,
    description: route.description,
    inLanguage: route.inLanguage ?? SITE.locale,
    isPartOf: { "@id": siteId },
    about: { "@id": personId },
    primaryImageOfPage: `${SITE.origin}${SITE.ogImage}`
  };

  /* ProfilePage carries `mainEntity`, which is the explicit machine-readable
     statement "this page IS the Davit Pedanyan entity" — the single strongest
     signal available for a personal site. */
  if (pageType === "ProfilePage") page.mainEntity = { "@id": personId };

  const graph: Record<string, unknown>[] = [person, website, page];

  if (route.type === "CreativeWork") {
    graph.push({
      "@type": "CreativeWork",
      "@id": `${url}#work`,
      url,
      name: route.name ?? route.title,
      headline: route.headline ?? undefined,
      abstract: route.description,
      creator: { "@id": personId },
      author: { "@id": personId },
      inLanguage: SITE.locale,
      genre: "Product design case study",
      isPartOf: { "@id": siteId },
      mainEntityOfPage: { "@id": pageId }
    });
  }

  if (route.type === "Article") {
    graph.push({
      "@type": "Article",
      "@id": `${url}#article`,
      url,
      headline: route.name ?? route.title,
      description: route.description,
      author: { "@id": personId },
      publisher: { "@id": personId },
      inLanguage: route.inLanguage ?? SITE.locale,
      datePublished: route.datePublished ?? undefined,
      mainEntityOfPage: { "@id": pageId }
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function applyHead(pathname: string) {
  if (typeof document === "undefined") return;
  const route = routeFor(pathname);
  const url = `${SITE.origin}${route.path === "/" ? "/" : route.path}`;

  document.title = route.title;
  document.documentElement.lang = route.inLanguage ?? SITE.locale;

  meta("description", route.description);
  link("canonical", url);

  /* The drafts are near-duplicates of the pages they clone. `noindex, follow`
     rather than `noindex, nofollow`: the links out of them still point at real
     pages and there is no reason to throw that away. */
  meta("robots", NOINDEX.has(route.path) ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1");

  prop("og:type", route.type === "Article" ? "article" : "website");
  prop("og:site_name", SITE.name);
  prop("og:title", route.title);
  prop("og:description", route.description);
  prop("og:url", url);
  prop("og:locale", (route.inLanguage ?? SITE.locale) === "hy" ? "hy_AM" : "en_US");
  prop("og:image", `${SITE.origin}${SITE.ogImage}`);
  prop("og:image:width", String(SITE.ogImageWidth));
  prop("og:image:height", String(SITE.ogImageHeight));
  prop("og:image:alt", `${SITE.name} — ${SITE.tagline}`);

  meta("twitter:card", "summary_large_image");
  meta("twitter:title", route.title);
  meta("twitter:description", route.description);
  meta("twitter:image", `${SITE.origin}${SITE.ogImage}`);

  let ld = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-seo]');
  if (!ld) {
    ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.setAttribute("data-seo", "");
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify(graphFor(route));
}

export const SEO_ROUTES = ROUTES;
export const SEO_SITE = SITE;
