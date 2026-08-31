# Pedanyan Brand AI Context

This file is the shared handoff source for GPT, Codex, and any future AI work on this project.
Update it after major decisions so the next chat can continue without guessing.

## Current Project

Personal brand website and Storybook prototype for Davit Pedanyan.

The site is a personal brand ecosystem, not a classic portfolio. It should support three goals:

- Bring client leads for designer outstaffing and design/product consulting.
- Bring student leads for Pedanyan School.
- Build public authority around Davit as a designer, educator, and creative culture/community builder from Armenia.

## Current Stack

- Vite
- React
- Storybook
- GSAP / ScrollTrigger for scroll animation
- Notion CMS sync through a generated local JSON content file
- Main code location: `src/davit-wireframe/`
- Storybook stories: `src/stories/DavitWireframe.stories.tsx`
- Current local Storybook static server: `http://127.0.0.1:6009`

## MVP Pages

The MVP should stay focused around these pages:

- `/am` - Home
- `/am/designer` - Pedanyan / design help page
- `/am/school` - Pedanyan School
- `/am/public-work` - Public, story, public work, talks, events, workshops, media
- Let’s Talk page/story exists for contact routing

Avoid adding separate MVP pages for About, Contact, Media, Thoughts, Culture, Podcast, Mid-Senior Designers, Junior Design Lab, or Hire Pedanyan unless Davit explicitly asks.

## Navigation

Current intended navigation:

- Portfolio
- Public
- School
- Let’s talk

Logo should remain `PDNYN`.
Logo links to `/am`; Home is not shown as a menu item.
Social links `IN`, `IG`, `FB` are fixed at the bottom-right globally.
Theme control is fixed at the bottom-left and should read `night mode` or `day mode`.

## Voice Direction

The voice should feel personal, direct, confident, human, clear, editorial, and slightly informal while still professional.

Use the `stop-slop` writing rules for website copy:

- Write in first person when Davit is speaking.
- Name the action, audience, or result instead of using abstract claims.
- Use active voice.
- Cut internal product language, filler, adverbs, and repeated three-item formulas.
- Avoid `not X, but Y` constructions and passive descriptions.
- Keep sentences short enough for the editorial layouts.

Avoid corporate language unless there is a specific reason:

- services
- solutions
- expertise
- innovative
- end-to-end
- ecosystem
- unlock potential
- cutting-edge

Prefer simple first-person language:

- What I can do for you
- I match companies with designers who fit the product
- I turn unclear product problems into decisions a team can ship
- I teach beginners through practice and direct critique
- I run talks, workshops, and critique sessions for designers in Armenia
- Let’s talk about what you need

## Visual Direction

The current direction is a light editorial design inspired by blit.studio mood, not a copy.

Important design notes:

- White background.
- Archivo as the main font.
- Large bold `PDNYN` logo on first screen, smaller after scroll.
- No white sticky header block cutting content.
- Compact, minimal menu.
- Same shared header/chrome across all pages, including Let’s Talk.
- Orange/red can remain in lines and type accents, but circular red dot markers have been removed from the interface.
- The shared `Let’s talk` navigation link uses a lightly animated outline message icon instead of a red dot.
- Acid green accent can be used sparingly.
- Random editorial image/text composition on home hero.
- Interactive mouse movement on hero objects.
- Avoid generic SaaS/portfolio look.

## Home Page

Home is an orientation and routing page, not a detailed explanation page.

It should answer:

- Who is Davit?
- What worlds does he connect?
- Where should the visitor go next?

Current Home structure:

- Scattered editorial hero composition.
- Home hero, designer facts, and work chronology are merged into one pinned GSAP/ScrollTrigger experience, with an explicit controller for each phase.
- The unified Home timeline must complete every fact, hold `$27M` visibly, and then move through every work entry before releasing into the routing sections.
- Do not reintroduce separate nested pinning or independent scroll controllers for these three Home phases.
- Native document scrolling is contained while the unified scene is active. Wheel/touch input accelerates only the current phase and cannot accumulate as hidden page distance that releases into the next phase.
- Hero-to-facts starts on the first downward gesture. Facts and work history then autoplay at calm default speeds. Scroll pressure adds a decaying impulse capped at 3x the default phase speed.
- Work entries are buttons: clicking a visible entry navigates directly to it, holds it briefly, and then resumes the calm autoplay.
- After the final work entry releases, the `choose where to go next` routing section is introduced by a reusable SVG wave reveal. The orange-to-pink curve rises from the bottom, fills the section, then reveals the routing content; scrolling back reverses it.
- The reusable `CosmicDustBackground` component from `src/davit-wireframe/CosmicDustBackground.tsx` has two modes. Hero mode is a very faint transparent grayscale dust overlay. Facts mode is a full grayscale fly-through that replaces the old CSS dot field and pauses before work history.
- The unified GSAP controller publishes dust speed through `data-dust-speed`: `0.1` during calm facts playback and no more than `0.12` during heavy scrolling; hero dust starts at `0.03`. The shader's internal time is also reduced (`0.22` facts, `0.12` hero), because drift speed alone does not slow the procedural warp. Facts autoplay at `0.009` once started. Downward input adds a short decaying speed impulse capped at 1.5x, while the dust remains capped at 1.2x. Large wheel gestures cannot skip facts.
- Hero-to-facts is a committed vertical parallax transition, not a scrubbed crossfade. The black facts scene rises from the bottom as an opaque clipped layer while the white hero recedes and moves upward, avoiding the muddy grey overlap between scenes. The first downward gesture completes it at a fixed rate regardless of wheel distance. Reversing during or near that transition commits the timeline back to the fully visible hero; returning to the top skips obsolete fact frames so rapid reverse scrolling stays responsive. Hero and facts dust do not render at the same time.
- The first fact begins its Z-depth entrance behind the rising black panel and is already readable when the hero transition completes. Keep the later facts sequential and slow; do not leave an empty dark screen between the hero transition and `20+ years`.
- Fact number and caption are one aligned block: left-origin facts remain left-aligned and right-origin facts remain right-aligned through entrance, hold, and exit. Facts zoom out on their own side instead of crossing the viewport, which prevents large values from clipping at desktop widths.
- Reverse navigation from the hero/facts phase uses a dedicated return-to-hero tween only after the scroll position reaches the hero boundary. Ordinary upward trackpad momentum inside the facts section is ignored and calm autoplay continues, so momentum cannot send the section home or leave it paused. At the boundary, the return tween freezes the master timeline, closes the black facts panel, restores the hero, and only then resets the hidden timeline and scroll position. Do not scrub the full master timeline backward through every fact tween because that causes severe frame drops alongside the WebGL renderer.
- `/am/designer` (the Portfolio page) is intentionally an empty full-height canvas inside the shared page shell while its replacement design is pending. Keep the shared header, theme control, and social links, but do not restore the old standalone numbers, experience, or final CTA sections there. The integrated Home facts sequence remains unchanged.
- Fixed fullscreen shader background using `shaders/react` with Dither, Plasma, and WaveDistortion.
- Uses Davit hero image.
- Main hero text: `I build products, designers, and creative culture.`
- Short scattered snippets:
  - Design generalist
  - Educator
  - Community builder in Armenia
  - Product design
  - Public work
- Three routing cards: Need design help?, Want to learn design?, Want to know my story?
- Routing language should feel personal:
  - Need design help?
  - Want to learn design?
  - Want to know my story?
  - Want to invite me or collaborate?
- Sparse final Let’s Talk routing section.

Reusable glass-cube interaction:

- Component: `RapierGlassCubes` in `src/davit-wireframe/HomeRapierGlassBackground.tsx`.
- It accepts a `containerRef` and can be mounted inside any positioned, overflow-controlled section.
- Add `data-glass-capture` to text elements that should be included in the liquid-glass refraction texture.
- It currently lives in the Home final Let’s Talk/footer section, not in the hero.
- The simulation pauses while offscreen, keeps Rapier pointer collisions, and refreshes its captured texture after theme or size changes.

Detailed explanations should live on owner pages, not Home:

- School curriculum or 4-month program details belong on School.
- Outstaffing/advisory detail belongs on What I can do for you.
- UX Storm, Drunk Talks, critiques, and public formats belong on My story.

## Designer Page Animation

Current Storybook story:

`http://127.0.0.1:6009/iframe.html?viewMode=story&id=mvp-pages--designer`

The designer page is based on a scroll animation storyboard.

Expected animation logic:

- Pinned fullscreen scene.
- Light background, matching the rest of the site.
- Small dot field should not move by itself; it should respond only through scroll-driven transforms.
- Text layers should come from far Z depth, scale from very small, become sharp at readable size, hold briefly, then exit by zooming forward and blurring.
- Blur should mostly happen during exit, not throughout the whole animation.
- Desktop animation should include subtle idle depth drift, so particles/data feel like they move toward the viewer even before scroll input.
- Scroll should accelerate the same forward Z-space feeling; real wheel scrolling should keep the pin and timeline smooth.
- Stat captions should use split character/word reveal tied to the depth timeline.
- Central organic outline and data overlay phase should appear before the later statistic stages.
- Final `$27M` should use a slot-machine/odometer-style number effect.

Current content sequence:

- `20+ years` - building digital products, brands, interfaces, and design systems
- `17 startups` - built the full design side, from product direction to shipped interface
- `100+` - consultancies across product strategy, UX, branding, hiring, and design operations
- `85` - designers outstaffed so far for companies that needed stronger product teams
- `$27M` - helped founders shape products and stories that supported investment rounds

After the intro animation, the Designer page should include an animated work experience section:

- Keep the existing Designer intro animation first.
- Use GSAP + ScrollTrigger for a pinned desktop section.
- Large vertical experience list on the left/center.
- Active item becomes strong/readable; inactive items fade.
- Right preview card changes with the active company.
- Thick organic SVG line sits behind content and uses the current orange/red accent.
- Mobile/reduced motion should fall back to stacked cards.

Removed:

- All Amaterasu/Aleph placeholder content.
- Internal `PDNYN / DESIGNER INSIGHT` label inside the animation.

## Public And Media Page

Davit wants this page to include:

- Public and media content only. Do not include the previous scroll storytelling / “My story is not a bio” section on this page.
- Blog/category style page.
- Categories like UX Storm, Public speaking, Workshops, Design critiques.
- A section for Drunk Talks with gallery style.

Important event formats:

- UX Storm: UX design event with interesting speakers and speed discussions with mentors.
- Drunk Talks: experimental format where invited local or foreign designers have a drink and talk with the community.
- Design critique events: designers bring case studies, portfolios, work in progress, and failures for discussion.
- Davit also participates as speaker, panelist, workshop facilitator, critic, and mentor.

## Let’s Talk Page

Should follow the sparse blit-like contact layout and stay as a one-screen editorial contact/routing page, not a normal form page.

- Height should be `100svh`, `position: relative`, and `overflow: hidden`.
- Keep PDNYN top-left, centered navigation, and top-right social text links `IN`, `IG`, `FB`.
- Include a fullscreen absolute background placeholder layer for a future shader.
- Main oversized headline: `LET’S TALK / ABOUT / WHAT YOU NEED`.
- Use sparse scattered blocks for companies, students, public work, and direct contact.
- Use Davit/Pedanyan content, not copied blit contacts.

## Shared Contact CTA

The shared page-ending CTA should match the current sparse editorial design. Do not use the old
`route the conversation by intent` wording or rounded pill/card rows.

Use language like:

- `what should we talk about?`
- `Tell me what you need...`

Routes should link into `/am/lets-talk`.

## Workflow Between GPT And Codex

Use this file as the source of truth.

## Notion CMS Workflow

The website should not call Notion directly from the browser because that would expose the Notion
secret. The current CMS flow is:

- Edit content in a Notion database.
- Run `npm run sync:notion` with `NOTION_TOKEN` and `NOTION_DATABASE_ID`.
- The sync script writes `src/davit-wireframe/notionContent.generated.json`.
- The React site reads content through `src/davit-wireframe/websiteContent.ts`.

Current CMS-mapped content:

- Shared navigation/logo/social links
- Home hero headline and small snippets
- Home routing cards
- Home final talk routes
- Shared contact routes
- Let’s Talk headline and scattered routing blocks
- Designer animation stats, next-section copy, and experience list
- School hero, school stats, actions, standards, practice list, and final CTA
- Public page intro, category cards, Drunk Talks copy/gallery, public formats, and media archive cards

Notion setup details live in `content/notion-cms.md`.

Current Notion connection:

- Token is stored locally in `.env.local` and must remain ignored by git.
- The provided Notion page/database uses the newer Notion data source API.
- `.env.local` includes `NOTION_DATA_SOURCE_ID`; use that over the database ID for syncing.
- Codex created the CMS properties and seeded 36 starter rows in Notion on 2026-06-29.
- `npm run sync:notion` successfully synced those 36 rows into the site.
- Codex expanded the CMS schema and seeded 77 additional dynamic rows on 2026-06-30.
- `npm run sync:notion` then synced 113 total Notion rows into the site.
- CMS rows are organized with Notion-only helper fields `Page`, `Section`, and `ItemType`.
- `npm run organize:notion` populates those helper fields so the database can be grouped/filtered.

Recommended GPT prompt:

```text
Read this project context and continue from it. Do not invent a new direction unless I ask.
Use AI_CONTEXT.md as the source of truth for the Pedanyan Brand website.
```

When GPT creates new strategy, copy the useful result back into this file or ask Codex:

```text
Update AI_CONTEXT.md with this decision and then implement the related code changes.
```

When Codex makes meaningful changes, update this file if the decision affects:

- Page architecture
- Navigation
- Brand direction
- Animation rules
- Core content
- Implementation workflow

## Verification Notes

Useful commands:

```bash
npm run build
npm run build-storybook
python3 -m http.server 6009 --directory storybook-static
NOTION_TOKEN=secret_xxx NOTION_DATABASE_ID=database_id npm run sync:notion
```

Storybook build may warn that it cannot write `/Users/davit/.storybook/settings.json`; this has been harmless so far.

## Home Hero Figma Reference (2026-07-16)

- The Home hero follows Figma file `DPTgKFyZw8TOG7I3fnCD8T`, base node `771:523`.
- Hover compositions use nodes `775:781` (products), `775:669` (designers), and `775:806` (creative culture).
- The hero uses the exported Figma cutout of Davit and engraved ornament assets on a warm `#f5f2f2` background.
- Hero copy is fixed to: “I build products, designers, and creative culture.”
- `products`, `designers`, and `creative culture` are interactive words. Hover/focus mutes the remaining sentence, adds the Figma-style wavy underline, and reveals the corresponding sculptural collage object.
- Preserve the shared site header and the existing unified Home scroll sequence. This decision changes only the hero composition.
- Local hero assets live in `src/assets/figma-hero/`.
- The shared desktop header now follows the Figma header component: 20px horizontal padding, cropped face mark plus `PDNYN`, `Portfolio / Public / School / Let’s talk`, 102px height, and no legacy oversized logo/shrink behavior.
- Hero layer positions and sprite crops use the exact Figma frame geometry. Preserve each layer's intrinsic Figma rotation and use CSS parallax variables so pointer movement never overwrites those rotations.
- On 2026-07-17, the seated portrait and all three hover sculptures were refreshed from the latest Figma exports. Their desktop frames now match the resized Figma variants; keep these higher-resolution assets and current crop coordinates when editing the hero.
- On 2026-07-20, Home received an automatic multilingual preloader based on the supplied motion reference: dark PDNYN hold, circular warm-gray field, rapid centered greetings, emphasized Armenian `Բարև`, then a curved circular retraction into the existing hero. The preloader owns scroll until it finishes and dispatches `dw-home-intro-complete` so the hero typing and unified scroll scene begin cleanly afterward.

## Home Scroll Chapters (2026-08-08)

- Home uses discrete motion chapters: hero, design facts, work experience, then the routing section.
- Scroll input expresses direction and emphasis; it does not map directly to page distance and cannot skip future content.
- The hero changes to the facts scene after one deliberate downward gesture and restores fully when reversing.
- Facts autoplay calmly with a minimum readable hold. Scrolling can accelerate only the active transition, capped at `1.75x`, and every fact must appear before work experience.
- A scroll gesture while a fact is resting shortens its idle hold and starts the next fact after the minimum reading window; scrolling must always feel acknowledged without allowing a fact to be skipped.
- `$27M` uses a slow-fast-slow ease and remains fully visible until the next downward gesture.
- Work experience advances one centered item at a time. It autoplays after an idle pause, pauses while an item is hovered or focused, supports direct item selection, and reverses one item at a time.
- The final work item holds before one additional downward gesture releases normal page scrolling into the routing section.

## Portfolio And Case Studies (2026-08-25)

- The Portfolio index is the existing `/am/designer` page, with `/am/portfolio` retained as an alias.
- Case studies use `/am/projects/:slug`; legacy root slugs also resolve to the same project pages.
- Current case studies: CloudChipr, Material Exchange, Securion, ME Photo Lab, and HotelApartments.
- Source content and images came from `portfolio-complete-handoff.zip`; the combined structured manifest is `src/davit-wireframe/portfolio-content.json` and project media lives in `public/portfolio-assets/`.
- Portfolio and case-study content use Syne to follow the supplied case-study design system. The shared PDNYN header remains Archivo and stays consistent with the rest of the site.
- The portfolio index is an editorial, asymmetric project grid. It introduces the work briefly and routes to complete case studies instead of behaving like a corporate services page.
- Every case study is rendered from the shared structured section system: intro, prose, media, gallery, split, feature grid, chips, metrics, testimonial, and project navigation.
- Preserve semantic/selectable copy, source section order, project-specific colors, 1048px text width, 1800px media width, circular testimonial portraits, and responsive stacking.
- Storybook includes one story for the index and one for each project under `MVP Pages`.

## Case Study Generation

New case studies are generated from raw content using the standard block system
documented in `DESIGN-LANGUAGE.md` (repo root). Give the AI the copy + images and
it maps them to `portfolio-content.json` sections — no per-study Figma unless
Davit explicitly asks for a custom section.
