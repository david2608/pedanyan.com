import { useEffect, useRef, useState, type ReactNode } from "react";
import "./icredoCase.css";

/**
 * iCredo product screens, rebuilt in code from the Figma exports so the case
 * study can animate them. Everything the reader sees inside a phone is the
 * shipped Armenian-first UI: same copy, palette, radii and layout as the
 * design file (chat, summary, credit check, KYC, My Loans). The only
 * exception is `calculator`, a reconstruction of the web calculator the app
 * replaced - there is no Figma for the "before".
 *
 * Each screen animates when `active` flips true and resets when it flips
 * false, so a pinned walkthrough replays it on every pass.
 */

export type IcredoScreenId = "calculator" | "chat-amount" | "chat-plan" | "summary" | "checking" | "kyc" | "loans";

const BOT = "Կրեդո";
const USER = "Տիրան";

/* ------------------------------------------------------------- primitives */

function StatusBar() {
  return (
    <div className="ic-status" aria-hidden="true">
      <span className="ic-status-time">12.27</span>
      <span className="ic-status-right">
        <svg viewBox="0 0 18 12" className="ic-status-signal"><rect x="0" y="8" width="3" height="4" rx="0.8" /><rect x="5" y="5.5" width="3" height="6.5" rx="0.8" /><rect x="10" y="3" width="3" height="9" rx="0.8" /><rect x="15" y="0" width="3" height="12" rx="0.8" /></svg>
        <svg viewBox="0 0 16 12" className="ic-status-wifi"><path d="M8 11.2 1.6 4.8a9 9 0 0 1 12.8 0L8 11.2Z" opacity="0.28" /><path d="M8 11.2 4.2 7.4a5.4 5.4 0 0 1 7.6 0L8 11.2Z" /></svg>
        <svg viewBox="0 0 27 12" className="ic-status-battery"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="12" height="8" rx="1.6" /><path d="M24.5 4v4a2 2 0 0 0 0-4Z" opacity="0.4" /></svg>
      </span>
    </div>
  );
}

function HomeBar() {
  return <span className="ic-home" aria-hidden="true" />;
}

/** The Credo mark, from the brand SVG (198x207, #a60029). */
const CREDO_MARK_PATH =
  "M121.742 190.557C75.6359 201.999 30.6233 178.261 10.4308 132.323L90.612 96.119C92.2947 95.3505 93.1361 93.3866 92.463 91.5934C88.2562 80.237 83.0398 69.222 75.9724 56.6701C74.8787 54.7062 72.1022 54.2793 70.5036 55.8162L6.98124 117.978C-4.29293 69.1366 22.3781 23.1984 66.0444 6.46251L103.232 90.2272C117.451 84.3355 126.874 80.1516 141.262 72.8083C143.365 71.6982 143.87 68.8805 142.187 67.1727L79.3379 2.53471C126.033 -7.9679 170.709 14.6597 191.406 61.281L107.187 99.1929C113.16 112.684 118.209 123.443 125.276 136.678C126.37 138.727 129.146 139.239 130.745 137.617L195.361 75.1991C206.046 123.272 180.805 168.271 136.298 187.227L98.6049 103.121C84.0495 109.781 73.9532 114.563 61.0804 121.223C58.977 122.333 58.4722 125.151 60.1549 126.858L121.826 190.557H121.742Z";

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 198 207" className={`ic-mark ${className}`} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d={CREDO_MARK_PATH} fill="#a60029" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="ic-wordmark" aria-hidden="true">
      CRED<Mark />
    </span>
  );
}

function IconButton({ kind }: { kind: "close" | "back" | "bell" | "calendar" | "plus" | "eye" | "trash" }) {
  const icon: Record<typeof kind, ReactNode> = {
    close: <svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    back: <svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    bell: <svg viewBox="0 0 16 16"><path d="M8 1.8a4 4 0 0 0-4 4v2.6L2.6 11h10.8L12 8.4V5.8a4 4 0 0 0-4-4Z" /><path d="M6.4 12.4a1.6 1.6 0 0 0 3.2 0Z" /></svg>,
    calendar: <svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    plus: <svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    eye: <svg viewBox="0 0 16 16"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="8" r="2" /></svg>,
    trash: <svg viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  };
  return <span className={`ic-iconbtn is-${kind}`} aria-hidden="true">{icon[kind]}</span>;
}

function SendButton({ shown = true }: { shown?: boolean }) {
  return (
    <span className={`ic-send${shown ? " is-in" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 20 20"><path d="M17.4 2.6 2.9 8.5c-.9.4-.9 1.6.1 1.9l3.7 1.2 1.2 3.7c.3 1 1.5 1 1.9.1l5.9-14.5c.3-.8-.5-1.6-1.3-1.3Z" fill="#fff" /><path d="m6.7 11.6 5.4-5.4" stroke="#1e60e5" strokeWidth="1.3" strokeLinecap="round" /></svg>
    </span>
  );
}

function Tick() {
  return <svg viewBox="0 0 12 10" className="ic-tick"><path d="M1.5 5.2 4.4 8l6-6.4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** Reveals children one after another; restarts whenever `active` flips. */
function useStepper(active: boolean, count: number, stepMs = 520, startMs = 260) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }
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

/* ------------------------------------------------------------- chat parts */

function Msg({ who, children, shown, label = true }: { who: "bot" | "user"; children: ReactNode; shown: boolean; label?: boolean }) {
  return (
    <div className={`ic-msg is-${who}${shown ? " is-in" : ""}`}>
      {label ? <span className="ic-msg-name">{who === "bot" ? BOT : USER}</span> : null}
      <p>{children}</p>
    </div>
  );
}

function Typing({ shown }: { shown: boolean }) {
  return (
    <div className={`ic-typing${shown ? " is-in" : ""}`} aria-hidden="true">
      <i /><i /><i />
    </div>
  );
}

function Dots({ active }: { active: number }) {
  return (
    <span className="ic-dots" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => <i key={i} className={i === active ? "is-active" : ""} />)}
    </span>
  );
}

function Composer({ shown, chips, picked = -1, placeholder }: { shown: boolean; chips: string[]; picked?: number; placeholder: string }) {
  return (
    <div className={`ic-composer${shown ? " is-in" : ""}`}>
      <div className="ic-chips">
        {chips.map((chip, i) => <span key={chip} className={i === picked ? "is-picked" : ""}>{chip}</span>)}
      </div>
      <div className="ic-input">
        <span className="ic-placeholder">{placeholder}</span>
        <SendButton />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- screens */

/** The "before": Credo's web calculator, reconstructed. Nine fields, one button. */
function CalculatorScreen({ active }: { active: boolean }) {
  const fields = ["Վարկի գումար", "Ժամկետ (ամիս)", "Վարկի նպատակ", "Ամսական եկամուտ", "Գործատու", "Պաշտոն", "Հեռախոս", "ID քարտի համար", "Համավարկառու"];
  const shown = useStepper(active, fields.length + 1, 130, 200);
  return (
    <div className="ic-screen ic-calc">
      <StatusBar />
      <div className="ic-urlbar" aria-hidden="true"><i /><span>credo.am/calculator</span></div>
      <p className="ic-calc-title">Վարկի հաշվիչ</p>
      <div className="ic-calc-form">
        {fields.map((label, i) => (
          <label className={`ic-field${shown > i ? " is-in" : ""}`} key={label}>
            <span>{label}</span>
            <i />
          </label>
        ))}
        <span className={`ic-calc-check${shown > 8 ? " is-in" : ""}`}><i /> Համաձայն եմ պայմաններին</span>
        <span className={`ic-calc-check${shown > 8 ? " is-in" : ""}`}><i /> Համաձայն եմ տվյալների մշակմանը</span>
      </div>
      <span className={`ic-cta is-grey${shown > 9 ? " is-in" : ""}`}>Հաշվել</span>
      <HomeBar />
    </div>
  );
}

/** chat-flow.png: how much, then how you would like it calculated. */
function ChatAmountScreen({ active }: { active: boolean }) {
  const shown = useStepper(active, 6, 680, 300);
  return (
    <div className="ic-screen ic-chat">
      <StatusBar />
      <div className="ic-head"><Wordmark /><IconButton kind="close" /></div>
      <div className="ic-thread">
        <Msg who="bot" shown={shown >= 1}>Որքա՞ն գումար է քեզ պետք</Msg>
        <Msg who="user" shown={shown >= 2}>1,000,000 դրամ</Msg>
        <Typing shown={shown === 3} />
        <Msg who="bot" shown={shown >= 4}>Ընտրեք, թե ինչպես եք ուզում հաշվարկել վարկը՝</Msg>
      </div>
      <Dots active={2} />
      <Composer shown={shown >= 5} chips={["Ըստ Ամսավճարի", "Ըստ Ժամկետի"]} picked={shown >= 6 ? 0 : -1} placeholder="Ընտրեք կամ մուտքագրեք" />
      <HomeBar />
    </div>
  );
}

/** 01-chat.svg: by monthly payment, then the payment you are comfortable with. */
function ChatPlanScreen({ active }: { active: boolean }) {
  const shown = useStepper(active, 7, 620, 300);
  return (
    <div className="ic-screen ic-chat">
      <StatusBar />
      <div className="ic-head"><Wordmark /><IconButton kind="close" /></div>
      <div className="ic-thread">
        <Msg who="bot" shown={shown >= 1} label={false}>Ընտրեք, թե ինչպես եք ուզում հաշվարկել վարկը՝</Msg>
        <Msg who="user" shown={shown >= 2}>
          <strong>Ըստ Ամսավճարի</strong>
          Դուք նշում եք, թե որքան գումար եք պատրաստ վճարել ամեն ամիս, և մենք հաշվարկում ենք՝ ինչ ժամկետով և ինչ պայմաններով կարող եք ստանալ վարկը:
        </Msg>
        <Typing shown={shown === 3} />
        <Msg who="bot" shown={shown >= 4}>Ընտրեք կամ մուտքագրեք, ձեզ հարմար առաջնային ամսեկան վճարի չափը:</Msg>
        <Msg who="user" shown={shown >= 6}>50,000 դրամ</Msg>
      </div>
      <Dots active={2} />
      <Composer shown={shown >= 5} chips={["50,000 ֏", "100,000 ֏", "250,000 ֏", "500,000 ֏"]} picked={shown >= 6 ? 0 : -1} placeholder="Մուտքագրեք վճարի չափը" />
      <HomeBar />
    </div>
  );
}

/** 02-summary.svg → 03-details.svg: the loan in five lines, three consents, one button. */
function SummaryScreen({ active }: { active: boolean }) {
  const rows: Array<[string, string]> = [
    ["Վարկի գումար:", "1,000,000 դրամ"],
    ["Ժամկետ:", "24 ամիս"],
    ["Ամսական վճար:", "47,073 դրամ"],
    ["Վարկի տեսակ:", "Անգրավ"],
    ["Փաստացի տոկոսադրույք:", "12% տարեկան"]
  ];
  const consents = [
    <>Ծանոթ եմ պայմաններին<a>Տեսնել պայմանները</a></>,
    <>Ծանոթացել և համաձայն եմ անձնական տվյալների հարցման պայմաններին</>,
    <>Տեղեկացում, որ համաձայն է բազաների ստուգումների հետ</>
  ];
  // 1 card, 3 consents ticking, 1 button turning blue
  const shown = useStepper(active, 5, 560, 300);
  return (
    <div className="ic-screen ic-summary">
      <StatusBar />
      <div className="ic-head"><Wordmark /><IconButton kind="close" /></div>
      <div className={`ic-card ic-summary-card${shown >= 1 ? " is-in" : ""}`}>
        {rows.map(([k, v]) => (
          <div className="ic-summary-row" key={k}><span>{k}</span><strong>{v}</strong></div>
        ))}
      </div>
      <ul className="ic-consents">
        {consents.map((text, i) => (
          <li key={i} className={shown >= i + 2 ? "is-on" : ""}>
            <i className="ic-checkbox"><Tick /></i>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className="ic-composer is-in is-flat">
        <div className="ic-chips"><span>Փոխել գումարը</span><span>Փոխել ժամկետը</span><span>Փոխել տեսակը</span></div>
        <span className={`ic-cta${shown >= 5 ? " is-in" : " is-grey is-in"}`}>Դիմել</span>
      </div>
      <HomeBar />
    </div>
  );
}

/** 04-loading.svg: the credit check, with the logo inside the ring. */
function CheckingScreen({ active }: { active: boolean }) {
  const TICKS = 16;
  const shown = useStepper(active, TICKS, 150, 400);
  return (
    <div className="ic-screen ic-checking">
      <StatusBar />
      <div className="ic-checking-body">
        <div className="ic-spinner" aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => (
            <i key={i} className={shown > i ? "is-on" : ""} style={{ transform: `rotate(${(360 / TICKS) * i}deg)` }} />
          ))}
          <Mark className="ic-spinner-mark" />
        </div>
        <p className="ic-checking-title">Ստուգում ենք քո վարկային տվյալները</p>
        <p className="ic-checking-sub">Կատարում ենք վարկային պատմության ստուգում: Սա կտևի ընդամենը մի քանի վայրկյան</p>
      </div>
      <HomeBar />
    </div>
  );
}

/** kyc.png: photograph the ID card; the ring says how far along you are. */
function KycScreen({ active }: { active: boolean }) {
  const shown = useStepper(active, 3, 900, 300);
  const ring = shown >= 3 ? 2 : 1;
  return (
    <div className="ic-screen ic-kyc">
      <StatusBar />
      <div className="ic-kyc-head">
        <IconButton kind="back" />
        <div className="ic-kyc-copy">
          <p className="ic-kyc-title">ID քարտ</p>
          <p className="ic-kyc-sub">Լուսանկարեք ձեր ID քարտը և համոզվեք, որ բոլոր տվյալները հստակ տեսանելի են:</p>
        </div>
        <span className="ic-ring" style={{ ["--ring" as string]: ring / 3 }}><span>{ring}/3</span></span>
      </div>
      <div className={`ic-id-frame${shown >= 1 ? " is-in" : ""}`}>
        <div className="ic-id-card" aria-hidden="true">
          <span className="ic-id-country">ՀԱՅԱՍՏԱՆԻ ՀԱՆՐԱՊԵՏՈՒԹՅՈՒՆ<br />REPUBLIC OF ARMENIA · ID CARD</span>
          <span className="ic-id-photo"><i /></span>
          <span className="ic-id-lines"><i /><i /><i /><i /></span>
          <span className="ic-id-number">000846956</span>
          <span className={`ic-id-scan${shown === 2 ? " is-on" : ""}`} />
          <IconButton kind="trash" />
        </div>
      </div>
      <span className={`ic-cta is-in${shown >= 3 ? "" : " is-grey"}`}>Հաստատել</span>
      <HomeBar />
    </div>
  );
}

/** my-loans.png: the loan after approval. */
function LoansScreen({ active }: { active: boolean }) {
  const shown = useStepper(active, 3, 380, 300);
  type Loan = { name: string; id: string; remaining: string; progress: string; next?: string; late?: boolean; repaid?: boolean };
  const loans: Loan[] = [
    { name: "Անգրավ վարկ", id: "N00101984", remaining: "847,300 դրամ", progress: "17%", next: "47,073 դրամ / 25.05.26" },
    { name: "Ապառիկ", id: "N00097412", remaining: "236,500 դրամ", progress: "62%", next: "39,400 դրամ / 10.05.26", late: true },
    { name: "Անգրավ վարկ", id: "N00081153", remaining: "500,000 դրամ", progress: "100%", repaid: true }
  ];
  const LoanCard = ({ index, loan }: { index: number; loan: Loan }) => (
    <div className={`ic-card ic-loan${shown > index ? " is-in" : ""}${loan.repaid ? " is-repaid" : ""}`}>
      <div className="ic-loan-head">
        <div>
          <strong>{loan.name}</strong>
          <small>{loan.id}</small>
        </div>
        <span className={`ic-pill${loan.repaid ? " is-grey" : ""}`}>{loan.repaid ? "Մարված է" : "Ակտիվ է"}</span>
      </div>
      <div className="ic-loan-row"><span>{loan.repaid ? "Վարկը մարված է:" : "Մնացել է:"}</span><strong>{loan.remaining}</strong></div>
      <span className="ic-bar"><i style={{ width: shown > index ? loan.progress : "0%" }} /></span>
      {loan.repaid ? null : (
        <>
          <div className="ic-loan-row"><span>Հաջորդ վճարում:</span><strong>{loan.next}</strong></div>
          {loan.late ? <span className="ic-loan-late">Դուք ունեք ուշացում</span> : null}
        </>
      )}
      <span className="ic-loan-divider" />
      <div className="ic-loan-actions">
        <span className={`ic-btn${loan.repaid ? " is-grey" : ""}`}>{loan.repaid ? "Մանրամասներ" : "Վարկի Մարում"}</span>
        {loan.repaid ? null : <IconButton kind="eye" />}
      </div>
    </div>
  );
  return (
    <div className="ic-screen ic-loans">
      <StatusBar />
      <div className="ic-head is-left"><Wordmark /><IconButton kind="bell" /></div>
      <div className="ic-loans-tools">
        <span className="ic-filter">Տեսակավորել: <b>Բոլորը</b> <svg viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
        <span className="ic-loans-tools-right"><IconButton kind="calendar" /><IconButton kind="plus" /></span>
      </div>
      <div className="ic-loans-list">
        {loans.map((loan, index) => <LoanCard index={index} loan={loan} key={loan.id} />)}
      </div>
      <nav className="ic-tabs" aria-hidden="true">
        <span><svg viewBox="0 0 20 20"><path d="M3 9.5 10 3l7 6.5V17H3V9.5Z" /><path d="M8 17v-5h4v5" fill="#fff" /></svg>Գլխավոր</span>
        <span className="is-active"><svg viewBox="0 0 20 20"><rect x="3" y="2" width="14" height="16" rx="2.5" /><path d="M7 6h6M7 9.5h6M7 13h3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></svg>Իմ Վարկերը</span>
        <span><svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17.5a6.5 6.5 0 0 1 13 0Z" /></svg>Պրոֆիլ</span>
      </nav>
    </div>
  );
}

const SCREENS: Record<IcredoScreenId, (props: { active: boolean }) => ReactNode> = {
  calculator: CalculatorScreen,
  "chat-amount": ChatAmountScreen,
  "chat-plan": ChatPlanScreen,
  summary: SummaryScreen,
  checking: CheckingScreen,
  kyc: KycScreen,
  loans: LoansScreen
};

export function isIcredoScreen(id: string): id is IcredoScreenId {
  return id in SCREENS;
}

/** A phone frame with one screen inside. */
export function IcredoPhone({ screen, active = true, className = "", frame = true }: { screen: IcredoScreenId; active?: boolean; className?: string; frame?: boolean }) {
  const Screen = SCREENS[screen];
  if (!frame) {
    // Bare screen: for placing the UI inside a photographed phone.
    return (
      <div className={`ic-phone-screen is-bare${active ? " is-active" : ""} ${className}`}>
        <Screen active={active} />
      </div>
    );
  }
  return (
    <div className={`ic-phone${active ? " is-active" : ""} ${className}`}>
      <div className="ic-phone-screen">
        <Screen active={active} />
      </div>
    </div>
  );
}

/**
 * The problem, staged: the old nine-field calculator sits in front, then
 * recedes as the conversation card rises over it and starts talking.
 * A pale plate, no phone frame - the conversation itself is the graphic
 * (the Intercom / ElevenLabs "chat card on a soft plate" pattern).
 */
export function IcredoStoryPlate() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.4 });
    io.observe(host);
    return () => io.disconnect();
  }, []);
  // 1 form settles, 2 chat rises, 3 bot asks, 4 typing, 5 user answers, 6 bot follows up, 7 chips
  const shown = useStepper(active, 7, 700, 500);
  const fields = ["Վարկի գումար", "Ժամկետ", "Նպատակ", "Ամսական եկամուտ", "Գործատու", "Պաշտոն", "Հեռախոս", "ID քարտ", "Համավարկառու"];
  return (
    <div className={`ic-story${active ? " is-active" : ""}`} ref={ref} aria-hidden="true">
      <div className={`ic-ui ic-story-form${shown >= 1 ? " is-in" : ""}${shown >= 2 ? " is-back" : ""}`}>
        <p className="ic-story-form-title">Վարկի հաշվիչ</p>
        <div className="ic-story-fields">
          {fields.map((label) => (
            <span key={label}><small>{label}</small><i /></span>
          ))}
        </div>
        <span className="ic-cta is-grey is-in">Հաշվել</span>
      </div>
      <div className={`ic-ui ic-story-chat${shown >= 2 ? " is-in" : ""}`}>
        <header className="ic-story-chat-head"><Mark /><span>{BOT}</span><i className="ic-story-online" /></header>
        <div className="ic-thread">
          <Msg who="bot" shown={shown >= 3} label={false}>Որքա՞ն գումար է քեզ պետք</Msg>
          <Typing shown={shown === 4} />
          <Msg who="user" shown={shown >= 5}>1,000,000 դրամ</Msg>
          <Msg who="bot" shown={shown >= 6}>Ընտրեք, թե ինչպես եք ուզում հաշվարկել վարկը՝</Msg>
        </div>
        <div className={`ic-chips is-inline${shown >= 7 ? " is-in" : ""}`}><span>Ըստ Ամսավճարի</span><span>Ըստ Ժամկետի</span></div>
      </div>
    </div>
  );
}

/**
 * A photographed phone with the live conversation running on its screen.
 * `rect` is the screen's position in the photo, in percent of the image.
 * The image is optional at build time: if it is missing the whole scene
 * hides itself instead of leaving a broken frame on the page.
 */
export function IcredoHandsScene({
  src = "/portfolio-assets/icredo/hands-phone.png",
  rect = { left: 33.9, top: 19.9, width: 32, height: 50.2 },
  screen = "chat-amount",
  onMissing
}: {
  src?: string;
  rect?: { left: number; top: number; width: number; height: number };
  screen?: IcredoScreenId;
  onMissing?: () => void;
}) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  return (
    <figure className="ic-hands" aria-label="A person holding a phone with the iCredo conversation open">
      <div className="ic-hands-zoom">
      <img
        src={src}
        alt=""
        width={896}
        height={1120}
        loading="lazy"
        decoding="async"
        onError={() => {
          setMissing(true);
          onMissing?.();
        }}
      />
      <div
        className="ic-hands-screen"
        style={{ left: `${rect.left}%`, top: `${rect.top}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
      >
        <IcredoPhoneInView screen={screen} frame={false} />
      </div>
      </div>
    </figure>
  );
}

/**
 * A phone that plays when it scrolls into view and resets when it leaves, so
 * a card lower on the page animates on arrival instead of on page load.
 */
export function IcredoPhoneInView({ screen, className = "", frame = true }: { screen: IcredoScreenId; className?: string; frame?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.35 });
    io.observe(host);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="ic-inview">
      <IcredoPhone screen={screen} active={active} className={className} frame={frame} />
    </div>
  );
}
