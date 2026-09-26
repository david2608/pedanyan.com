import { useCallback, useMemo, useState } from "react";
import {
  MATERIAL_MAPS,
  type MaterialMapId,
  IconChevronDown,
  IconMinus,
  IconPlus,
  IconRedo,
  IconUndo
} from "./eightImagesIcons";
import "./eightImagesScreens.css";

/**
 * 8 Images, rebuilt in the browser.
 *
 * Coded from the Figma file (9cBLrnEHUYTC56jt0NiPeT) rather than screenshotted,
 * for two reasons. A screenshot of a tool cannot be operated, and this case is
 * about how the tool is operated. And a 1440px screenshot dropped into a
 * responsive page is either tiny or blurry, where a reconstruction is neither.
 *
 * GEOMETRY. Every number below is the Figma number. The plate declares
 * `container-type: size` at the frame's own 1440x1024 ratio and defines
 * `--px: calc(100cqw / 1440)`, so `calc(16 * var(--px))` is Figma's 16px at any
 * width. Nothing is re-estimated, and nothing drifts when the page resizes.
 *
 * TYPE. The screens speak Poppins because the product does. The page around
 * them speaks the site's own faces. That separation is deliberate: a reader can
 * tell product from portfolio without being told which is which.
 */

/* Which maps carry a texture upload panel rather than a single value. */
const TEXTURE_MAPS: MaterialMapId[] = ["diffuse", "normal"];

type MapState = { on: boolean; h: number; s: number; v: number; value: number };

const INITIAL: Record<MaterialMapId, MapState> = {
  /* The Figma frame's own state: three maps on, Normal map focused. */
  diffuse: { on: false, h: 0, s: 0, v: 0, value: 0 },
  normal: { on: true, h: 0, s: 0, v: 0, value: 0 },
  roughness: { on: true, h: 0, s: 0, v: 0, value: 0 },
  emission: { on: true, h: 0, s: 0, v: 0, value: 0.27 },
  metalness: { on: false, h: 0, s: 0, v: 0, value: 0 },
  transparency: { on: false, h: 0, s: 0, v: 0, value: 0 }
};

/** Figma renders the decimal with a comma. Keep it — it is what the UI says. */
const decimal = (n: number) => n.toFixed(2).replace(".", ",");

function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  label
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
  label: string;
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
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      className={`ei-toggle${on ? " is-on" : ""}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
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

  const toggle = useCallback((id: MaterialMapId) => {
    setMaps((prev) => ({ ...prev, [id]: { ...prev[id], on: !prev[id].on } }));
    setFocused(id);
  }, []);

  const set = useCallback((id: MaterialMapId, patch: Partial<MapState>) => {
    setMaps((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const active = useMemo(() => MATERIAL_MAPS.filter((m) => maps[m.id].on), [maps]);

  /* The render reacts to the stack, which is the whole point of the screen:
     roughness dulls the highlight, emission lifts the base, transparency thins
     it. Not physically accurate - legible, which is what a case study needs. */
  const sphere = useMemo(() => {
    const m = maps;
    const rough = m.roughness.on ? m.roughness.value : 0;
    const emit = m.emission.on ? m.emission.value : 0;
    const metal = m.metalness.on ? m.metalness.value : 0;
    return {
      "--ei-rough": String(rough),
      "--ei-emit": String(emit),
      "--ei-metal": String(metal),
      "--ei-alpha": String(m.transparency.on ? 1 - m.transparency.value * 0.7 : 1),
      "--ei-hue": `${m.normal.on ? m.normal.h : 0}deg`
    } as React.CSSProperties;
  }, [maps]);

  return (
    <div className="ei-plate">
    <div className="ei-screen ei-screen-editor" data-screen="material-editing-flow">
      <header className="ei-appbar">
        <span className="ei-logo" aria-label="8 Images">
          <svg viewBox="0 0 24 35" fill="none" aria-hidden="true">
            <path d="M23 1H12L1 12v22" stroke="currentColor" strokeWidth="2" />
          </svg>
          <b>eight<br />images</b>
        </span>
        <nav className="ei-appnav" aria-label="Product navigation">
          <span>Library</span>
          <span>Materials</span>
          <span>Showrooms</span>
        </nav>
        <span className="ei-avatar" aria-hidden="true" />
      </header>

      <div className="ei-actionbar">
        <div className="ei-selects">
          <span className="ei-select">Category<IconChevronDown size={24} /></span>
          <span className="ei-select">Subcategory<IconChevronDown size={24} /></span>
        </div>
        <div className="ei-actions">
          <button type="button" className="ei-iconbtn" aria-label="Undo"><IconUndo /></button>
          <button type="button" className="ei-iconbtn" aria-label="Redo"><IconRedo /></button>
          <div className="ei-zoom">
            <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(10, z - 6))}>
              <IconMinus />
            </button>
            <b>{zoom} %</b>
            <Slider value={zoom} min={10} max={200} step={1} onChange={setZoom} label="Zoom" />
            <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(200, z + 6))}>
              <IconPlus />
            </button>
          </div>
          <button type="button" className="ei-btn">Reset all</button>
          <button type="button" className="ei-btn is-primary">Save</button>
        </div>
      </div>

      {/* The layer stack. Davit argued for this and won: the maps that make up a
          material are a stack you switch on and off, the way layers work in
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

      <div className="ei-canvas">
        <div className="ei-material" style={sphere} aria-label="Material preview" role="img" />
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
                  <div className="ei-texture" aria-hidden="true" />
                  {(["h", "s", "v"] as const).map((axis) => (
                    <div className="ei-row" key={axis}>
                      <span className="ei-axis">{axis.toUpperCase()}</span>
                      <span className="ei-value">{state[axis]}</span>
                      <Slider
                        value={state[axis]}
                        min={0}
                        max={360}
                        step={1}
                        onChange={(n) => set(id, { [axis]: n } as Partial<MapState>)}
                        label={`${label} ${axis.toUpperCase()}`}
                      />
                    </div>
                  ))}
                  <label className="ei-check">
                    <input type="checkbox" checked={applyToSub} onChange={(e) => setApplyToSub(e.target.checked)} />
                    <span aria-hidden="true" />
                    Apply to subcategory
                  </label>
                </div>
              ) : (
                <div className="ei-tool-body">
                  <div className="ei-tabs" role="tablist">
                    <button type="button" role="tab" aria-selected="true" className="is-selected">
                      Set {label.toLowerCase()}
                    </button>
                    <button type="button" role="tab" aria-selected="false">Upload</button>
                  </div>
                  <div className="ei-row">
                    <span className="ei-value">{decimal(state.value)}</span>
                    <Slider
                      value={state.value}
                      onChange={(n) => set(id, { value: n })}
                      label={label}
                    />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
    </div>
  );
}
