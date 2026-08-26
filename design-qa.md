# CloudChipr Hero Design QA

- Source visual: `/var/folders/yp/bw0jgw793lb4qbqxpygwzxnc0000gn/T/codex-clipboard-6f4a0eb8-6643-4cc8-89d3-16625be5631d.png`
- Implementation route: `/am/projects/cloudchipr`
- Desktop viewport: `1920 x 1326`
- Mobile viewport: `390 x 844`

## Visual Comparison

The rebuilt hero matches the Figma composition: inset blue-purple project surface, large left-aligned heading and metadata, an oversized product collage extending beyond the right and lower panel edges, compact tool marks, the horizontal collaborator row, and the vertical Projects tab.

The global PDNYN site header remains above the project frame. This is intentional because the supplied Figma frame represents the project hero rather than the complete website shell.

## Verification

- Product collage retains its source aspect ratio and is not cropped or stretched.
- Purple panel uses the Figma-derived desktop aspect ratio and radius.
- Product imagery can overflow the panel while the page itself has no horizontal overflow.
- Figma, Notion, and Slack use real logo assets.
- Desktop metadata hierarchy and collaborator row remain readable.
- Mobile rearranges the composition into heading, collage, and metadata without horizontal overflow.
- All images loaded successfully at both tested sizes.
- Existing case-study sections and routes remain unchanged.

## Findings

- No P0, P1, or P2 issues remain.
- P3: collaborator headshots are omitted because the original portrait assets were not available in the supplied source package. Names and chip structure match the reference.

## Logo Construction Animation

- The static construction image was replaced with a coded composition.
- Guides draw first, followed by the three-part glyph, letter-by-letter wordmark, strapline, labels, and yellow construction callouts.
- Scroll progress controls the sequence and reverses it without leaving later layers visible early.
- The completed desktop composition follows the supplied Figma proportions.
- The mobile version simplifies side labels, reduces the glyph and wordmark, and has no horizontal overflow.

## Concept Selection

- Source visual: `/var/folders/yp/bw0jgw793lb4qbqxpygwzxnc0000gn/T/codex-clipboard-f030974f-9be4-46bd-9f21-5aae44508f66.png`
- The former prose, four-column gallery, and rejected-variants media sections are now one editorial decision composition.
- The desktop content column, title scale, copy rhythm, logo sizes, asymmetric positioning, annotations, and rejected strip follow the supplied 1538 x 1178 reference.
- Preferred, selected, and rejected concepts use the original transparent source assets at their natural proportions.
- Scroll reveals the title, explanation, preferred direction, selected direction, and rejected strip in sequence. The sequence reverses without stale opacity or transforms.
- Mobile stacks both directions and keeps annotations and the full rejected strip readable without horizontal overflow.
- Verified at 1538 x 1178, 1280 x 720, and 390 x 844. No console errors were present.

## Branded Items

- Source layers: `codex-clipboard-a332d451-3e92-4100-918d-e438a9299e42.png`, `codex-clipboard-41936a3a-1727-473d-a770-b8c66eb2c82d.png`, and `codex-clipboard-afb31623-bb7c-4235-8f45-f5c9f5f7af01.png`.
- The flattened screenshot slices were removed. The badge and both business-card sides are now independent transparent image layers.
- Each object enters from a different direction with its own scale and rotation timing, followed by subtle opposing scroll parallax.
- The desktop composition keeps the asymmetric Figma placement; mobile recomposes the same layers vertically without horizontal overflow.
- All three source images load at their natural aspect ratios. Desktop and mobile checks produced no console errors.

## How It Started

- Source visual: `/var/folders/yp/bw0jgw793lb4qbqxpygwzxnc0000gn/T/codex-clipboard-58a612f6-6107-46fb-8ca5-ae3050698f67.png`.
- The narrative now follows the Figma paragraph rhythm and uses black emphasis for the two highlighted moments.
- Field Study, Competitor analysis, and User Research form a restrained vertical process rail with a scroll-drawn progress line.
- The sequence reverses cleanly and collapses to the same readable structure on mobile.

## Field Study

- Source visual: `/var/folders/yp/bw0jgw793lb4qbqxpygwzxnc0000gn/T/codex-clipboard-341322eb-e201-4009-83d9-9e47c28100f8.png`.
- Field Study, AWS learning, and stakeholder interviews are now one pale-gray three-step research sequence.
- Each step uses a large low-contrast number, selectable HTML copy, black inline emphasis, and its associated media.
- The report source and AWS course reference are separate functioning links; baked source labels are cropped from the raster assets.
- Desktop preserves the overlapping report collage. Mobile stacks the source images and retains the hierarchy with no horizontal overflow.
- Scroll reveals are scoped per step and reverse without runtime errors.

## Final Result

final result: passed

## Hotel Apartments Case Study

- Source visual: `/tmp/pedanyan-handoff-inspect/portfolio-complete-handoff/references/hotel-apartments-figma-reference.png`
- Implementation route: `/am/projects/hotel-apartments`
- Desktop viewport: `1280 x 720`
- Mobile viewport: `390 x 844`
- State checked: hero, project metadata, brand construction, web-design mockup, color/type system, and client feedback.

### Visual Comparison

The implementation follows the original long-form Figma case-study sequence while keeping the current PDNYN site shell. It uses the supplied Hotel Apartments project art at its natural proportions, rebuilds the Project metadata as selectable text, restores the migration narrative and caption, treats the woven research image as a background, reconstructs the Brand stage and client-choice composition, and adds the missing Web Design mockup before a coded color/logo/typography system.

### Findings

- The requested hero title and subtitle are present verbatim and remain readable at both tested sizes.
- The Project panel combines the source interface image with the original dark tonal treatment; metadata, tools, and co-design information are selectable HTML.
- Captions are separate semantic text and no asset filename or alt string is printed over an image.
- Brand applications retain their source aspect ratios and reflow into a single-column mobile sequence.
- The client feedback layer no longer covers the Brand introduction on mobile.
- No horizontal overflow or runtime console errors were found.
- Production build completed successfully.

### Final Result

final result: passed
