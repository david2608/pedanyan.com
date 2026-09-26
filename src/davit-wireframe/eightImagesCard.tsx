import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import "./eightImagesCard.css";

/**
 * The 8 Images thumbnail on the Work grid.
 *
 * Every other card on that grid is a still or a clip. This one is the actual
 * `toy-firetruck.glb` the case study argues about — the same file, Draco-
 * compressed, straight out of Blender — turning slowly on the case's own
 * surface. A screenshot of a 3D viewer is a picture of a claim; the model is
 * the claim.
 *
 * It is also the case the card has to live up to: a page arguing that heavy 3D
 * can feel light cannot make the grid pay a megabyte to scroll past it. So the
 * file is fetched only when the card comes near, the loop runs only while the
 * card is on screen, and reduced motion gets one frame and nothing after it.
 */

const MODEL_URL = "/portfolio-assets/8images/toy-firetruck.glb";
const DRACO_PATH = "/draco/";

/* The case's own three-quarter angle, lowered a little: on a card the model is
   small, and a flatter angle reads as a product shot rather than a scene. Only
   the DIRECTION is fixed — how far back the camera sits is computed from the
   model and the card's shape, so a tall narrow card does not crop the truck. */
const DIRECTION = new THREE.Vector3(3.2, 1.55, 4.3).normalize();
const MARGIN = 1.22;
const TURN = 0.22; // radians per second — one revolution in ~28s

export function EightImagesFiretruckCard() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  /* Arm on approach. IntersectionObserver is silent in some embedded and
     preview contexts, so a scroll check backs it up — the same belt and braces
     the case's own viewer uses. */
  useEffect(() => {
    if (armed) return;
    const host = hostRef.current;
    if (!host) return;

    const near = () => {
      const rect = host.getBoundingClientRect();
      return rect.top < window.innerHeight + 400 && rect.bottom > -400;
    };

    let io: IntersectionObserver | null = null;
    const stop = () => {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
    function check() {
      if (!near()) return;
      setArmed(true);
      stop();
    }

    if (near()) {
      setArmed(true);
      return;
    }
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) check(); }, { rootMargin: "400px 0px" });
      io.observe(host);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return stop;
  }, [armed]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !armed) return;

    let disposed = false;
    let frame = 0;
    let last = 0;
    /* One gate: whether the card is on screen. A backgrounded TAB is not gated
       here, because requestAnimationFrame is already suspended in one — adding
       a document.hidden check buys nothing and breaks any context that reports
       hidden while still painting (embedded panes, webviews, prerender), where
       it leaves a permanently blank canvas. */
    let onScreen = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ready = false;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
      /* A WebGL canvas drawn once goes blank on the next composite unless the
         buffer is kept, and this card cannot assume the loop will ever run:
         under reduced motion there is none by design, and requestAnimationFrame
         is suspended outright in any document the browser considers hidden —
         embedded panes and webviews included. Keeping the buffer costs one
         small canvas' worth of memory and guarantees the card shows the truck
         rather than an empty field. */
      preserveDrawingBuffer: true
    });
    /* 1.75 on the case study, 1.5 here: the card is a quarter of the size and
       there are nine other cards competing for the same compositor. */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = "ei-card-canvas";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    /* The same three lights as the case study, so the card and the page it
       opens are lit by one setup and the truck does not change colour on the
       way in. */
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(4, 6, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(-5, 2.5, -3.5);
    scene.add(rim);

    /* Rotation and centring on separate groups. Put them on one and the model
       orbits the origin instead of turning on the spot. */
    const spinner = new THREE.Group();
    const centrer = new THREE.Group();
    spinner.add(centrer);
    scene.add(spinner);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    /* Frame the model to the card rather than to a fixed camera position. A
       thumbnail slot can be tall and narrow, where the horizontal field of view
       is the tighter constraint — pick whichever half-angle is smaller and back
       off far enough that the bounding sphere fits inside it.

       The case study's viewer never needed this: OrbitControls aims the camera
       every update, and its stage is big and roughly square. A card is neither,
       and a camera that is merely positioned and never aimed renders a
       correctly loaded, correctly lit, entirely empty canvas. */
    let radius = 1.4;
    const frameModel = () => {
      const vHalf = THREE.MathUtils.degToRad(camera.fov) / 2;
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const distance = (radius * MARGIN) / Math.sin(Math.min(vHalf, hHalf));
      camera.position.copy(DIRECTION).multiplyScalar(distance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (!w || !h) return;
      /* setSize reallocates the drawing buffer, so it is guarded: this runs
         from a ResizeObserver that fires on every card hover transform. */
      const current = renderer.getSize(new THREE.Vector2());
      if (current.x === w && current.y === h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      frameModel();
      /* setSize clears the buffer, and nothing else necessarily repaints it. */
      if (ready) renderer.render(scene, camera);
    };

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATH);
    loader.setDRACOLoader(draco);

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;

        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        const scale = 2.6 / Math.max(size.x, size.y, size.z);
        root.scale.setScalar(scale);
        root.position.sub(centre.multiplyScalar(scale));
        centrer.add(root);

        /* The sphere the model sweeps as it turns, so the framing holds at every
           angle rather than only the one it was measured at. */
        radius = size.clone().multiplyScalar(scale).length() / 2;

        root.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          if (mesh.geometry) geometries.push(mesh.geometry);
          const m = mesh.material;
          if (Array.isArray(m)) materials.push(...m);
          else if (m) materials.push(m);
        });

        /* Start a few degrees round so the first painted frame is a three-
           quarter view, not the flat side the file happens to export facing. */
        spinner.rotation.y = -0.45;
        ready = true;
        setReady(true);
        resize();
        /* resize() returns early when the box has not changed, and by now it
           usually has not — so the framing that depends on the model's real
           radius is applied here explicitly rather than left to that call. */
        frameModel();
        renderer.render(scene, camera);
        if (!reduce) start();
      },
      undefined,
      () => { if (!disposed) setFailed(true); }
    );

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      spinner.rotation.y += TURN * dt;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };

    function start() {
      if (disposed || reduce || frame || !onScreen) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    }
    function stop() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    }

    /* Off the screen is off, not slower. Ten cards each idling a WebGL context
       is how a grid starts to feel heavy. */
    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) start(); else stop(); }, { rootMargin: "120px 0px" })
      : null;
    io?.observe(host);

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    return () => {
      disposed = true;
      stop();
      io?.disconnect();
      observer.disconnect();
      draco.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [armed]);

  /* aria-hidden, like the case study's own viewer: the anchor around this card
     already carries the project name and the headline, so announcing a canvas
     here would only repeat them. */
  return (
    <div
      className="ei-card"
      ref={hostRef}
      aria-hidden="true"
      data-ready={ready ? "true" : undefined}
      data-failed={failed ? "true" : undefined}
    />
  );
}
