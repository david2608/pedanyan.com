export type TempoScreenId = "location" | "discover" | "route" | "order" | "handoff";

function TempoLocationScreen({ active }: { active: boolean }) {
  return (
    <div className={`tp-figma-location${active ? " is-active" : ""}`}>
      <img
        className="tp-figma-location-status"
        src="/portfolio-assets/tempo/figma/status-bar.svg"
        alt=""
      />
      <img
        className="tp-figma-location-art"
        src="/portfolio-assets/tempo/figma/location-illustration.svg"
        alt=""
      />
      <div className="tp-figma-location-copy">
        <h3>Hello, Name</h3>
        <p>Please, set up your location to start exploring what&apos;s near you.</p>
      </div>
      <button className="tp-figma-location-action" type="button">
        Set Location
      </button>
    </div>
  );
}

const foodRail = [
  { image: "offer-pizza.png", title: "Restaurant name", category: "Pizza \u00b7 Italian \u00b7 Spicy" },
  { image: "offer-sushi.png", title: "Name", category: "Sushi \u00b7 Chinese" }
];

const foodList = [
  { image: "offer-burger.png", title: "Name", category: "Burger \u00b7 Fast food" },
  { image: "offer-breakfast.png", title: "Name", category: "Breakfast \u00b7" }
];

function FoodCard({ offer, badge }: { offer: { image: string; title: string; category: string }; badge?: boolean }) {
  return (
    <article className="tp-figma-food-card">
      <div className="tp-figma-food-card-image">
        <img src={`/portfolio-assets/tempo/figma/food/${offer.image}`} alt="" />
        {badge && <em>-25%</em>}
      </div>
      <div className="tp-figma-food-card-copy">
        <div>
          <strong>{offer.title}</strong>
          <span><img src="/portfolio-assets/tempo/figma/food/star.svg" alt="" />4.1</span>
        </div>
        <p>{offer.category}</p>
        <footer><b>25-35min</b><b>Free delivery</b></footer>
      </div>
    </article>
  );
}

function TempoFoodScreen({ active }: { active: boolean }) {
  return (
    <div className={`tp-figma-food${active ? " is-active" : ""}`}>
      <img className="tp-figma-food-status" src="/portfolio-assets/tempo/figma/food/status-bar.svg" alt="" />
      <header className="tp-figma-food-header">
        <img src="/portfolio-assets/tempo/figma/food/back.svg" alt="" />
        <strong>Restaurants</strong>
      </header>
      <i className="tp-figma-food-navicon" aria-hidden="true" />
      <div className="tp-figma-food-search">
        <img src="/portfolio-assets/tempo/figma/food/search.svg" alt="" />
        <span>Search place or product</span>
      </div>
      <div className="tp-figma-food-filters" aria-label="Restaurant categories">
        {[
          ["category-burger.svg", "Filters", true],
          ["category-pizza.svg", "Pizza"],
          ["category-burger.svg", "Burgers"],
          ["category-pizza.svg", "Breakfast"],
          ["category-burger.svg", "Wok"]
        ].map(([icon, label, alert]) => (
          <div className="tp-figma-food-filter" key={String(label)}>
            <span className={alert ? "has-alert" : ""}>
              <img src={`/portfolio-assets/tempo/figma/food/${icon}`} alt="" />
            </span>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <div className="tp-figma-food-offers-heading">
        <h3>Special offers</h3>
        <span>View all <img src="/portfolio-assets/tempo/figma/food/chevron-right.svg" alt="" /></span>
      </div>
      <div className="tp-figma-food-rail">
        {foodRail.map((offer) => <FoodCard key={offer.image} offer={offer} badge />)}
      </div>
      <i className="tp-figma-food-divider" aria-hidden="true" />
      <div className="tp-figma-food-list">
        {foodList.map((offer) => <FoodCard key={offer.image} offer={offer} />)}
      </div>
    </div>
  );
}

/* The map path and stop markers are Figma's, in the frame's own 390x744 map
   coordinates. The single-stop variant is frame 326:21313 exactly. The
   three-stop variant is used only by the multi-stop section, whose whole point
   is "one protected route, three accountable stops" — it extends the same
   polyline up through the two earlier vertices of the tracking frame's route
   and puts a numbered badge on each. */
const ROUTE_PATHS = {
  1: "M224 292L257 403L257 431L239 475L221 480",
  3: "M247 148L296 194L224 288L257 403L257 431L239 475L221 480"
} as const;

/* Top-left corners of the 32px badge, in map coordinates. The one-stop value is
   Figma's exactly (207, 254 — i.e. absolute 354 minus the map's 100px offset);
   the three-stop badges are centred on the polyline's vertices. */
const ROUTE_STOPS = {
  1: [{ n: 1, x: 207, y: 254 }],
  3: [{ n: 1, x: 231, y: 132 }, { n: 2, x: 208, y: 272 }, { n: 3, x: 241, y: 387 }]
} as const;

function TempoRouteScreen({ active, stops = 1 }: { active: boolean; stops?: 1 | 3 }) {
  return (
    <div className={`tp-figma-route${active ? " is-active" : ""}`}>
      <img className="tp-figma-route-status" src="/portfolio-assets/tempo/figma/route/status-bar.svg" alt="" />
      <header className="tp-figma-route-header"><img src="/portfolio-assets/tempo/figma/route/back.svg" alt="" /><strong>Delivery route</strong><span>♧</span><span>+</span></header>
      <div className="tp-figma-route-map">
        <img src="/portfolio-assets/tempo/figma/route/map.png" alt="" />
        <svg viewBox="0 0 390 744" aria-hidden="true"><path d={ROUTE_PATHS[stops]} /></svg>
        {ROUTE_STOPS[stops].map((stop) => (
          <b
            className="tp-figma-route-stop"
            key={stop.n}
            style={{ left: `${(stop.x / 390) * 100}%`, top: `${(stop.y / 744) * 100}%` }}
          >{stop.n}</b>
        ))}
        <i className="tp-figma-route-marker">⚐</i>
      </div>
      <section className="tp-figma-route-sheet"><div className="tp-figma-route-handle" /><div><img src="/portfolio-assets/tempo/figma/route/chevron-down.svg" alt="" /><h3>Delivery route</h3></div><p>Expand to see delivery details</p><button type="button">Run delivery</button></section>
    </div>
  );
}

function TempoTrackingScreen({ active }: { active: boolean }) {
  return (
    <div className={`tp-figma-tracking${active ? " is-active" : ""}`}>
      <img className="tp-figma-tracking-status" src="/portfolio-assets/tempo/figma/route/status-bar.svg" alt="" />
      <header className="tp-figma-tracking-header"><img src="/portfolio-assets/tempo/figma/route/back.svg" alt="" /><strong>Delivery tracking</strong></header>
      <div className="tp-figma-tracking-map"><img src="/portfolio-assets/tempo/figma/route/map.png" alt="" /><svg viewBox="0 0 390 744" aria-hidden="true"><path d="M247 148L296 194L224 288L257 403L257 431L239 475L221 480" /></svg><img className="tp-figma-tracking-courier-pin" src="/portfolio-assets/tempo/figma/tracking/courier-map.svg" alt="" /><i className="tp-figma-tracking-marker">⚐</i></div>
      <section className="tp-figma-tracking-sheet"><div className="tp-figma-tracking-handle" /><div className="tp-figma-tracking-title"><img src="/portfolio-assets/tempo/figma/route/chevron-down.svg" alt="" /><h3>Delivery Tracking</h3></div><p>Arriving at&nbsp; <strong>18:21</strong></p><div className="tp-figma-tracking-courier"><img src="/portfolio-assets/tempo/figma/tracking/courier.jpg" alt="Armen G" /><span><small>Delivery guy</small><b>Armen G</b></span><em><img src="/portfolio-assets/tempo/figma/tracking/star.svg" alt="" />4.1</em></div><footer><span>Send a message</span><button type="button">⌕</button><button type="button">□</button></footer></section>
    </div>
  );
}

function TempoOrderScreen({ active }: { active: boolean }) {
  return (
    <div className={`tp-figma-order${active ? " is-active" : ""}`}>
      <img className="tp-figma-order-status" src="/portfolio-assets/tempo/figma/route/status-bar.svg" alt="" />
      <header className="tp-figma-order-header"><img src="/portfolio-assets/tempo/figma/route/back.svg" alt="" /><strong>Order details</strong></header>
      <section className="tp-figma-order-info"><dl><div><dt>Order ID</dt><dd>#12346567</dd></div><div><dt>Date &amp; Time</dt><dd>14/02/2023, 21:32 PM</dd></div><div><dt>Delivered to</dt><dd>Chukhadjyan 50 street</dd></div><div><dt>Payment method</dt><dd>•••• •••• •••• 1121</dd></div></dl><h3>KFC</h3><div className="tp-figma-order-item"><img src="/portfolio-assets/tempo/figma/food/offer-burger.png" alt="" /><span><b>Name</b><small>Description</small></span><strong>2000 AMD</strong></div><div className="tp-figma-order-item"><img src="/portfolio-assets/tempo/figma/food/offer-burger.png" alt="" /><span><b>Name</b><small>Description</small></span><strong>2000 AMD</strong></div><div className="tp-figma-order-summary"><h3>Summary</h3><p><span>Products</span><b>4000 AMD</b></p><p><span>Delivery</span><b>500 AMD</b></p></div></section><footer><button type="button">Reorder</button></footer>
    </div>
  );
}

export function TempoPhone({ screen, active = true, className = "", routeStops = 1 }: { screen: TempoScreenId; active?: boolean; className?: string; routeStops?: 1 | 3 }) {
  return (
    <figure
      className={`tp-phone tp-figma-device ${active ? "is-active" : ""} ${className}`}
      data-no-anim
    >
      {screen === "location" ? <TempoLocationScreen active={active} /> : null}
      {screen === "discover" ? <TempoFoodScreen active={active} /> : null}
      {screen === "route" ? <TempoRouteScreen active={active} stops={routeStops} /> : null}
      {screen === "order" ? <TempoOrderScreen active={active} /> : null}
      {screen === "handoff" ? <TempoTrackingScreen active={active} /> : null}
    </figure>
  );
}

export function TempoRouteBoard() {
  return (
    <figure className="tp-route-board tp-route-board-coded" data-no-anim>
      <div className="dw-tempo-secure-phone" aria-label="Tempo delivery route screen">
        <figure className="tp-phone tp-figma-device is-active" data-no-anim>
          <TempoRouteScreen active stops={3} />
        </figure>
      </div>
    </figure>
  );
}
