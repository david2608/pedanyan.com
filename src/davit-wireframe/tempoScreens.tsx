import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Tempo's product UI rebuilt from the exported Figma screens. These are
 * intentionally DOM screens, not image crops, so their route, cards and
 * status states can be animated independently in the case study.
 */
export type TempoScreenId = "location" | "discover" | "route" | "order" | "handoff";

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, active };
}

function TempoChrome({ children, active, className = "" }: { children: ReactNode; active?: boolean; className?: string }) {
  // Keep the app UI intact: page-level text reveals should not split or hide
  // labels within a compact phone screen.
  return <div className={`tp-phone ${active ? "is-active" : ""} ${className}`} data-no-anim>
    <div className="tp-phone-screen">{children}</div>
  </div>;
}

function Status() {
  return <div className="tp-status" aria-hidden="true"><b>9:41</b><i /><span className="tp-signal" /><span className="tp-wifi" /><span className="tp-battery" /></div>;
}

function AppHeader({ title, tools = false }: { title: string; tools?: boolean }) {
  return <header className="tp-app-header"><b className="tp-back">←</b><strong>{title}</strong>{tools ? <span className="tp-tools"><i>⌑</i><i>＋</i></span> : <span />}</header>;
}

function BottomAction({ children }: { children: ReactNode }) {
  return <div className="tp-bottom-action"><button>{children}</button></div>;
}

function Map({ compact = false, route = false }: { compact?: boolean; route?: boolean }) {
  return <div className={`tp-map ${compact ? "is-compact" : ""} ${route ? "has-route" : ""}`} aria-hidden="true">
    <i /><i /><i /><i /><i /><i /><i /><i />
    {route ? <><svg viewBox="0 0 300 330" preserveAspectRatio="none"><polyline points="36,118 108,76 154,101 204,50 238,78 224,164 132,242 184,286" /><polyline className="tp-route-red" points="36,118 88,172 132,242" /></svg><b className="tp-stop is-one">1</b><b className="tp-stop is-two">2</b><b className="tp-stop is-flag">⚑</b></> : <><b className="tp-pin" /><b className="tp-map-dot" /></>}
  </div>;
}

function LocationScreen() {
  return <><Status /><div className="tp-location-hero"><div className="tp-location-art" aria-hidden="true"><i /><i /><i /><b /></div><h3>Hello, Name</h3><p>Please, set up your location to start exploring what’s near you.</p></div><BottomAction>Set Location</BottomAction></>;
}

function DiscoverScreen() {
  const categories = [["↕", "Filters"], ["△", "Pizza"], ["▤", "Burgers"], ["◒", "Breakfast"], ["⌘", "Wok"]];
  return <><Status /><AppHeader title="Restaurants" /><div className="tp-search"><b>⌕</b><span>Search place or product</span></div><div className="tp-category-row">{categories.map(([icon, label], index) => <span key={label} className={index === 0 ? "is-selected" : ""}><i>{icon}</i>{label}</span>)}</div><div className="tp-discover-title"><h3>Special offers</h3><span>View all　›</span></div><div className="tp-offer-card"><div className="tp-food is-pizza"><b>-25%</b></div><strong>Restaurant name <em>★ 4.1</em></strong><p>Pizza · Italian · Spicy</p><div><span>25-35min</span><span>Free delivery</span></div></div><div className="tp-food-row"><div className="tp-food is-burger" /><div><strong>Name <em>★ 4.1</em></strong><p>Burger · Fast food</p></div></div></>;
}

function RouteScreen({ variant = "route" }: { variant?: "route" | "handoff" }) {
  const handoff = variant === "handoff";
  return <><Status /><AppHeader title={handoff ? "Delivery status" : "Delivery route"} tools={!handoff} /><Map route /><div className={`tp-route-sheet ${handoff ? "is-handoff" : ""}`}><i className="tp-sheet-handle" />{handoff ? <><span className="tp-kicker">Courier is nearby</span><h3>Ready for handoff</h3><p>Share the final release code only when the courier arrives.</p><div className="tp-code">289 041</div></> : <><span className="tp-route-save">Save ~10 mins by route optimization</span><h3>Delivery route</h3><p>Expand to see delivery details</p></>}</div><BottomAction>{handoff ? "Confirm handoff" : "Run delivery"}</BottomAction></>;
}

function OrderScreen() {
  return <><Status /><AppHeader title="Order details" /><div className="tp-order-meta"><div><b>Order ID</b><span>#12346567</span></div><div><b>Date & Time</b><span>14/02/2023, 21:32 PM</span></div><div><b>Delivered to</b><span>Chukajyan 50 street</span></div><div><b>Payment method</b><span>•••• •••• •••• 1121</span></div></div><h3 className="tp-merchant">KFC</h3><div className="tp-order-items"><div><i className="tp-item-art is-burger" /><span><strong>Classic burger</strong><small>Signature meal</small></span><b>2000 AMD</b></div><div><i className="tp-item-art is-fries" /><span><strong>Fries</strong><small>Side order</small></span><b>2000 AMD</b></div></div><div className="tp-summary"><h3>Summary</h3><p><span>Products</span><b>4000 AMD</b></p><p><span>Delivery</span><b>500 AMD</b></p></div><BottomAction>Reorder</BottomAction></>;
}

const screens: Record<TempoScreenId, () => ReactNode> = {
  location: LocationScreen,
  discover: DiscoverScreen,
  route: RouteScreen,
  order: OrderScreen,
  handoff: () => <RouteScreen variant="handoff" />
};

export function TempoPhone({ screen, active = true, className = "" }: { screen: TempoScreenId; active?: boolean; className?: string }) {
  const Screen = screens[screen];
  return <TempoChrome active={active} className={`tp-screen-${screen} ${className}`}><Screen /></TempoChrome>;
}

export function TempoPhoneInView({ screen, className = "" }: { screen: TempoScreenId; className?: string }) {
  const { ref, active } = useInView();
  return <div ref={ref} className={`tp-inview ${className}`}><TempoPhone screen={screen} active={active} /></div>;
}

export function TempoRouteBoard() {
  return <div className="tp-route-board" aria-label="Tempo multi-stop route board"><div className="tp-route-board-map"><Map route /></div><div className="tp-route-board-list"><span><b>01</b> Collection <em>sealed</em></span><span><b>02</b> Legal office <em>code ready</em></span><span><b>03</b> Private residence <em>awaiting release</em></span></div></div>;
}
