import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Check, ChevronRight, CircleUserRound, Landmark, ListFilter, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import "./nesbaCase.css";

export type NesbaScreenId = "home" | "explore" | "consent" | "identity";

function useActiveInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.38 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, active };
}

function PhoneChrome({ children, active, className = "" }: { children: ReactNode; active: boolean; className?: string }) {
  return (
    <div className={`ns-phone ${active ? "is-active" : ""} ${className}`}>
      <div className="ns-phone-notch" aria-hidden="true" />
      <div className="ns-phone-screen">{children}</div>
    </div>
  );
}

function Status() {
  return <div className="ns-status" aria-hidden="true"><b>9:41</b><span>▮▮▮　◒　▰</span></div>;
}

function BottomNav({ page }: { page: "home" | "explore" | "activity" }) {
  return <nav className="ns-bottom-nav" aria-hidden="true">
    <span className={page === "home" ? "is-active" : ""}><span className="ns-nav-home">⌂</span>Home</span>
    <span className={page === "explore" ? "is-active" : ""}><Search />Explore</span>
    <span className={page === "activity" ? "is-active" : ""}><ListFilter />Activity</span>
  </nav>;
}

function FundMark({ tone }: { tone: "cyan" | "blue" | "lime" | "orange" }) {
  return <i className={`ns-fund-mark is-${tone}`} aria-hidden="true">✦</i>;
}

function HomeScreen() {
  return <>
    <Status />
    <header className="ns-app-head"><span>Welcome to Nesba!</span><Bell /></header>
    <div className="ns-segmented"><b>Your money</b><span>Your investments<i /></span></div>
    <div className="ns-home-amount"><small>SAR</small><strong>0</strong></div>
    <div className="ns-empty-state"><h3>No Investment Yet</h3><p>Complete your investor profile to get recommendations and invest.</p></div>
    <div className="ns-recommendations">
      <small>Recommended</small>
      {[
        ["Arqa Growth Fund", "Sukuk", "24.5%", "cyan"],
        ["Nesba Global Tech", "Equity Fund", "19.2%", "blue"],
        ["Mizan Sustain REIT", "Real Estate Trust", "21%", "orange"]
      ].map(([name, type, returnValue, tone]) => <div className="ns-fund-row" key={name}><FundMark tone={tone as "cyan" | "blue" | "orange"} /><span><b>{name}</b><small>{type}</small></span><strong><TrendingUp /> {returnValue}</strong></div>)}
    </div>
    <button className="ns-primary">Start investing</button>
    <BottomNav page="home" />
  </>;
}

function Ticker({ symbol, value, up }: { symbol: string; value: string; up?: boolean }) {
  return <div className="ns-ticker"><FundMark tone={up ? "cyan" : "lime"} /><span><b>{symbol}</b><small>400 SAR</small></span><strong className={up ? "is-up" : "is-down"}>{up ? "▲" : "▼"} {value}</strong></div>;
}

function ExploreScreen() {
  return <>
    <Status />
    <header className="ns-app-head"><span>Explore</span><span className="ns-head-icons"><Bell /><CircleUserRound /></span></header>
    <div className="ns-search"><Search /><span>Search stocks and ETFs</span></div>
    <div className="ns-chips"><b>Stocks</b><span>Crypto</span><span>Futures</span><span>ETFs</span></div>
    <div className="ns-screen-section"><h4>Largest UAE Companies <ChevronRight /></h4><div className="ns-ticker-grid"><Ticker symbol="SOFI" value="2%" up /><Ticker symbol="Coin" value="32%" up /><Ticker symbol="NVDA" value="12%" /><Ticker symbol="PLTR" value="6%" /></div></div>
    <div className="ns-screen-section"><h4>Stock Categories <ChevronRight /></h4><div className="ns-category-grid"><span>Top 25 <b>+34</b></span><span>Technology <b>+63</b></span><span>Dividend stocks <b>+189</b></span><span>ETFs <b>+143</b></span></div></div>
    <aside className="ns-recommend-card"><button aria-label="Dismiss">×</button><b>Find the Right Portfolio for You</b><small>Get matched with portfolios that suit your financial goals and risk level.</small><span>Get My Recommendations</span></aside>
    <BottomNav page="explore" />
  </>;
}

function ConsentScreen() {
  return <>
    <Status />
    <header className="ns-app-head"><span>Connect bank</span><ShieldCheck /></header>
    <div className="ns-consent-icon"><Landmark /></div>
    <h3 className="ns-screen-title">One cash-flow picture</h3>
    <p className="ns-screen-lead">Link accounts securely to see income, spending, and investable surplus in one place.</p>
    <div className="ns-bank-list">
      <div><span className="ns-bank-logo is-snb">SNB</span><b>Saudi National Bank</b><Check /></div>
      <div><span className="ns-bank-logo is-rajhi">A</span><b>Al Rajhi Bank</b><Check /></div>
    </div>
    <div className="ns-consent-sheet"><span className="ns-sheet-handle" /><b>Read-only account access</b><p>Your balances and transactions help tailor recommendations. You can disconnect at any time.</p><span className="ns-permission"><ShieldCheck /> Protected by SAMA Open Banking</span><button className="ns-primary">Continue securely</button><small>Cancel</small></div>
  </>;
}

function IdentityScreen() {
  const rows = [["Full name", "John Doe"], ["Phone number", "+966 5X XXX XXXX"], ["Passcode", "••••••"], ["Investor profile", "Opt Out"], ["Language", "Arabic"]];
  return <>
    <Status />
    <header className="ns-app-head"><ChevronRight className="ns-back" /><span>Settings</span><span /></header>
    <div className="ns-settings-top"><span>Help and Support <ChevronRight /></span><span>Learning Materials <ChevronRight /></span></div>
    <div className="ns-settings-list">{rows.map(([label, value], index) => <div key={label}><CircleUserRound /><span><small>{label}</small><b className={index === 3 ? "ns-optout" : ""}>{value}</b></span><ChevronRight /></div>)}</div>
    <p className="ns-reverify-note">Changing your phone will re-trigger Nafath identity verification.</p>
    <div className="ns-verified"><ShieldCheck /><span><b>Nafath verified</b><small>Your identity is protected</small></span></div>
    <BottomNav page="activity" />
  </>;
}

export function NesbaPhoneInView({ screen, className = "" }: { screen: NesbaScreenId; className?: string }) {
  const { ref, active } = useActiveInView();
  const screens: Record<NesbaScreenId, ReactNode> = { home: <HomeScreen />, explore: <ExploreScreen />, consent: <ConsentScreen />, identity: <IdentityScreen /> };
  return <div className={`ns-inview ${className}`} ref={ref}><PhoneChrome active={active}>{screens[screen]}</PhoneChrome></div>;
}

export function NesbaConsentFlow() {
  const { ref, active } = useActiveInView();
  return <div className={`ns-flow ${active ? "is-active" : ""}`} ref={ref}>
    <div className="ns-flow-copy"><span>Secure connection</span><b>Consent is part of the product, not hidden plumbing.</b><p>Account colors carry through from connection to the financial picture.</p></div>
    <div className="ns-flow-path" aria-hidden="true"><i /><i /><i /></div>
    <div className="ns-flow-phones"><PhoneChrome active={active} className="ns-flow-phone is-consent"><ConsentScreen /></PhoneChrome><PhoneChrome active={active} className="ns-flow-phone is-result"><ExploreScreen /></PhoneChrome></div>
  </div>;
}
