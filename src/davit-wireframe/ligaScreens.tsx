import { useEffect, useRef, useState, type ReactNode } from "react";
import "./ligaCase.css";

/**
 * LIGA Mobile product screens, rebuilt in code from the Figma file so the
 * accident walkthrough can animate instead of showing eight still exports.
 *
 * Nothing here is drawn by hand. Every icon, illustration and photograph is
 * exported from the design file into /portfolio-assets/liga/ui, and every
 * size, colour, radius and weight below is read off the file's nodes:
 *
 *   frame 393x854 r24 · ink #1a1d23 · hairline #e9ebf1 · surface #f6f7fa
 *   attach border #caced5 · chip border #f0f2f8 · brand #da2c43
 *   cover green #84cc4c · badge #e51717 · progress done #373d48
 *   type Noto Sans - 24/600 lh32, 18/600 lh26, 15/600 lh22, 15/400 lh22,
 *   13/400 lh18, 11/600 lh16 · buttons 361x56 r18 · inputs 361x58 r16
 *
 * The copy is translated; the shipped interface is Armenian, and the real
 * Armenian exports are still on the page in the advantages cards and the
 * everyday strip.
 *
 * Each screen animates when `active` flips true and resets when it flips
 * false, so the pinned walkthrough replays it on every pass.
 */

export type LigaScreenId =
  | "home"
  | "offline"
  | "photos"
  | "when-where"
  | "their-docs"
  | "your-docs"
  | "submitted"
  | "claim-status";

const SCREEN_IDS: LigaScreenId[] = [
  "home", "offline", "photos", "when-where", "their-docs", "your-docs", "submitted", "claim-status"
];

export function isLigaScreen(value: string): value is LigaScreenId {
  return (SCREEN_IDS as string[]).includes(value);
}

/** Assets exported from the Figma file (see the header comment). */
const UI = "/portfolio-assets/liga/ui";
function Art({ name, ext = "svg", className = "" }: { name: string; ext?: string; className?: string }) {
  return <img src={`${UI}/${name}.${ext}`} alt="" aria-hidden="true" loading="lazy" decoding="async" className={`lg-art ${className}`} />;
}

/* ------------------------------------------------------------- primitives */

function StatusBar() {
  return (
    <div className="lg-status" aria-hidden="true">
      <span className="lg-status-time">9:41</span>
      <span className="lg-status-right">
        <svg viewBox="0 0 19 12"><rect x="0" y="8" width="3" height="4" rx="0.8" /><rect x="5.3" y="5.6" width="3" height="6.4" rx="0.8" /><rect x="10.6" y="3" width="3" height="9" rx="0.8" /><rect x="15.9" y="0" width="3" height="12" rx="0.8" /></svg>
        <svg viewBox="0 0 17 12"><path d="M8.5 11.6 1.3 4.6a10 10 0 0 1 14.4 0L8.5 11.6Z" opacity="0.3" /><path d="M8.5 11.6 4.4 7.6a5.8 5.8 0 0 1 8.2 0L8.5 11.6Z" /></svg>
        <svg viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="25" height="12" rx="4.3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="21" height="9" rx="2.5" /><path d="M26.2 4.5v4a2 2 0 0 0 0-4Z" opacity="0.4" /></svg>
      </span>
    </div>
  );
}

const HomeBar = () => <span className="lg-home" aria-hidden="true" />;

/** Reveals children one after another; restarts whenever `active` flips. */
function useStepper(active: boolean, count: number, stepMs = 520, startMs = 260) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) { setShown(0); return; }
    let step = 0;
    const timers: number[] = [];
    const tick = () => {
      step += 1;
      setShown(step);
      if (step < count) timers.push(window.setTimeout(tick, stepMs));
    };
    timers.push(window.setTimeout(tick, startMs));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, count, stepMs, startMs]);
  return shown;
}

/**
 * The progress bar, as the file draws it: the step you are on is a wide bar
 * subdivided into ten blocks, the other three are short stubs. So the bar
 * shows both which step you are on and how far through it you are.
 */
function StepBar({ step, fill }: { step: number; fill: number }) {
  return (
    <div className="lg-stepbar" aria-hidden="true">
      {[1, 2, 3, 4].map((n) =>
        n === step ? (
          <span className="lg-stepbar-wide" key={n}>
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} className={i < fill ? "is-done" : ""} style={{ transitionDelay: `${i * 55}ms` }} />
            ))}
          </span>
        ) : (
          <span className={`lg-stepbar-stub${n < step ? " is-done" : ""}`} key={n} />
        )
      )}
    </div>
  );
}

function StepHead({ step, label }: { step: number; label: string }) {
  return (
    <header className="lg-head">
      <Art name="back" className="lg-back" />
      <span className="lg-head-text">
        <strong>Register accident</strong>
        <small>Step {step}/4 &middot; {label}</small>
      </span>
    </header>
  );
}

function Cta({ children, shown = true, tone = "red" }: { children: ReactNode; shown?: boolean; tone?: "red" | "ghost" | "muted" }) {
  return <span className={`lg-cta is-${tone}${shown ? " is-in" : ""}`}>{children}</span>;
}

/* ----------------------------------------------------------------- screens */

/**
 * Home. The two things a person opens the app to do sit in a card of their
 * own between the insurance types and the contracts.
 */
function HomeScreen({ active }: { active: boolean }) {
  // 1 header, 2 stories, 3 insure row, 4 the two actions, 5 the policy card
  const shown = useStepper(active, 5, 420, 260);
  const types = [
    { key: "ins-car", label: "Car" },
    { key: "ins-travel", label: "Travel" },
    { key: "ins-health", label: "Health" },
    { key: "ins-home", label: "Home" }
  ];
  return (
    <div className="lg-screen lg-home-screen">
      <StatusBar />
      <header className={`lg-user${shown >= 1 ? " is-in" : ""}`}>
        <Art name="avatar" className="lg-avatar" />
        <span className="lg-user-text"><strong>Anna Avalyan</strong><small>ID: 00000138</small></span>
        <span className="lg-user-icons">
          <Art name="chat" className="lg-ico" />
          <span className="lg-bell">
            <Art name="bell" className="lg-ico" />
            <i className={`lg-badge${shown >= 1 ? " is-in" : ""}`}>32</i>
          </span>
        </span>
      </header>
      <div className={`lg-offers${shown >= 2 ? " is-in" : ""}`} aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span className="lg-offer" key={n} style={{ transitionDelay: `${n * 60}ms` }}>
            <Art name={`story-${n}`} ext="webp" />
          </span>
        ))}
      </div>
      <div className={`lg-sheet${shown >= 3 ? " is-in" : ""}`}>
        <p className="lg-sec">Insure</p>
        <div className="lg-types">
          {types.map((t, i) => (
            <span className={`lg-type${shown >= 3 ? " is-in" : ""}`} key={t.key} style={{ transitionDelay: `${i * 70}ms` }}>
              <Art name={t.key} />
              <small>{t.label}</small>
            </span>
          ))}
        </div>
        <div className={`lg-card lg-actions${shown >= 4 ? " is-in" : ""}`}>
          <span className="lg-row">
            <Art name="act-crash" className="lg-row-ico" />
            <strong>Register an accident</strong>
            <Art name="chevron" className="lg-chev" />
          </span>
          <span className="lg-row">
            <Art name="act-pay" className="lg-row-ico" />
            <strong>Claim a payout</strong>
            <Art name="chevron" className="lg-chev" />
          </span>
        </div>
        <p className={`lg-sec${shown >= 5 ? " is-in" : ""}`}>Contracts</p>
        <div className={`lg-card lg-policy${shown >= 5 ? " is-in" : ""}`}>
          <span className="lg-policy-top">
            <Art name="policy-car" className="lg-policy-ico" />
            <span className="lg-policy-name">
              <strong>CMTPL</strong>
              <em className="lg-chip">SQ 123456 <Art name="copy" className="lg-copy" /></em>
            </span>
            <span className="lg-policy-right">
              <small>12 Aug, 2025</small>
              <span className="lg-cover">
                {Array.from({ length: 10 }, (_, i) => (
                  <i key={i} className={shown >= 5 && i >= 2 ? "is-on" : ""} style={{ transitionDelay: `${i * 45}ms` }} />
                ))}
              </span>
            </span>
          </span>
          <span className="lg-policy-block"><small>Insured object</small><strong>Jeep Compass Sport <em>30AA060</em></strong></span>
          <span className="lg-policy-block">
            <small>Attached claim</small>
            <strong>No 0001111 <b className="lg-pill is-blue">Decided</b></strong>
          </span>
        </div>
      </div>
      <nav className="lg-tabs" aria-hidden="true">
        <span className="is-on"><Art name="tab-home" /><small>Home</small></span>
        <span><Art name="tab-contracts" /><small>Contracts</small></span>
        <span><Art name="tab-claims" /><small>Claims</small></span>
        <span><Art name="tab-more" /><small>More</small></span>
      </nav>
      <HomeBar />
    </div>
  );
}

/**
 * The offline modal, over the legal confirmation it interrupts. The list
 * behind it is the file's own: one of its clauses is the reason this screen
 * exists - photos can be taken without internet access.
 */
function OfflineScreen({ active }: { active: boolean }) {
  // 1 the list, 2 scrim, 3 modal, 4 signal drops, 5 buttons
  const shown = useStepper(active, 5, 560, 380);
  const clauses = [
    "Motor accident has occurred",
    "There are only two vehicles involved in the accident, from which at least one has effective CMTPL contract at the time of accident",
    "As a result of accident, the damage has been caused only to vehicles involved in the accident or to one of them",
    "Photos can be taken without internet access, and the vehicles can be removed from the traffic lane"
  ];
  return (
    <div className="lg-screen lg-offline-screen">
      <StatusBar />
      <div className={`lg-behind${shown >= 2 ? " is-dim" : ""}`} aria-hidden="true">
        <header className="lg-head is-plain"><Art name="back" className="lg-back" /><span className="lg-head-text"><strong>Register accident</strong></span></header>
        <p className="lg-confirm-title">I confirm that</p>
        <ol className="lg-confirm">{clauses.map((c, i) => <li key={i}>{i + 1}. {c}</li>)}</ol>
        <Cta tone="muted" shown>I confirm</Cta>
      </div>
      <div className={`lg-scrim${shown >= 2 ? " is-in" : ""}`} aria-hidden="true" />
      <div className={`lg-modal${shown >= 3 ? " is-in" : ""}`}>
        <Art name="modal-close" className="lg-modal-x" />
        <span className={`lg-wifi${shown >= 4 ? " is-off" : ""}`}><Art name="wifi-off" /></span>
        <strong className="lg-modal-title">Offline accident registration</strong>
        <p className="lg-modal-body">
          The device is not connected to the internet network now. Please make sure to submit the accident case <b>within 3 hours after taking photos</b>. Otherwise, you&rsquo;ll need to discard them and restart the process.
        </p>
        <span className={`lg-modal-btns${shown >= 5 ? " is-in" : ""}`}>
          <Cta tone="ghost" shown>Cancel</Cta>
          <Cta shown>Confirm</Cta>
        </span>
      </div>
      <HomeBar />
    </div>
  );
}

/** Step 1/4. The rule and the example come before the camera. */
function PhotosScreen({ active }: { active: boolean }) {
  // 1 head, 2 attach button, 3 + 4 the two photos, 5 image guide
  const shown = useStepper(active, 5, 640, 340);
  return (
    <div className="lg-screen">
      <StatusBar />
      <StepHead step={1} label="Accident photos" />
      <StepBar step={1} fill={shown >= 4 ? 6 : shown >= 3 ? 3 : 0} />
      <p className={`lg-lead${shown >= 1 ? " is-in" : ""}`}>Photos showing mutual positions of the two vehicles involved in the accident</p>
      <div className={`lg-attach${shown >= 2 ? " is-in" : ""}`}>
        <span className="lg-attach-text"><strong>Tap to take photos</strong><small>1-4 photo &middot; Max 5MB</small></span>
        <span className={`lg-cam${shown === 2 ? " is-pulse" : ""}`}><Art name="camera" /></span>
      </div>
      <div className="lg-thumbs" aria-hidden="true">
        <span className={`lg-thumb${shown >= 3 ? " is-in" : ""}`}><Art name="cars" ext="webp" /></span>
        <span className={`lg-thumb${shown >= 4 ? " is-in" : ""}`}><Art name="cars" ext="webp" /></span>
      </div>
      <div className={`lg-guide${shown >= 5 ? " is-in" : ""}`}>
        <span className="lg-guide-head">
          <Art name="info" className="lg-info" />
          <strong>Image guide</strong>
          <Art name="close-circle" className="lg-guide-x" />
        </span>
        <p>At least one photo must show vehicles entirely from the same position as shown in examples below:</p>
        <span className="lg-guide-shot"><Art name="cars" ext="webp" /></span>
      </div>
      <Cta shown={shown >= 2}>Continue</Cta>
      <HomeBar />
    </div>
  );
}

/** Step 2/4. A keyboard is the wrong instrument for a wet phone. */
function WhenWhereScreen({ active }: { active: boolean }) {
  // 1 head, 2 date fills, 3 pin pings, 4 location fills
  const shown = useStepper(active, 4, 760, 420);
  return (
    <div className="lg-screen">
      <StatusBar />
      <StepHead step={2} label="Date and location" />
      <StepBar step={2} fill={shown >= 4 ? 8 : shown >= 2 ? 4 : 0} />
      <div className="lg-fields">
        <div className={`lg-field${shown >= 2 ? " is-filled" : ""}`}>
          <span className="lg-field-text"><small>Date and time</small>{shown >= 2 ? <strong>12 Jun, 2025, 10:00</strong> : null}</span>
          <Art name="field-calendar" className="lg-field-ico" />
        </div>
        <div className={`lg-field${shown >= 4 ? " is-filled" : ""}${shown === 3 ? " is-ping" : ""}`}>
          <span className="lg-field-text"><small>Location</small>{shown >= 4 ? <strong>Yerevan, Hrachya Kochar str, 15</strong> : null}</span>
          <Art name="field-pin" className="lg-field-ico" />
        </div>
      </div>
      <div className="lg-spacer" />
      <Cta shown>Continue</Cta>
      <HomeBar />
    </div>
  );
}

/** Steps 3 and 4. The same screen twice, the second time faster. */
function DocsScreen({ active, mine }: { active: boolean; mine: boolean }) {
  // 1 head, 2 segmented picks licence, 3 front, 4 back, 5 number + phone
  const shown = useStepper(active, 5, mine ? 380 : 620, mine ? 220 : 340);
  const step = mine ? 4 : 3;
  return (
    <div className="lg-screen">
      <StatusBar />
      <StepHead step={step} label={mine ? "Innocent car" : "Guilty car"} />
      <StepBar step={step} fill={shown >= 5 ? 9 : shown >= 4 ? 6 : shown >= 3 ? 3 : 0} />
      <p className={`lg-lead${shown >= 1 ? " is-in" : ""}`}>Take a photo of the registration certificate</p>
      <small className={`lg-sub${shown >= 1 ? " is-in" : ""}`}>Select the document type you want to attach</small>
      <div className={`lg-seg${shown >= 2 ? " is-second" : ""}`} aria-hidden="true">
        <span>ID card</span>
        <span>Driver license</span>
      </div>
      <div className={`lg-attach is-doc is-in${shown >= 3 ? " is-filled" : ""}`}>
        <span className="lg-attach-text"><strong>Front</strong><small>If the picture is bad please retake it</small></span>
        <span className="lg-doc">{shown >= 3 ? <Art name="doc-front" ext="webp" /> : null}</span>
      </div>
      <div className={`lg-attach is-doc is-in${shown >= 4 ? " is-filled" : ""}`}>
        <span className="lg-attach-text"><strong>Back</strong><small>If the picture is bad please retake it</small></span>
        <span className="lg-doc">{shown >= 4 ? <Art name="doc-back" ext="webp" /> : null}</span>
      </div>
      <div className="lg-fields is-tight">
        <div className={`lg-field${shown >= 5 ? " is-filled" : ""}`}>
          <span className="lg-field-text"><small>Attached document number</small>{shown >= 5 ? <strong>006950554</strong> : null}</span>
        </div>
        <div className={`lg-field${shown >= 5 ? " is-filled" : ""}`}>
          <span className="lg-field-text"><small>Phone number</small>{shown >= 5 ? <strong>+374 77 15-20-88</strong> : null}</span>
        </div>
      </div>
      <Cta shown>{mine ? "Complete application" : "Continue"}</Cta>
      <HomeBar />
    </div>
  );
}

/** It ends with a sentence, not a number. */
function SubmittedScreen({ active }: { active: boolean }) {
  // 1 the tick, 2 title, 3 body, 4 buttons
  const shown = useStepper(active, 4, 520, 420);
  return (
    <div className="lg-screen lg-submitted-screen">
      <StatusBar />
      <span className="lg-close-top"><Art name="modal-close" /></span>
      <div className="lg-done">
        <span className={`lg-success${shown >= 1 ? " is-in" : ""}`}><Art name="success" /></span>
        <strong className={`lg-done-title${shown >= 2 ? " is-in" : ""}`}>Application successfully created</strong>
        <p className={`lg-done-body${shown >= 3 ? " is-in" : ""}`}>Your car accident application has been successfully created and is now under review. You will be notified once further action is required</p>
      </div>
      <div className={`lg-done-btns${shown >= 4 ? " is-in" : ""}`}>
        <Cta tone="ghost" shown><Art name="download" className="lg-dl" />Download application</Cta>
        <Cta shown>Applications</Cta>
      </div>
      <HomeBar />
    </div>
  );
}

/** A claim that explains itself: five states, dates, and a moved date in words. */
function ClaimStatusScreen({ active }: { active: boolean }) {
  // 1 head + chip, 2..6 the five states, 7 the tooltip and the details
  const shown = useStepper(active, 7, 440, 320);
  const rows = [
    { key: "received", label: "Received", date: "12 Aug, 2025", tone: "blue" as const },
    { key: "accepted", label: "Accepted", date: "12 Aug, 2025", tone: "blue" as const },
    { key: "inspected", label: "Inspected", date: "Expected 18 Aug, 2025", tone: "amber" as const },
    { key: "decided", label: "Decided", date: "", tone: "blue" as const },
    { key: "paid", label: "Paid", date: "", tone: "green" as const }
  ];
  return (
    <div className="lg-screen lg-claim-screen">
      <StatusBar />
      <header className={`lg-head is-plain${shown >= 1 ? " is-in" : ""}`}>
        <Art name="back" className="lg-back" />
        <span className="lg-head-text"><strong>Claim status</strong></span>
        <span className="lg-dots" aria-hidden="true"><i /><i /><i /></span>
      </header>
      <div className={`lg-card lg-claim-chip${shown >= 1 ? " is-in" : ""}`}>
        <Art name="policy-car" className="lg-policy-ico" />
        <span className="lg-policy-name">
          <strong>CMTPL claim</strong>
          <em className="lg-chip">AE 123456123456 <Art name="copy" className="lg-copy" /></em>
        </span>
      </div>
      <p className={`lg-sec is-caps${shown >= 2 ? " is-in" : ""}`}>Claim stage</p>
      <div className="lg-timeline">
        {rows.map((r, i) => {
          const on = shown >= i + 2;
          const done = i < 2 && on;
          return (
            <span className={`lg-tl${on ? " is-in" : ""}${done ? " is-done" : ""}`} key={r.key}>
              <i className="lg-tl-dot" aria-hidden="true">
                <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" className="lg-tl-ring" /><path d="M6 10.3 8.7 13l5.3-5.8" className="lg-tl-tick" /></svg>
              </i>
              <em className={`lg-pill is-${r.tone}`}>{r.label}</em>
              {r.date ? <small className={r.tone === "amber" ? "is-amber" : ""}>{r.date}</small> : null}
            </span>
          );
        })}
        <span className={`lg-tip${shown >= 7 ? " is-in" : ""}`}>Expected date has been postponed by 3 days</span>
      </div>
      <p className={`lg-sec is-caps${shown >= 7 ? " is-in" : ""}`}>Details</p>
      <div className={`lg-details${shown >= 7 ? " is-in" : ""}`}>
        <span><small>Accident date</small><strong>08 Jun, 2025</strong></span>
        <span><small>Name / surname</small><strong>Poghos Poghosyan</strong></span>
        <span><small>What service do you need</small><strong>Repair at a partner service</strong></span>
      </div>
      <HomeBar />
    </div>
  );
}

const SCREENS: Record<LigaScreenId, (props: { active: boolean }) => ReactNode> = {
  home: HomeScreen,
  offline: OfflineScreen,
  photos: PhotosScreen,
  "when-where": WhenWhereScreen,
  "their-docs": ({ active }) => <DocsScreen active={active} mine={false} />,
  "your-docs": ({ active }) => <DocsScreen active={active} mine />,
  submitted: SubmittedScreen,
  "claim-status": ClaimStatusScreen
};

/* ------------------------------------------------------------------ frames */

/** A phone frame with one screen inside. */
export function LigaPhone({ screen, active = true, className = "", frame = true }: { screen: LigaScreenId; active?: boolean; className?: string; frame?: boolean }) {
  const Screen = SCREENS[screen];
  if (!frame) {
    return (
      <div className={`lg-phone-screen is-bare${active ? " is-active" : ""} ${className}`}>
        <Screen active={active} />
      </div>
    );
  }
  return (
    <div className={`lg-phone${active ? " is-active" : ""} ${className}`}>
      <div className="lg-phone-screen">
        <Screen active={active} />
      </div>
    </div>
  );
}

/**
 * One region of a coded screen, windowed and scaled - a UI element rather
 * than a device mockup. `top` and `h` are in the design file's pixels (the
 * screen is 393x854); `width` is the rendered width.
 */
export function LigaFragment({
  screen,
  top = 0,
  h = 260,
  width = 300,
  className = ""
}: {
  screen: LigaScreenId;
  top?: number;
  h?: number;
  width?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.25 });
    io.observe(host);
    return () => io.disconnect();
  }, []);
  const scale = width / 393;
  return (
    <div
      className={`lg-fragment ${className}`}
      style={{ width, height: Math.round(h * scale) }}
      ref={ref}
      aria-hidden="true"
    >
      <div className="lg-fragment-inner" style={{ transform: `scale(${scale}) translateY(${-top}px)` }}>
        <LigaPhone screen={screen} active={active} frame={false} />
      </div>
    </div>
  );
}

/**
 * The component each design-system tile is about, cropped out of the screen
 * it actually lives in. Keyed by the tile's label in the content file.
 */
export const LIGA_SYSTEM_FRAGMENTS: Record<string, { screen: LigaScreenId; top: number; h: number }> = {
  Claims: { screen: "claim-status", top: 150, h: 268 },
  Capture: { screen: "photos", top: 492, h: 244 },
  Contracts: { screen: "home", top: 572, h: 238 },
  UI: { screen: "offline", top: 470, h: 152 }
};

/**
 * A phone that plays when it scrolls into view and resets when it leaves, so
 * a card lower on the page animates on arrival instead of on page load.
 */
export function LigaPhoneInView({ screen, className = "", frame = true }: { screen: LigaScreenId; className?: string; frame?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === "undefined") { setActive(true); return; }
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.35 });
    io.observe(host);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="lg-inview">
      <LigaPhone screen={screen} active={active} className={className} frame={frame} />
    </div>
  );
}
