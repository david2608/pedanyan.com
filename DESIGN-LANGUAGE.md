# Pedanyan Case Study Design Language

Contract for generating new case studies from raw content. Davit provides copy +
images; the generator (Claude) composes them from the standard blocks below.
No new Figma needed per study — custom sections only when Davit explicitly asks.

## How a case study is built

1. Assets go to `public/portfolio-assets/<slug>/` and are registered in the
   project's `assets` map in `src/davit-wireframe/portfolio-content.json`.
2. The case study is one entry in `portfolio-content.json` → `projects[]`:
   `project` (title, slug), `tokens`, `assets`, `sections[]`.
3. Sections render through `ProjectSection` in `src/davit-wireframe/PortfolioPages.tsx`
   (one component per `type`). Slug-specific overrides are the exception, not the rule.
4. Register the accent in `projectAccents` in `PortfolioPages.tsx`.
5. Route: `/am/projects/<slug>`. QA at 1920 and 390 wide.

## Tokens

- Font: Syne (Medium 500 for display and body emphasis), site fallbacks Archivo/Arial.
- Case panel width: 1800px max, centered; side padding clamp(28px, 5.2vw, 100px).
- Card surface: #F6F6F6, radius 30px. Dark variant: near-black card, white text.
- Text: body #646464 with **black** `<strong>` emphasis; headings #111/#000.
- Type scale — ONE size per role, set as CSS vars on `.dw-case-study` in
  `portfolioPages.css`: `--case-title` clamp(30px, 2.5vw, 48px),
  `--case-subtitle` clamp(18px, 1.46vw, 28px), `--case-body`
  clamp(16px, 1.15vw, 22px) lh 1.6. All standard blocks use these vars;
  bespoke showpiece sections may exceed them only by explicit request.
  Content rule: descriptions are 1–2 short paragraphs, never more.
- Per-project accent + surface pair, e.g. securion `#6658ff`/`#eae8ff`.
  New study: derive accent from the client's brand, pastel surface of same hue.
- Spacing rhythm: section padding clamp(90px, 10vw, 170px); `overlapTop/Bottom`
  for pulled-up media; generous white space, never cramped.

## Section library (`sections[].type`)

- `intro` — hero: title, subtitle, tools/meta row, hero media on tinted
  rounded surface (`background.color`, `radius: 30px`).
- `about-card` — "the Project" overview card (#F6F6F6, radius 30): big title,
  "Overview" eyebrow, emphasized paragraph left; Client / Categories / Duration /
  Services / Projects / Tools metadata right. Client value renders as underlined link.
- `prose` — heading + rich text (`<p>`, `<strong>`, `<mark>`); optional eyebrow,
  gradient heading, background/textColor overrides.
- `media` — single image/embed section; caption + captionUrl optional; `layout`
  wide/contained/full; use `overlapBottom` to tuck the next section up.
- `gallery` — image grid; `columns`, `items[]` of asset keys. Phone-screen
  masonry uses columns + framed images.
- `split` — two-column mixed copy/media rows.
- `feature-grid` — cards of small features/points.
- `chips` — pill list (roles, tags).
- `metrics` — stat tiles with title.
- `testimonial` — quote card: quote, person, avatar, LinkedIn link, on accent
  gradient background.
- `navigation` — next/previous project footer.

Special showpieces (logo constructions, animated diagrams) are coded per project —
only on request.

## Content intake (what Davit gives)

Free-form is fine (doc, chat message, Notion), ideally covering:
title + one-line subtitle; client, categories, duration, services, tools;
the story in rough order (overview, problem, process, solution, results);
images (any names) with a hint of what each shows; a client quote + person if any;
brand color of the client.

Mapping rules: overview paragraph gets `<strong>` on product nouns, outcomes and
client names; each major story beat = `prose` followed by its `media`/`gallery`;
default skeleton: intro → about-card → prose/media alternation → gallery →
testimonial → navigation.
