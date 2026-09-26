import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import "./eightImagesOrb.css";

/**
 * One object, assembled across the whole case study.
 *
 * The page opens on a single wheel, filling the screen, with no explanation.
 * Scrolling adds the other three, then the chassis, the body, the cabin, the
 * ladder — and by the section where the real 8 Images widget is embedded, the
 * reader is looking at the whole fire truck and recognises it as the thing they
 * have been carrying since the first screen.
 *
 * That is the case study's argument made physical: a configurator is a pile of
 * named meshes that someone has to turn into a product a shopper can point at.
 * The parts here are the file's own parts — Base, Body, Cabin, Flashing Lights,
 * Hubcaps, Ladder Caps, Ladder Railings, Ladder Turret, Wheels, Wire Parts —
 * loaded from the same GLB the live widget serves.
 *
 * The model ships as one "Wheels" mesh holding all four, so a single wheel is
 * separated geometrically: triangles are clustered by centroid against the four
 * corners of the mesh's own bounding box. Nothing is hand-modelled.
 */

const MODEL_URL = "/portfolio-assets/8images/toy-firetruck.glb";
const DRACO_PATH = "/draco/";

/** The editor edits the tyres, and only the tyres. Everything else keeps the
    material the file was authored with, so the truck looks like the truck the
    live widget serves. */
const EDITABLE = (name: string) => name.startsWith("Wheels") || name.startsWith("Hubcaps");

export type OrbMaterial = {
  diffuse: boolean;
  normal: boolean;
  roughness: boolean;
  emission: boolean;
  metalness: boolean;
  transparency: boolean;
  /** False until the reader (or the editor's own demo) touches a control. Until
      then every part renders exactly as the GLB authored it. */
  active: boolean;
  hue: number;
  saturation: number;
  value: number;
  roughnessValue: number;
  emissionValue: number;
  metalnessValue: number;
  transparencyValue: number;
};

export const DEFAULT_ORB: OrbMaterial = {
  active: false,
  diffuse: false,
  normal: true,
  roughness: true,
  emission: true,
  metalness: false,
  transparency: false,
  hue: 208,
  saturation: 160,
  value: 200,
  roughnessValue: 0.35,
  emissionValue: 0.27,
  metalnessValue: 0,
  transparencyValue: 0
};

/**
 * GLTFLoader sanitises node names, turning every space into an underscore — so
 * the file's "Flashing Lights" arrives as "Flashing_Lights". Matching the two
 * spellings by eye is how five of the ten parts silently stopped responding to
 * their own checkboxes. Everything is compared through this.
 */
const readable = (name: string) => name.replace(/_/g, " ");

/** The part names, in the file's order — the section about naming uses these. */
export const ORB_PART_NAMES = [
  "Base", "Body", "Cabin", "Flashing Lights", "Hubcaps",
  "Ladder Caps", "Ladder Railings", "Ladder Turret", "Wheels", "Wire Parts"
];

export type OrbParts = Record<string, boolean>;

const NO_PARTS: OrbParts = Object.fromEntries(ORB_PART_NAMES.map((n) => [n, false]));

type OrbContextValue = {
  material: OrbMaterial;
  setMaterial: (next: Partial<OrbMaterial>) => void;
  parts: OrbParts;
  togglePart: (name: string) => void;
  setParts: (next: OrbParts) => void;
};

const OrbContext = createContext<OrbContextValue>({
  material: DEFAULT_ORB,
  setMaterial: () => {},
  parts: NO_PARTS,
  togglePart: () => {},
  setParts: () => {}
});
export const useOrb = () => useContext(OrbContext);

export function OrbProvider({ children }: { children: ReactNode }) {
  const [material, setState] = useState(DEFAULT_ORB);
  /* Nothing is checked to begin with, which is what leaves the page opening on
     a single wheel. The reader turns the product on, part by part. */
  const [parts, setParts] = useState<OrbParts>(NO_PARTS);

  const setMaterial = useCallback(
    (next: Partial<OrbMaterial>) => setState((prev) => ({ ...prev, ...next })),
    []
  );
  const togglePart = useCallback(
    (name: string) => setParts((prev) => ({ ...prev, [name]: !prev[name] })),
    []
  );

  const value = useMemo(
    () => ({ material, setMaterial, parts, togglePart, setParts }),
    [material, setMaterial, parts, togglePart]
  );
  return <OrbContext.Provider value={value}>{children}</OrbContext.Provider>;
}

/**
 * A destination. Position and size come from the element's own rectangle, so
 * a section decides where the object sits by laying out a box — small and in
 * the corner when the section's content is the point, large and central when
 * the object is.
 *
 * `fade` is the handover: a dock at 1 is a place the object arrives invisible,
 * which is how it gives way to the live player.
 */
export function OrbDock({ id, fade = 0, className }: { id: string; fade?: number; className?: string }) {
  return (
    <div
      className={`ei-orb-dock${className ? ` ${className}` : ""}`}
      data-orb-dock={id}
      data-orb-fade={fade}
      aria-hidden="true"
    />
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Split a mesh that holds four copies of the same part into four meshes.
 * Seeds are the four horizontal corners of the mesh's own bounding box, and
 * every triangle goes to the nearest one — which is exactly right for wheels,
 * and makes no assumption about how the file was authored.
 */
function splitIntoFour(geometry: THREE.BufferGeometry): THREE.BufferGeometry[] {
  const src = geometry.index ? geometry.toNonIndexed() : geometry;
  const pos = src.getAttribute("position") as THREE.BufferAttribute;
  const nor = src.getAttribute("normal") as THREE.BufferAttribute | undefined;
  const uv = src.getAttribute("uv") as THREE.BufferAttribute | undefined;

  src.computeBoundingBox();
  const box = src.boundingBox!;
  const seeds = [
    new THREE.Vector3(box.min.x, 0, box.min.z),
    new THREE.Vector3(box.min.x, 0, box.max.z),
    new THREE.Vector3(box.max.x, 0, box.min.z),
    new THREE.Vector3(box.max.x, 0, box.max.z)
  ];

  const buckets: number[][] = [[], [], [], []];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const mid = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    mid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    mid.y = 0;
    let best = 0;
    let bestD = Infinity;
    for (let s = 0; s < 4; s += 1) {
      const d = mid.distanceToSquared(seeds[s]);
      if (d < bestD) { bestD = d; best = s; }
    }
    buckets[best].push(i, i + 1, i + 2);
  }

  return buckets.map((idx) => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(idx.length * 3);
    const n = nor ? new Float32Array(idx.length * 3) : null;
    const t = uv ? new Float32Array(idx.length * 2) : null;
    idx.forEach((vi, k) => {
      p[k * 3] = pos.getX(vi); p[k * 3 + 1] = pos.getY(vi); p[k * 3 + 2] = pos.getZ(vi);
      if (n && nor) { n[k * 3] = nor.getX(vi); n[k * 3 + 1] = nor.getY(vi); n[k * 3 + 2] = nor.getZ(vi); }
      if (t && uv) { t[k * 2] = uv.getX(vi); t[k * 2 + 1] = uv.getY(vi); }
    });
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    if (n) g.setAttribute("normal", new THREE.BufferAttribute(n, 3));
    if (t) g.setAttribute("uv", new THREE.BufferAttribute(t, 2));
    if (!n) g.computeVertexNormals();
    g.computeBoundingBox();
    return g;
  });
}

type Part = {
  name: string;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  base: { colour: THREE.Color; roughness: number; metalness: number };
  group: string;
  rest: THREE.Vector3;
  drift: THREE.Vector3;
  box: THREE.Box3;
  editable: boolean;
  reveal: number;
};

export function EightImagesOrb() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { material, parts: checkedParts } = useOrb();
  const materialRef = useRef(material);
  materialRef.current = material;
  const partsRef = useRef(checkedParts);
  partsRef.current = checkedParts;
  /* The loop is the usual way the object redraws, but a backgrounded tab has no
     loop — and ticking a part is a state change, not a scroll. Keep a handle to
     the placer so a checkbox still takes effect. */
  const settleRef = useRef<(() => void) | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;

    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.45);
    fill.position.set(4, -2, 3);
    scene.add(fill);

    /* Three groups, and the nesting matters.

       `pivot` scales. `spinner` rotates. `centrer` holds the offset that puts
       whatever is currently assembled in the middle of the frame.

       Collapsing the last two — rotating the same group that carries the
       centring offset — makes the object ORBIT the origin instead of turning on
       its own axis. It is invisible while the whole truck is present, because
       the truck's centre is already the origin; a single wheel swings straight
       out of frame. */
    const pivot = new THREE.Group();
    const spinner = new THREE.Group();
    const centrer = new THREE.Group();
    /* Start on a three-quarter front view: the model's forward axis puts the
       tail toward the camera at zero. */
    spinner.rotation.y = Math.PI * 0.78;
    spinner.add(centrer);
    pivot.add(spinner);
    scene.add(pivot);

    let parts: Part[] = [];
    let disposed = false;
    let frame = 0;

    /* --- load ------------------------------------------------------------- */

    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATH);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(MODEL_URL, (gltf) => {
      if (disposed) return;

      const source: { name: string; mesh: THREE.Mesh }[] = [];
      gltf.scene.updateWorldMatrix(true, true);
      gltf.scene.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) source.push({ name: node.name, mesh: node as THREE.Mesh });
      });

      const built: { name: string; geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];
      source.forEach(({ name, mesh }) => {
        const geo = mesh.geometry.clone();
        geo.applyMatrix4(mesh.matrixWorld);
        if (name === "Wheels" || name === "Hubcaps") {
          splitIntoFour(geo).forEach((piece, i) => built.push({ name: `${name}#${i}`, geometry: piece, material: mesh.material as THREE.Material }));
          geo.dispose();
        } else {
          built.push({ name, geometry: geo, material: mesh.material as THREE.Material });
        }
      });

      /* Normalise once, against the COMPLETE truck, so the model never changes
         proportion as parts arrive — only the framing pulls back. */
      const whole = new THREE.Box3();
      built.forEach(({ geometry }) => {
        geometry.computeBoundingBox();
        whole.union(geometry.boundingBox!);
      });
      const centre = whole.getCenter(new THREE.Vector3());
      const scale = 2 / Math.max(...whole.getSize(new THREE.Vector3()).toArray());

      parts = built.map(({ name, geometry, material: src }) => {
        geometry.translate(-centre.x, -centre.y, -centre.z);
        geometry.scale(scale, scale, scale);
        geometry.computeBoundingBox();

        /* CLONE the authored material rather than building a new one. The GLB
           carries a base-colour, metallic-roughness AND normal texture on every
           material; hand-copying three fields dropped all of them, which is why
           the truck rendered flat and pale instead of like the product. */
        const mat = (src as THREE.MeshStandardMaterial).clone();
        mat.envMapIntensity = 1.05;
        mat.transparent = true;
        mat.opacity = 0;

        const mesh = new THREE.Mesh(geometry, mat);
        mesh.visible = false;
        centrer.add(mesh);

        const box = geometry.boundingBox!.clone();
        const rest = new THREE.Vector3(0, 0, 0);
        /* Parts arrive from the direction they sit in, so the truck builds
           outward from its own centre rather than dropping in from nowhere. */
        const dir = box.getCenter(new THREE.Vector3()).normalize();
        const drift = dir.lengthSq() > 0 ? dir.multiplyScalar(0.55) : new THREE.Vector3(0, 0.55, 0);

        return {
          name,
          mesh,
          material: mat,
          base: { colour: mat.color.clone(), roughness: mat.roughness, metalness: mat.metalness },
          group: readable(name.split("#")[0]),
          rest,
          drift,
          box,
          editable: EDITABLE(name),
          reveal: 0
        };
      });

      settle();
      setReady(true);
    });

    /* --- docking ----------------------------------------------------------- */

    /* The path, and why it is computed in DOCUMENT space.

       The first version asked "which dock is more than half on screen" and
       interpolated between the rest. That question changes answer abruptly —
       a dock crosses the threshold and the target snaps — so the object
       jumped. Anchoring every dock to its position in the document instead
       makes the target a continuous function of scrollY: no thresholds, no
       switching, nothing to snap.

       DWELL holds the object still at each end of a leg, so it rests inside a
       section rather than drifting through it. DWELL_MOVE is the shorter hold
       used for position and size: a wider travel window means a slower one. */
    const DWELL = 0.2;
    const DWELL_MOVE = 0.1;
    const smooth = (t: number) => t * t * (3 - 2 * t);

    const current = { x: 0, y: 0, size: 0, fade: 0, set: false };

    const dockRects = () => {
      const scrollY = window.scrollY;
      return Array.from(document.querySelectorAll<HTMLElement>("[data-orb-dock]"))
        .map((node) => {
          const r = node.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return null;
          return {
            cx: r.left + r.width / 2,
            docY: r.top + scrollY + r.height / 2,
            size: Math.min(r.width, r.height),
            fade: Number(node.dataset.orbFade ?? 0)
          };
        })
        .filter(Boolean)
        .sort((a, b) => a!.docY - b!.docY) as {
          cx: number; docY: number; size: number; fade: number;
        }[];
    };

    const target = () => {
      const docks = dockRects();
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const reader = scrollY + vh / 2;

      if (docks.length === 0) {
        return { x: window.innerWidth / 2, y: vh / 2, size: 320, fade: 0 };
      }

      const at = (d: typeof docks[number]) => ({
        x: d.cx,
        y: d.docY - scrollY,
        size: d.size,
        fade: d.fade
      });

      if (docks.length === 1 || reader <= docks[0].docY) return at(docks[0]);
      if (reader >= docks[docks.length - 1].docY) return at(docks[docks.length - 1]);

      let i = 0;
      while (i < docks.length - 2 && reader > docks[i + 1].docY) i += 1;
      const a = docks[i];
      const b = docks[i + 1];

      const raw = clamp01((reader - a.docY) / Math.max(1, b.docY - a.docY));

      /* VERTICAL gets its own, flatter profile.
​
         Sharing one smoothstep with everything else was the lurch: a dock 1020px
         further down the document, reached through a window narrowed by DWELL
         and then accelerated by smoothstep's 1.5x peak, made the object travel
         nearly three screen-pixels for every one the page moved. Linear over a
         wider window holds it near 1.3x with no peak at all, and the follow
         below rounds the two corners. Horizontal position and size keep the
         smooth curve, where a little acceleration reads as intent rather than
         as a jump. */
      /* Constant velocity for everything that MOVES, eased only for the fade.
         Smoothstep's 1.5x peak is what the eye reads as a lurch when the travel
         is long — the corner-to-centre run is 558px of horizontal on its own.
         A flat profile plus the follow below (which rounds both corners) is
         calmer than any curve applied to the target. */
      const move = clamp01((raw - DWELL_MOVE) / Math.max(0.0001, 1 - DWELL_MOVE * 2));
      const e = smooth(clamp01((raw - DWELL) / Math.max(0.0001, 1 - DWELL * 2)));

      return {
        x: lerp(a.cx, b.cx, move),
        y: lerp(a.docY, b.docY, move) - scrollY,
        size: lerp(a.size, b.size, move),
        fade: lerp(a.fade, b.fade, e)
      };
    };

    const layout = (immediate: boolean) => {
      const t = target();
      if (immediate || !current.set) {
        Object.assign(current, { x: t.x, y: t.y, size: t.size, fade: t.fade, set: true });
      } else {
        /* The path is already smooth; this is only here to take the edge off
           a fast flick. Too low and the object lags the page. */
        const k = reduceMotion ? 1 : 0.22;
        current.x = lerp(current.x, t.x, k);
        current.y = lerp(current.y, t.y, k);
        current.size = lerp(current.size, t.size, k);
        current.fade = lerp(current.fade, t.fade, k);
      }
      const size = Math.max(80, current.size);
      host.style.width = `${size}px`;
      host.style.height = `${size}px`;
      host.style.transform = `translate3d(${current.x - size / 2}px, ${current.y - size / 2}px, 0)`;
      /* Handing over to the live player: the object slips behind the widget and
         fades as the widget's own model takes its place, so the reader sees one
         object change hands rather than two objects swap. */
      host.style.opacity = String(1 - current.fade);
      host.style.zIndex = current.fade > 0.02 ? "0" : "2";
      host.style.pointerEvents = current.fade > 0.5 ? "none" : "auto";
      return size;
    };

    /* --- drag -------------------------------------------------------------- */

    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    const spin = 0.0022;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true; lastX = e.clientX;
      host.setPointerCapture(e.pointerId); host.classList.add("is-dragging");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      velocity = (e.clientX - lastX) * 0.006;
      spinner.rotation.y += velocity;
      lastX = e.clientX;
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false; host.releasePointerCapture?.(e.pointerId); host.classList.remove("is-dragging");
    };
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);

    /* --- material ---------------------------------------------------------- */

    let normalWasOn: boolean | null = null;
    const tint = new THREE.Color();

    const applyMaterial = () => {
      const m = materialRef.current;
      /* Until the editor is touched, every part renders as authored. Overriding
         by default turned a red fire truck salmon. */
      if (!m.active) return;
      if (m.diffuse) {
        tint.setHSL((m.hue % 360) / 360, clamp01(m.saturation / 360), 0.42 + clamp01(m.value / 360) * 0.3);
      }
      if (normalWasOn !== m.normal) normalWasOn = m.normal;

      parts.forEach((part) => {
        if (!part.editable) return;
        const mat = part.material;
        mat.color.copy(m.diffuse ? tint : part.base.colour);
        mat.roughness = m.roughness ? clamp01(m.roughnessValue) : part.base.roughness;
        mat.metalness = m.metalness ? clamp01(m.metalnessValue) : part.base.metalness;
        mat.emissive.copy(m.emission ? (m.diffuse ? tint : part.base.colour) : new THREE.Color(0, 0, 0));
        mat.emissiveIntensity = m.emission ? clamp01(m.emissionValue) * 0.28 : 0;
      });
    };

    /* --- assembly ----------------------------------------------------------- */

    const visibleBox = new THREE.Box3();
    const tmp = new THREE.Vector3();
    const fit = { scale: 1, y: 0, set: false };

    const assemble = (immediate = false) => {
      if (parts.length === 0) return;

      /* What exists is what the reader has switched on. Before anything is
         checked the page holds one wheel — a part with no product around it,
         which is the state the case study opens in. */
      const checked = partsRef.current;
      const anyChecked = ORB_PART_NAMES.some((n) => checked[n]);

      visibleBox.makeEmpty();
      parts.forEach((part) => {
        const wanted = anyChecked ? !!checked[part.group] : part.name === "Wheels#0";
        const t = wanted ? 1 : 0;
        part.reveal = immediate || reduceMotion ? t : lerp(part.reveal, t, 0.16);
        const r = part.reveal;

        part.mesh.visible = r > 0.004;
        if (!part.mesh.visible) return;

        const e = easeOut(r);
        part.material.opacity = e;
        /* Transparency costs correct depth sorting, so only pay for it while a
           part is actually fading. */
        part.material.transparent = e < 0.995;
        part.material.depthWrite = e >= 0.995;
        part.mesh.position.copy(part.rest).addScaledVector(part.drift, 1 - e);
        part.mesh.scale.setScalar(0.84 + 0.16 * e);

        if (r > 0.5) visibleBox.union(part.box);
      });

      if (visibleBox.isEmpty()) return;

      /* Framing follows what exists: the lone wheel fills the frame, and the
         camera pulls back as the truck grows. */
      const size = visibleBox.getSize(tmp);
      const want = 2.12 / Math.max(0.0001, Math.max(size.x, size.y, size.z));
      const centreY = (visibleBox.min.y + visibleBox.max.y) / 2;
      const centreX = (visibleBox.min.x + visibleBox.max.x) / 2;
      const centreZ = (visibleBox.min.z + visibleBox.max.z) / 2;

      if (!fit.set || immediate) { fit.scale = want; fit.set = true; }
      const k = immediate || reduceMotion ? 1 : 0.12;
      fit.scale = lerp(fit.scale, want, k);

      pivot.scale.setScalar(fit.scale);
      centrer.position.set(
        lerp(centrer.position.x, -centreX, k),
        lerp(centrer.position.y, -centreY, k),
        lerp(centrer.position.z, -centreZ, k)
      );
    };

    /* Place and draw one frame without waiting for the loop. A backgrounded tab
       suspends requestAnimationFrame entirely, and the first paint after the
       model loads should already show the right stage rather than assembling
       itself in front of a reader who has scrolled halfway down. */
    /* `setSize` REALLOCATES the drawing buffer. The loop guards it behind a
       size check; this did not, and it is called from the scroll handler — so
       a single flick reallocated a WebGL buffer dozens of times, which is
       enough to wedge a tab that is also loading a second renderer. */
    const resize = (size: number) => {
      if (renderer.domElement.width === Math.round(size * renderer.getPixelRatio())) return;
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };

    const settle = () => {
      const size = layout(true);
      resize(size);
      assemble(true);
      applyMaterial();
      if (current.fade > 0.99) return;
      renderer.render(scene, camera);
    };

    /* --- loop --------------------------------------------------------------- */

    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);

      const size = layout(false);
      resize(size);

      if (!dragging) {
        velocity *= 0.94;
        spinner.rotation.y += (reduceMotion ? 0 : spin) + velocity;
      }
      pivot.rotation.x = -0.18;

      /* Draw only when there is something to see. Two things make this matter
         rather than being a micro-optimisation: the wheel alone is 21k
         triangles, and the player section starts a SECOND WebGL context on the
         same main thread. Once the object is mostly handed over, or has
         scrolled out of the viewport, it stops. */
      const halfway = current.fade > 0.5;
      const offscreen =
        current.y < -size || current.y > window.innerHeight + size ||
        current.x < -size || current.x > window.innerWidth + size;
      if (halfway || offscreen) return;

      assemble();
      applyMaterial();
      renderer.render(scene, camera);
    };

    settleRef.current = settle;
    tick();

    const onResize = () => settle();
    let scrollQueued = false;
    const onScroll = () => {
      /* Only for the case where nothing is drawing anyway. One settle per
         frame's worth of scrolling, not one per event. */
      if (!document.hidden || scrollQueued) return;
      scrollQueued = true;
      window.setTimeout(() => { scrollQueued = false; settle(); }, 16);
    };
    const onVisibility = () => { if (!document.hidden) settle(); };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      parts.forEach((p) => { p.mesh.geometry.dispose(); p.material.dispose(); });
      draco.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    if (document.hidden) settleRef.current?.();
  }, [checkedParts, material]);

  return <div className={`ei-orb${ready ? " is-ready" : ""}`} ref={hostRef} aria-hidden="true" />;
}
