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

/* Which stage each part joins at. The numbers are the `data-orb-stage` values
   the docks declare, so the model assembles in step with the argument. */
const PART_STAGE: Record<string, number> = {
  "Wheels#0": 0,
  "Wheels#1": 1,
  "Wheels#2": 1,
  "Wheels#3": 1,
  "Hubcaps#0": 1,
  "Hubcaps#1": 1,
  "Hubcaps#2": 1,
  "Hubcaps#3": 1,
  Base: 2,
  Body: 3,
  Cabin: 4,
  "Ladder Turret": 5,
  "Ladder Railings": 5,
  "Ladder Caps": 5,
  "Flashing Lights": 6,
  "Wire Parts": 6
};

/** The parts a configurator would call "paint" — what the editor's maps drive. */
const PAINTED = new Set(["Base", "Body", "Cabin", "Ladder Turret"]);

export type OrbMaterial = {
  diffuse: boolean;
  normal: boolean;
  roughness: boolean;
  emission: boolean;
  metalness: boolean;
  transparency: boolean;
  hue: number;
  saturation: number;
  value: number;
  roughnessValue: number;
  emissionValue: number;
  metalnessValue: number;
  transparencyValue: number;
};

export const DEFAULT_ORB: OrbMaterial = {
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

type OrbContextValue = {
  material: OrbMaterial;
  setMaterial: (next: Partial<OrbMaterial>) => void;
};

const OrbContext = createContext<OrbContextValue>({ material: DEFAULT_ORB, setMaterial: () => {} });
export const useOrb = () => useContext(OrbContext);

export function OrbProvider({ children }: { children: ReactNode }) {
  const [material, setState] = useState(DEFAULT_ORB);
  const setMaterial = useCallback(
    (next: Partial<OrbMaterial>) => setState((prev) => ({ ...prev, ...next })),
    []
  );
  const value = useMemo(() => ({ material, setMaterial }), [material, setMaterial]);
  return <OrbContext.Provider value={value}>{children}</OrbContext.Provider>;
}

/** A destination, and how much of the model should exist by the time it arrives. */
export function OrbDock({ id, stage, className }: { id: string; stage: number; className?: string }) {
  return (
    <div
      className={`ei-orb-dock${className ? ` ${className}` : ""}`}
      data-orb-dock={id}
      data-orb-stage={stage}
      aria-hidden="true"
    />
  );
}

/** The part names, in the file's order — the section about naming uses these. */
export const ORB_PART_NAMES = [
  "Base", "Body", "Cabin", "Flashing Lights", "Hubcaps",
  "Ladder Caps", "Ladder Railings", "Ladder Turret", "Wheels", "Wire Parts"
];

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
  stage: number;
  rest: THREE.Vector3;
  drift: THREE.Vector3;
  box: THREE.Box3;
  painted: boolean;
  reveal: number;
};

export function EightImagesOrb() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { material } = useOrb();
  const materialRef = useRef(material);
  materialRef.current = material;

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

        const source = src as THREE.MeshStandardMaterial;
        const mat = new THREE.MeshStandardMaterial({
          color: source.color ? source.color.clone() : new THREE.Color("#b9b9b9"),
          roughness: source.roughness ?? 0.5,
          metalness: source.metalness ?? 0,
          map: source.map ?? null,
          envMapIntensity: 1.05,
          transparent: true,
          opacity: 0
        });

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
          stage: PART_STAGE[name] ?? 6,
          rest,
          drift,
          box,
          painted: PAINTED.has(name),
          reveal: 0
        };
      });

      settle();
      setReady(true);
    });

    /* --- docking ----------------------------------------------------------- */

    const OWN_AT = 0.55;
    const current = { x: 0, y: 0, size: 0, stage: 0, set: false };

    const dockRects = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-orb-dock]"))
        .map((node) => {
          const r = node.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return null;
          return {
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
            size: Math.min(r.width, r.height),
            stage: Number(node.dataset.orbStage ?? 0)
          };
        })
        .filter(Boolean) as { cx: number; cy: number; size: number; stage: number }[];

    const target = () => {
      const docks = dockRects();
      const vh = window.innerHeight;
      const mid = vh / 2;
      if (docks.length === 0) return { x: window.innerWidth / 2, y: mid, size: 320, stage: 0 };

      let best = -1;
      let bestSeen = 0;
      docks.forEach((d, i) => {
        const seen =
          Math.max(0, Math.min(d.cy + d.size / 2, vh) - Math.max(d.cy - d.size / 2, 0)) /
          Math.max(1, d.size);
        if (seen > bestSeen) { bestSeen = seen; best = i; }
      });
      if (best >= 0 && bestSeen >= OWN_AT) return { ...docks[best], x: docks[best].cx, y: docks[best].cy };

      let above = -1;
      for (let i = 0; i < docks.length; i += 1) if (docks[i].cy < mid) above = i;
      const a = docks[Math.max(0, above)];
      const b = docks[Math.min(docks.length - 1, above + 1)];
      if (a === b) return { ...a, x: a.cx, y: a.cy };

      const t = clamp01((mid - a.cy) / Math.max(1, b.cy - a.cy));
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return {
        x: lerp(a.cx, b.cx, e),
        y: lerp(a.cy, b.cy, e),
        size: lerp(a.size, b.size, e),
        stage: lerp(a.stage, b.stage, t)
      };
    };

    const layout = (immediate: boolean) => {
      const t = target();
      if (immediate || !current.set) {
        Object.assign(current, { x: t.x, y: t.y, size: t.size, stage: t.stage, set: true });
      } else {
        const k = reduceMotion ? 1 : 0.16;
        current.x = lerp(current.x, t.x, k);
        current.y = lerp(current.y, t.y, k);
        current.size = lerp(current.size, t.size, k);
        current.stage = lerp(current.stage, t.stage, k);
      }
      const size = Math.max(80, current.size);
      host.style.width = `${size}px`;
      host.style.height = `${size}px`;
      host.style.transform = `translate3d(${current.x - size / 2}px, ${current.y - size / 2}px, 0)`;
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
      if (m.diffuse) {
        tint.setHSL((m.hue % 360) / 360, clamp01(m.saturation / 360), 0.42 + clamp01(m.value / 360) * 0.3);
      }
      if (normalWasOn !== m.normal) normalWasOn = m.normal;

      parts.forEach((part) => {
        if (!part.painted) return;
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
      const stage = current.stage;

      visibleBox.makeEmpty();
      parts.forEach((part) => {
        /* A part fades in over the single stage before its own, so it arrives
           while the reader is travelling into the section that introduces it. */
        const t = clamp01(stage - part.stage + 1);
        part.reveal = immediate || reduceMotion ? t : lerp(part.reveal, t, 0.2);
        const r = part.reveal;

        part.mesh.visible = r > 0.004;
        if (!part.mesh.visible) return;

        const e = easeOut(r);
        part.material.opacity = e;
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
    const settle = () => {
      const size = layout(true);
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      assemble(true);
      applyMaterial();
      renderer.render(scene, camera);
    };

    /* --- loop --------------------------------------------------------------- */

    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);

      const size = layout(false);
      if (renderer.domElement.width !== Math.round(size * renderer.getPixelRatio())) {
        renderer.setSize(size, size, false);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
      }

      if (!dragging) {
        velocity *= 0.94;
        spinner.rotation.y += (reduceMotion ? 0 : spin) + velocity;
      }
      pivot.rotation.x = -0.18;

      assemble();
      applyMaterial();
      renderer.render(scene, camera);
    };

    tick();

    const onResize = () => settle();
    const onScroll = () => { if (document.hidden) settle(); };
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

  return <div className={`ei-orb${ready ? " is-ready" : ""}`} ref={hostRef} aria-hidden="true" />;
}
