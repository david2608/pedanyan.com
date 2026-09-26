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
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import "./eightImagesOrb.css";

/**
 * One object, the whole page.
 *
 * The case study is about a configurator, so it argues better with a thing than
 * about a thing. A single sphere is mounted once, above the page, and travels
 * between docks as the reader scrolls — large and central in the hero, then
 * smaller beside the argument, then sitting inside the material editor where it
 * becomes the editor's subject and answers every switch in the layer stack.
 *
 * It is real three.js rather than CSS because the six maps ARE the six channels
 * of a PBR material. Diffuse is colour, normal is surface, roughness, metalness,
 * emission and transparency are literally material.roughness, .metalness,
 * .emissive and .opacity. Drawing that in gradients would have been a picture of
 * the idea; this is the idea.
 *
 * DOCKING. Any element carrying `data-orb-dock` is a destination. Each frame the
 * orb finds the two docks the scroll position sits between and interpolates the
 * rectangle, so it flies rather than jumps. No dock on screen means it parks on
 * the nearest one.
 */

export type OrbMaterial = {
  diffuse: boolean;
  normal: boolean;
  roughness: boolean;
  emission: boolean;
  metalness: boolean;
  transparency: boolean;
  hue: number;          /* 0-360, from the Diffuse/Normal H slider */
  saturation: number;   /* 0-360 in the UI; read as 0-1 here */
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
  hue: 0,
  saturation: 0,
  value: 0,
  roughnessValue: 0.35,
  emissionValue: 0.27,
  metalnessValue: 0,
  transparencyValue: 0
};

type OrbContextValue = {
  material: OrbMaterial;
  setMaterial: (next: Partial<OrbMaterial>) => void;
};

const OrbContext = createContext<OrbContextValue>({
  material: DEFAULT_ORB,
  setMaterial: () => {}
});

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

/** A destination. Renders nothing visible; it only holds a rectangle. */
export function OrbDock({ id, className }: { id: string; className?: string }) {
  return <div className={`ei-orb-dock${className ? ` ${className}` : ""}`} data-orb-dock={id} aria-hidden="true" />;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** A tiling normal map, generated rather than downloaded, so nothing 404s. */
function makeNormalMap() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(size, size);
  /* Value noise, then a cheap Sobel to turn height into a normal. */
  const height = new Float32Array(size * size);
  for (let i = 0; i < height.length; i += 1) height[i] = Math.random();
  const smooth = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let sum = 0;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          sum += height[((y + dy + size) % size) * size + ((x + dx + size) % size)];
        }
      }
      smooth[y * size + x] = sum / 25;
    }
  }
  const at = (x: number, y: number) => smooth[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 6;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 6;
      const n = new THREE.Vector3(-dx, -dy, 1).normalize();
      const i = (y * size + x) * 4;
      image.data[i] = (n.x * 0.5 + 0.5) * 255;
      image.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      image.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

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
    renderer.toneMappingExposure = 0.95;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    /* Framing: sphere radius 1, so visible height at the sphere is
       2 * z * tan(fov/2). At z = 4.4 that is ~2.52, which puts the sphere at
       about 80% of the frame — full-bleed enough to read as an object, with
       room for the drag to not clip it. */
    camera.position.set(0, 0, 4.4);

    /* A studio environment is what makes a grey sphere read as a material at
       all — without reflections, roughness and metalness are invisible. */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(4, -2, 3);
    scene.add(fill);

    const normalMap = makeNormalMap();
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#b9b9b9"),
      roughness: 0.35,
      metalness: 0,
      envMapIntensity: 1.1,
      transparent: true,
      opacity: 1
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), mat);
    scene.add(mesh);

    let frame = 0;
    let disposed = false;

    /* --- docking ---------------------------------------------------------- */

    const current = { x: 0, y: 0, size: 0, set: false };

    const dockRects = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-orb-dock]"));
      return nodes
        .map((node) => {
          const r = node.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return null;
          return {
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
            size: Math.min(r.width, r.height)
          };
        })
        .filter(Boolean) as { cx: number; cy: number; size: number }[];
    };

    /* Docking, and why it is not a simple lerp between centres.

       The first version interpolated on "where is the viewport centre relative
       to each dock's centre", which means the orb only reaches a dock at the
       instant that dock's centre crosses the middle of the screen — and then
       immediately leaves. It never sat still inside the editor, which is the one
       place it has to.

       So: a dock that is substantially on screen OWNS the object. The orb
       travels only in the gaps between owners. */
    const OWN_AT = 0.55;

    const target = () => {
      const docks = dockRects();
      const vh = window.innerHeight;
      const mid = vh / 2;
      if (docks.length === 0) return { x: window.innerWidth / 2, y: mid, size: 320 };

      let best = -1;
      let bestSeen = 0;
      docks.forEach((d, i) => {
        const top = d.cy - d.size / 2;
        const bottom = d.cy + d.size / 2;
        const seen = Math.max(0, Math.min(bottom, vh) - Math.max(top, 0)) / Math.max(1, d.size);
        if (seen > bestSeen) { bestSeen = seen; best = i; }
      });

      if (best >= 0 && bestSeen >= OWN_AT) {
        const d = docks[best];
        return { x: d.cx, y: d.cy, size: d.size };
      }

      /* In a gap: ride between the dock above and the dock below. */
      let above = -1;
      for (let i = 0; i < docks.length; i += 1) if (docks[i].cy < mid) above = i;
      const a = docks[Math.max(0, above)];
      const b = docks[Math.min(docks.length - 1, above + 1)];
      if (a === b) return { x: a.cx, y: a.cy, size: a.size };

      const t = clamp01((mid - a.cy) / Math.max(1, b.cy - a.cy));
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return { x: lerp(a.cx, b.cx, e), y: lerp(a.cy, b.cy, e), size: lerp(a.size, b.size, e) };
    };

    /* --- drag to spin ------------------------------------------------------ */

    let dragging = false;
    let lastX = 0;
    let spin = 0.0016;
    let velocity = 0;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      host.setPointerCapture(event.pointerId);
      host.classList.add("is-dragging");
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      velocity = (event.clientX - lastX) * 0.006;
      mesh.rotation.y += velocity;
      lastX = event.clientX;
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      host.releasePointerCapture?.(event.pointerId);
      host.classList.remove("is-dragging");
    };
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);

    /* --- loop -------------------------------------------------------------- */

    /* `material.needsUpdate = true` triggers a SHADER RECOMPILE. Setting it on
       every frame dropped the loop to a handful of frames per second, which is
       why the object crawled toward its dock instead of flying. Only the
       normal-map swap changes the program; everything else is a uniform. */
    let normalWasOn: boolean | null = null;

    const applyMaterial = () => {
      const m = materialRef.current;
      const colour = new THREE.Color();
      if (m.diffuse) {
        colour.setHSL((m.hue % 360) / 360, clamp01(m.saturation / 360), 0.45 + clamp01(m.value / 360) * 0.35);
      } else {
        colour.set("#b9b9b9");
      }
      mat.color.copy(colour);
      if (normalWasOn !== m.normal) {
        mat.normalMap = m.normal ? normalMap : null;
        mat.needsUpdate = true;
        normalWasOn = m.normal;
      }
      if (mat.normalScale) mat.normalScale.set(m.normal ? 0.85 : 0, m.normal ? 0.85 : 0);
      mat.roughness = m.roughness ? clamp01(m.roughnessValue) : 0.12;
      mat.metalness = m.metalness ? clamp01(m.metalnessValue) : 0.02;
      /* Emission tints and lifts; it does not glow. At full strength the old
         0.9 multiplier washed a grey sphere out to paper white, which made
         every other map invisible. */
      mat.emissive.copy(m.emission ? colour : new THREE.Color("#000000"));
      mat.emissiveIntensity = m.emission ? clamp01(m.emissionValue) * 0.32 : 0;
      mat.opacity = m.transparency ? 1 - clamp01(m.transparencyValue) * 0.85 : 1;
    };

    /* Position is computed here rather than only inside the animation frame.
       A backgrounded tab suspends requestAnimationFrame entirely, so an orb
       driven only by the loop freezes wherever it was and then flies across the
       page when the reader comes back. Scroll and visibility both place it
       immediately when nothing is being drawn; the loop only smooths. */
    const layout = (immediate: boolean) => {
      const t = target();
      if (immediate || !current.set) {
        current.x = t.x;
        current.y = t.y;
        current.size = t.size;
        current.set = true;
      } else {
        /* A soft follow, so scrolling feels like carrying the object rather
           than scrubbing a timeline. */
        const k = reduceMotion ? 1 : 0.16;
        current.x = lerp(current.x, t.x, k);
        current.y = lerp(current.y, t.y, k);
        current.size = lerp(current.size, t.size, k);
      }

      const size = Math.max(80, current.size);
      host.style.width = `${size}px`;
      host.style.height = `${size}px`;
      host.style.transform = `translate3d(${current.x - size / 2}px, ${current.y - size / 2}px, 0)`;
      return size;
    };

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
        mesh.rotation.y += (reduceMotion ? 0 : spin) + velocity;
      }
      mesh.rotation.x = Math.sin(mesh.rotation.y * 0.35) * 0.08;

      applyMaterial();
      renderer.render(scene, camera);
    };

    tick();
    setReady(true);

    const onResize = () => layout(true);
    const onScroll = () => { if (document.hidden) layout(true); };
    const onVisibility = () => { if (!document.hidden) layout(true); };
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
      mesh.geometry.dispose();
      mat.dispose();
      normalMap?.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className={`ei-orb${ready ? " is-ready" : ""}`} ref={hostRef} aria-hidden="true" />;
}
