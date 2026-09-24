import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * The 8 Images case study's central claim is that an arbitrary mesh only becomes
 * shoppable once its parts have names. This renders the real file to prove it:
 * `toy-firetruck.glb` exactly as the product serves it - Draco-compressed, 1,066 KB,
 * straight out of Blender - and the part list is read back out of the file at
 * runtime rather than typed here. Clicking a name isolates that mesh.
 *
 * It loads on intersection, never on mount: this is the heaviest thing on the site
 * and a page arguing that heavy 3D can feel light has to behave like it.
 */

const MODEL_URL = "/portfolio-assets/8images/toy-firetruck.glb";
const DRACO_PATH = "/draco/";

type Phase = "idle" | "loading" | "ready" | "error";

export function EightImagesModel() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<{ select: (name: string | null) => void } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [parts, setParts] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  /* Arm on approach, so the fetch starts just before the reader arrives.
     Measured as well as observed: IntersectionObserver is silent in some
     embedded and preview contexts, and a viewer that never loads because one
     API stayed quiet is worse than one that loads a little eagerly. */
  useEffect(() => {
    if (armed) return;
    const host = hostRef.current;
    if (!host) return;

    const near = () => {
      const rect = host.getBoundingClientRect();
      return rect.top < window.innerHeight + 300 && rect.bottom > -300;
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
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) check();
        },
        { rootMargin: "300px 0px" }
      );
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
    setPhase("loading");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(3.1, 1.9, 4.3);

    /* Three lights rather than an HDR: the product ships a 387 KB .exr, and this
       page does not need to pay that to make the argument. */
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(4, 6, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(-5, 2.5, -3.5);
    scene.add(rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    /* Zoom stays off or the wheel hijacks the page scroll. */
    controls.enableZoom = false;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.55;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = Math.PI / 1.85;

    const originals = new Map<string, THREE.Material | THREE.Material[]>();
    const ghost = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      roughness: 1
    });

    const resize = () => {
      /* getBoundingClientRect, not clientWidth: the canvas is absolutely
         positioned so it cannot influence this, but measuring the box the CSS
         actually computed keeps the two honest. */
      const rect = host.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
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

        /* Frame the model rather than trusting its own transform. */
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        const scale = 2.6 / Math.max(size.x, size.y, size.z);
        root.scale.setScalar(scale);
        root.position.sub(centre.multiplyScalar(scale));
        scene.add(root);

        const found: string[] = [];
        root.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          const name = mesh.name || "Unnamed";
          if (!found.includes(name)) found.push(name);
          originals.set(mesh.uuid, mesh.material);
        });

        apiRef.current = {
          select: (name) => {
            root.traverse((node) => {
              const mesh = node as THREE.Mesh;
              if (!mesh.isMesh) return;
              const original = originals.get(mesh.uuid);
              if (!original) return;
              mesh.material = !name || mesh.name === name ? original : ghost;
            });
          }
        };

        setParts(found);
        setPhase("ready");
        resize();
      },
      undefined,
      () => {
        if (!disposed) setPhase("error");
      }
    );

    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      draco.dispose();
      scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const material = originals.get(mesh.uuid);
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      ghost.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      apiRef.current = null;
    };
  }, [armed]);

  const choose = (name: string) => {
    const next = active === name ? null : name;
    setActive(next);
    apiRef.current?.select(next);
  };

  return (
    <div className="dw-ei-model">
      <div className="dw-ei-model-stage" ref={hostRef} aria-hidden="true">
        {phase !== "ready" ? (
          <p className="dw-ei-model-status">
            {phase === "error" ? "The model could not be loaded." : phase === "loading" ? "Loading 1,066 KB…" : ""}
          </p>
        ) : null}
      </div>

      <div className="dw-ei-model-parts">
        <p className="dw-ei-model-parts-label">
          {parts.length ? `${parts.length} named meshes, read out of the file` : "Reading the file…"}
        </p>
        <ul>
          {parts.map((name) => (
            <li key={name}>
              <button
                type="button"
                className={active === name ? "is-active" : undefined}
                onClick={() => choose(name)}
                aria-pressed={active === name}
              >
                {name.replace(/_/g, " ")}
              </button>
            </li>
          ))}
        </ul>
        {parts.length ? (
          <p className="dw-ei-model-hint">
            These names came out of Blender with the model. Naming them is what turns a mesh into something a shopper
            can point at.
          </p>
        ) : null}
      </div>
    </div>
  );
}
