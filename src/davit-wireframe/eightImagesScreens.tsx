import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MATERIAL_MAPS,
  type MaterialMapId,
  IconChevronDown,
  IconMinus,
  IconPlus,
  IconRedo,
  IconUndo
} from "./eightImagesIcons";
import { ORB_PART_NAMES, OrbDock, useOrb } from "./eightImagesOrb";
import "./eightImagesScreens.css";

/**
 * 8 Images' material editor, rebuilt in the browser.
 *
 * Coded from the Figma file (9cBLrnEHUYTC56jt0NiPeT), not screenshotted: a
 * screenshot of a tool cannot be operated, and this screen exists to show how
 * the tool is operated. The subject it edits is the page's travelling sphere,
 * which docks into the canvas here — so the six switches drive a real material,
 * not a picture of one.
 *
 * GEOMETRY. Every length is the Figma length. The plate is a size container at
 * the frame's ratio and defines `--px: calc(100cqw / 1440)`, so
 * `calc(16 * var(--px))` is Figma's 16px at any rendered width.
 *
 * TWO DEPARTURES FROM THE FILE, both deliberate:
 * - The product header is gone. It duplicated this site's own header two
 *   hundred pixels above it, and a case study does not need to prove that an
 *   app has navigation.
 * - So is Save. Nothing here can be saved, and a button that lies about what it
 *   does is worse than no button. Reset all stays, because it works.
 */

const TEXTURE_MAPS: MaterialMapId[] = ["diffuse", "normal"];

type MapState = { on: boolean; h: number; s: number; v: number; value: number };

const INITIAL: Record<MaterialMapId, MapState> = {
  diffuse: { on: false, h: 208, s: 160, v: 200, value: 0 },
  normal: { on: true, h: 120, s: 180, v: 0, value: 0 },
  roughness: { on: true, h: 0, s: 0, v: 0, value: 0.35 },
  emission: { on: true, h: 0, s: 0, v: 0, value: 0.27 },
  metalness: { on: false, h: 0, s: 0, v: 0, value: 0.6 },
  transparency: { on: false, h: 0, s: 0, v: 0, value: 0.3 }
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Figma renders the decimal with a comma. Keep it — it is what the UI says. */
const decimal = (n: number) => n.toFixed(2).replace(".", ",");

/* ---------------------------------------------------------------------------
   The idle demonstration.

   Nobody scrolling past a portfolio reaches for a slider on their own. So the
   editor plays itself: a short loop that switches maps and moves values, as a
   person would. Any real interaction stops it immediately and it only comes
   back after the reader has been still for a while — an autoplay that fights
   you is worse than none.
   --------------------------------------------------------------------------- */

type Step =
  | { kind: "toggle"; map: MaterialMapId; on: boolean; hold: number }
  | { kind: "ramp"; map: MaterialMapId; field: "value" | "h" | "s"; to: number; ms: number; hold: number };

const DEMO: Step[] = [
  { kind: "ramp", map: "roughness", field: "value", to: 0.05, ms: 1100, hold: 260 },
  { kind: "toggle", map: "metalness", on: true, hold: 420 },
  { kind: "ramp", map: "metalness", field: "value", to: 0.95, ms: 1200, hold: 700 },
  { kind: "toggle", map: "diffuse", on: true, hold: 360 },
  { kind: "ramp", map: "diffuse", field: "h", to: 320, ms: 1800, hold: 420 },
  { kind: "ramp", map: "roughness", field: "value", to: 0.62, ms: 1100, hold: 420 },
  { kind: "toggle", map: "emission", on: false, hold: 520 },
  { kind: "ramp", map: "metalness", field: "value", to: 0.15, ms: 1000, hold: 300 },
  { kind: "toggle", map: "transparency", on: true, hold: 360 },
  { kind: "ramp", map: "transparency", field: "value", to: 0.55, ms: 1200, hold: 900 },
  { kind: "toggle", map: "transparency", on: false, hold: 300 },
  { kind: "toggle", map: "emission", on: true, hold: 300 },
  { kind: "ramp", map: "diffuse", field: "h", to: 208, ms: 1400, hold: 300 },
  { kind: "toggle", map: "diffuse", on: false, hold: 300 },
  { kind: "toggle", map: "metalness", on: false, hold: 300 },
  { kind: "ramp", map: "roughness", field: "value", to: 0.35, ms: 900, hold: 1400 }
];

const IDLE_BEFORE_RESUME = 9000;

function Slider({
  value, min = 0, max = 1, step = 0.01, onChange, label, onInteract
}: {
  value: number; min?: number; max?: number; step?: number;
  onChange: (n: number) => void; label: string; onInteract?: () => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      className="ei-slider"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      style={{ "--fill": `${pct}%` } as React.CSSProperties}
      onPointerDown={onInteract}
      onKeyDown={onInteract}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      className={`ei-toggle${on ? " is-on" : ""}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
    >
      <span className="ei-toggle-knob" />
    </button>
  );
}

export function EightImagesMaterialEditor() {
  const [maps, setMaps] = useState(INITIAL);
  const [focused, setFocused] = useState<MaterialMapId>("normal");
  const [zoom, setZoom] = useState(54);
  const [applyToSub, setApplyToSub] = useState(true);
  const [demoOn, setDemoOn] = useState(true);
  /* The editor stays silent until it is actually in use. Announcing itself on
     mount would repaint the tyres before the reader has scrolled anywhere near
     this section. */
  const [engaged, setEngaged] = useState(false);

  const { setMaterial } = useOrb();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastTouch = useRef(0);

  /* Push the stack into the shared material. The mapping is not decorative:
     these are the same six channels the product's maps stand for. */
  useEffect(() => {
    setMaterial({
      active: engaged,
      diffuse: maps.diffuse.on,
      normal: maps.normal.on,
      roughness: maps.roughness.on,
      emission: maps.emission.on,
      metalness: maps.metalness.on,
      transparency: maps.transparency.on,
      hue: maps.diffuse.h,
      saturation: maps.diffuse.s,
      value: maps.diffuse.v,
      roughnessValue: maps.roughness.value,
      emissionValue: maps.emission.value,
      metalnessValue: maps.metalness.value,
      transparencyValue: maps.transparency.value
    });
  }, [maps, engaged, setMaterial]);

  const touched = useCallback(() => {
    lastTouch.current = performance.now();
    setEngaged(true);
    setDemoOn(false);
  }, []);

  const toggle = useCallback((id: MaterialMapId, fromDemo = false) => {
    if (!fromDemo) touched();
    setMaps((prev) => ({ ...prev, [id]: { ...prev[id], on: !prev[id].on } }));
    setFocused(id);
  }, [touched]);

  const set = useCallback((id: MaterialMapId, patch: Partial<MapState>, fromDemo = false) => {
    if (!fromDemo) touched();
    setMaps((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, [touched]);

  const reset = useCallback(() => {
    touched();
    setMaps(INITIAL);
    setFocused("normal");
    setZoom(54);
  }, [touched]);

  /* Come back once the reader has been still for a while. */
  useEffect(() => {
    if (demoOn) return;
    const id = window.setInterval(() => {
      if (performance.now() - lastTouch.current > IDLE_BEFORE_RESUME) setDemoOn(true);
    }, 1000);
    return () => window.clearInterval(id);
  }, [demoOn]);

  /* The demo itself. It only runs while the screen is actually on screen, and
     never under prefers-reduced-motion. */
  useEffect(() => {
    if (!demoOn) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = rootRef.current;
    if (!host) return;

    let alive = true;
    let timer = 0;
    let raf = 0;
    let index = 0;
    let visible = false;

    const seen = new IntersectionObserver(
      (entries) => { visible = entries.some((e) => e.isIntersecting); },
      { threshold: 0.35 }
    );
    seen.observe(host);

    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const run = () => {
      if (!alive) return;
      if (!visible) { timer = window.setTimeout(run, 600); return; }
      setEngaged(true);

      const step = DEMO[index % DEMO.length];
      index += 1;

      if (step.kind === "toggle") {
        setMaps((prev) =>
          prev[step.map].on === step.on ? prev : { ...prev, [step.map]: { ...prev[step.map], on: step.on } }
        );
        setFocused(step.map);
        timer = window.setTimeout(run, step.hold + 260);
        return;
      }

      setFocused(step.map);
      const startedAt = performance.now();
      let from = 0;
      setMaps((prev) => { from = prev[step.map][step.field]; return prev; });

      const frame = () => {
        if (!alive) return;
        const t = Math.min(1, (performance.now() - startedAt) / step.ms);
        const v = from + (step.to - from) * ease(t);
        setMaps((prev) => ({ ...prev, [step.map]: { ...prev[step.map], [step.field]: v } }));
        if (t < 1) raf = requestAnimationFrame(frame);
        else timer = window.setTimeout(run, step.hold);
      };
      raf = requestAnimationFrame(frame);
    };

    timer = window.setTimeout(run, 900);

    return () => {
      alive = false;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      seen.disconnect();
    };
  }, [demoOn]);

  const active = useMemo(() => MATERIAL_MAPS.filter((m) => maps[m.id].on), [maps]);

  return (
    <div className="ei-plate" ref={rootRef}>
      <div className="ei-screen ei-screen-editor" data-screen="material-editing-flow">
        <div className="ei-actionbar">
          <div className="ei-selects">
            <span className="ei-select">Category<IconChevronDown size={24} /></span>
            <span className="ei-select">Subcategory<IconChevronDown size={24} /></span>
          </div>
          <div className="ei-actions">
            <button type="button" className="ei-iconbtn" aria-label="Undo" onClick={touched}><IconUndo /></button>
            <button type="button" className="ei-iconbtn" aria-label="Redo" onClick={touched}><IconRedo /></button>
            <div className="ei-zoom">
              <button type="button" aria-label="Zoom out" onClick={() => { touched(); setZoom((z) => Math.max(10, z - 6)); }}>
                <IconMinus />
              </button>
              <b>{Math.round(zoom)} %</b>
              <Slider value={zoom} min={10} max={200} step={1} onChange={setZoom} label="Zoom" onInteract={touched} />
              <button type="button" aria-label="Zoom in" onClick={() => { touched(); setZoom((z) => Math.min(200, z + 6)); }}>
                <IconPlus />
              </button>
            </div>
            <button type="button" className="ei-btn" onClick={reset}>Reset all</button>
          </div>
        </div>

        {/* The layer stack. Davit argued for this and won: the maps that make up
            a material are a stack you switch on and off, the way layers work in
            every other graphics tool, instead of a form of unrelated fields. */}
        <div className="ei-layers" role="group" aria-label="Material maps">
          {MATERIAL_MAPS.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              className={`ei-layer${maps[id].on ? " is-on" : ""}${focused === id ? " is-focused" : ""}`}
              aria-pressed={maps[id].on}
              onClick={() => toggle(id)}
            >
              <span className="ei-layer-check" aria-hidden="true" />
              <span className="ei-layer-label">{label}</span>
              <Icon className="ei-layer-icon" />
            </button>
          ))}
        </div>

        {/* The travelling sphere docks here and becomes this screen's subject. */}
        <div className="ei-canvas">
          <OrbDock id="editor" className="ei-canvas-dock" />
        </div>

        <div className="ei-tools">
          {active.map(({ id, label }) => {
            const state = maps[id];
            const texture = TEXTURE_MAPS.includes(id);
            return (
              <section className={`ei-tool${focused === id ? " is-focused" : ""}`} key={id}>
                <header>
                  <h4>{label}</h4>
                  <Toggle on={state.on} onChange={() => toggle(id)} label={`${label} on`} />
                </header>
                {texture ? (
                  <div className="ei-tool-body">
                    <div
                      className="ei-texture"
                      aria-hidden="true"
                      style={{ "--ei-tex-hue": `${state.h}deg` } as React.CSSProperties}
                    />
                    {(["h", "s", "v"] as const).map((axis) => (
                      <div className="ei-row" key={axis}>
                        <span className="ei-axis">{axis.toUpperCase()}</span>
                        <span className="ei-value">{Math.round(state[axis])}</span>
                        <Slider
                          value={state[axis]}
                          min={0}
                          max={360}
                          step={1}
                          onChange={(n) => set(id, { [axis]: n } as Partial<MapState>)}
                          onInteract={touched}
                          label={`${label} ${axis.toUpperCase()}`}
                        />
                      </div>
                    ))}
                    <label className="ei-check">
                      <input
                        type="checkbox"
                        checked={applyToSub}
                        onChange={(e) => { touched(); setApplyToSub(e.target.checked); }}
                      />
                      <span aria-hidden="true" />
                      Apply to subcategory
                    </label>
                  </div>
                ) : (
                  <div className="ei-tool-body">
                    <div className="ei-tabs" role="tablist">
                      <button type="button" role="tab" aria-selected="true" className="is-selected" onClick={touched}>
                        Set {label.toLowerCase()}
                      </button>
                      <button type="button" role="tab" aria-selected="false" onClick={touched}>Upload</button>
                    </div>
                    <div className="ei-row">
                      <span className="ei-value">{decimal(state.value)}</span>
                      <Slider
                        value={state.value}
                        onChange={(n) => set(id, { value: n })}
                        onInteract={touched}
                        label={label}
                      />
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <p className={`ei-demo-flag${demoOn ? " is-on" : ""}`} aria-live="polite">
          {demoOn ? "Playing itself — touch anything to take over" : "You have it"}
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   The parts list.

   This is the case study's argument you can operate. A shopper cannot choose a
   material for a mesh; they choose one for the seat, the legs, the top. So the
   meshes get names, and the names are what the configurator is built out of.
   The reader switches them on and watches a pile of geometry become a product.

   The names are the GLB's own, in the file's order. Nothing is renamed here.
   --------------------------------------------------------------------------- */

/* The order a truck actually goes together, which is not the order the file
   happens to list its meshes in. */
const ASSEMBLY_ORDER = [
  "Wheels", "Hubcaps", "Base", "Body", "Cabin",
  "Ladder Turret", "Ladder Railings", "Ladder Caps", "Flashing Lights", "Wire Parts"
];

export function EightImagesParts() {
  const { parts, togglePart, setParts } = useOrb();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLElement | null>(null);
  /* Only the two coarse facts live in state. The per-pixel progress is written
     straight to the bar's transform below — routing a scrubbed value through
     React would re-render this list on every scroll event, and the scheduler
     batches, defers, and in a throttled tab stops flushing altogether. */
  const [done, setDone] = useState(false);
  const appliedRef = useRef(-1);

  const count = ORB_PART_NAMES.filter((n) => parts[n]).length;

  /* SCROLL IS THE CONTROL. The section pins itself and the reader's scroll
     checks the boxes one at a time; the page does not move on until the model
     is whole. An autoplay loop used to do this on a timer, which meant the
     reader watched rather than did it — and could leave mid-assembly. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      if (barRef.current) barRef.current.style.transform = "scaleX(1)";
      setDone(true);
      setParts(Object.fromEntries(ORB_PART_NAMES.map((n) => [n, true])));
      return;
    }

    const read = () => {
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = clamp01(-rect.top / travel);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setDone((prev) => (prev === p >= 0.999 ? prev : p >= 0.999));

      /* One step per band, and the last band is spent whole so the reader sees
         the finished truck before the pin releases. */
      const step = Math.min(ASSEMBLY_ORDER.length, Math.floor(p * (ASSEMBLY_ORDER.length + 1)));
      if (step === appliedRef.current) return;
      appliedRef.current = step;
      setParts(
        Object.fromEntries(
          ORB_PART_NAMES.map((n) => [n, ASSEMBLY_ORDER.indexOf(n) < step])
        )
      );
    };

    /* Read on the scroll event itself rather than coalescing through
       requestAnimationFrame: rAF is suspended in a background tab, which left
       the sequence stuck at zero parts. One rect per event is cheap, and the
       state setters below already bail when nothing changed. */
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [setParts]);

  return (
    <div className="ei-parts-track" ref={trackRef}>
      <div className="ei-parts-pin">
        <div className="ei-parts" data-complete={done ? "true" : undefined}>
          <header>
            <h4>Parts</h4>
            <span>{count} of {ORB_PART_NAMES.length}</span>
          </header>
          <div className="ei-parts-progress" aria-hidden="true">
            <i ref={barRef} style={{ transform: "scaleX(0)" }} />
          </div>
          <ul>
            {ORB_PART_NAMES.map((name) => (
              <li key={name}>
                <label className={parts[name] ? "is-on" : undefined}>
                  <input
                    type="checkbox"
                    checked={!!parts[name]}
                    /* Until the sequence finishes, scroll owns the state; after
                       that the reader can take any part off again. */
                    disabled={!done}
                    onChange={() => togglePart(name)}
                  />
                  <span className="ei-parts-box" aria-hidden="true" />
                  {name}
                </label>
              </li>
            ))}
          </ul>
          <p className="ei-demo-flag is-on" aria-live="polite">
            {done ? "Whole. Take a part off if you like." : "Keep scrolling — the product assembles itself"}
          </p>
        </div>
        <OrbDock id="model" className="dw-ei-parts-dock" />
      </div>
    </div>
  );
}
