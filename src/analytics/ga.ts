/**
 * Google Analytics 4 for a client-side router.
 *
 * Three things this has to get right that a pasted gtag snippet does not:
 *
 * 1. The site is an SPA. gtag's automatic page_view fires once, on first load,
 *    and never again - so every case study a visitor reads after landing would
 *    be invisible. `send_page_view: false` plus a manual event per route fixes it.
 * 2. `scripts/prerender.mjs` drives a real browser over all 26 routes on every
 *    build. Without a guard those become real sessions in the report.
 * 3. The measurement ID is read from the environment, not hardcoded, so the
 *    repo carries no account identifier and dev never reports into production.
 * 4. Local development never reports either. Set VITE_GA_DEBUG=1 in .env.local
 *    to override that for a one-off check; hits then carry debug_mode so they
 *    show up in DebugView rather than being mixed into the normal reports.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const DEBUG = import.meta.env.VITE_GA_DEBUG === "1";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let started = false;

/** Automation, including the prerenderer, must never appear in the reports. */
function isAutomated() {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  return /HeadlessChrome|Playwright|Puppeteer|bot|crawler|spider/i.test(navigator.userAgent);
}

/** A dev server is not the site. Only DEBUG lets localhost report. */
function isLocal() {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h.endsWith(".local");
}

export function analyticsEnabled() {
  if (!MEASUREMENT_ID || typeof window === "undefined") return false;
  if (isAutomated()) return false;
  if (isLocal() && !DEBUG) return false;
  return true;
}

export function initAnalytics() {
  if (started || !analyticsEnabled()) return;
  started = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag("js", new Date());
  /* Page views are sent by hand from the router, once per route. */
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
    ...(DEBUG ? { debug_mode: true } : {})
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/** One page_view per route the router resolves, including the first. */
export function trackPageView(path: string, title?: string) {
  if (!analyticsEnabled() || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title
  });
}

/** For anything worth counting beyond a page view. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!analyticsEnabled() || !window.gtag) return;
  window.gtag("event", name, params);
}
