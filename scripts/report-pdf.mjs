/* =============================================================================
   State of Design in Armenia 2026 — PDF.

   The PDF is the live page printed, not a second copy of the report, so there
   is only ever one set of numbers. Two things make the print honest:

   - reducedMotion: "reduce" makes every chart render its final state at once
     (useInView sets `seen` immediately under reduced motion), so nothing is
     missing just because a browser never scrolled past it;
   - the @media print block in report.css removes what a reader cannot click on
     paper — nav, filters, toggles, export buttons — and opens every drawer.

   Usage:  npm run dev   (in another shell)
           node scripts/report-pdf.mjs [out.pdf]
   ============================================================================= */

import { chromium } from "playwright";

const PORT = process.env.PORT || 5173;
const URL = `http://127.0.0.1:${PORT}/report/design-armenia-2026`;
const OUT = process.argv[2] || "design-armenia-2026.pdf";
/* 1000px wide so the >=960px layout applies: the PDF is the desktop report,
   scaled down by the printer, not the mobile one blown up. */
const W = Number(process.env.W || 1000);

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
);
const page = await browser.newPage({
  viewport: { width: W, height: 1400 },
  reducedMotion: "reduce",
  deviceScaleFactor: 2,
});

await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForSelector(".rp-hero", { timeout: 30000 });
await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
await page.$$eval("details", (nodes) => nodes.forEach((node) => (node.open = true)));
await page.waitForTimeout(1200);

/* Refuse to write a PDF of a page that did not finish drawing. */
const check = await page.evaluate(() => ({
  hero: document.querySelector(".rp-statement-big")?.textContent?.trim(),
  cards: document.querySelectorAll(".rp-card").length,
  zeroBars: [...document.querySelectorAll(".rp-bars [style*='width']")]
    .filter((n) => /width:\s*0%/.test(n.getAttribute("style") || "")).length,
  controlsLeft: [...document.querySelectorAll(".rp-tool, .rp-nav, .rp-float, .rp-chip, .rp-toggle")]
    .filter((n) => getComputedStyle(n).display !== "none").length,
}));
if (!check.hero || check.hero === "0" || check.zeroBars > 0 || check.controlsLeft > 0) {
  await browser.close();
  throw new Error(`report-pdf: page not print-ready — ${JSON.stringify(check)}`);
}

await page.pdf({
  path: OUT,
  width: `${W}px`,
  height: `${Math.round(W * 1.414)}px`,
  printBackground: true,
  margin: { top: "28px", bottom: "34px", left: "0px", right: "0px" },
});
await browser.close();
console.log(`report-pdf: ${OUT} (${check.cards} charts)`);
