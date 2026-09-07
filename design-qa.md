# Design QA — iCredo animated conversation

- Source visual truth: the five user-supplied 393 × 852 SVG screens for chat, summary, verification details, loading, and success.
- Implementation: `/am/projects/icredo#chat-solution` in the local in-app browser.
- State checked: desktop and responsive rules, light theme, animated flow running inside the fixed-height device viewport.

## Findings

No actionable P0, P1, or P2 differences remain in the animated section.

- Asset fidelity: every supplied SVG is embedded as a live SVG document; its interface artwork, vectors, and Armenian copy are not rasterized or redrawn.
- Layout: the phone retains a fixed viewport height throughout the sequence, so surrounding case-study content does not jump.
- Hardware: the animated prototype, KYC, and Loans screens now share one six-pixel device outline, a 44-pixel shell radius, and the same compact Dynamic Island.
- Conversation: vector groups reveal in sequence inside the first SVG rather than exposing cropped copies of a screenshot.
- Sequence: chat hands off to summary, verification details, loading, and success without an empty frame between states.
- Verification: native groups in the supplied third screen appear sequentially; no HTML checkbox overlay remains.
- Loading and success: native loader groups pulse in sequence; the supplied success artwork enters with a restrained lift and bounce.
- Navigation: carousel dots and the vertical carousel caption were removed; all five moments occupy one screen in fixed chronology.
- System icons: Chat, KYC, Loans, and UI each have a consistent line icon in the case-study system section.
- Responsive behavior: the device scales down at the existing mobile breakpoint without changing the section’s content order.
- Accessibility: the animated experience has a descriptive label, embedded states have descriptive titles, and reduced-motion users receive a paused readable chat state.

## Follow-up polish

The automatic loop remains 21 seconds so each screen stays readable. All five SVGs pass XML validation, the production build passes, and the source diff has no whitespace errors.

final result: passed
