import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

function roundedBox(width: number, height: number, depth: number, color: number, radius = 0.08) {
  return new THREE.Mesh(
    new RoundedBoxGeometry(width, height, depth, 5, radius),
    new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.08 })
  );
}

export function PhotoLabCardIllustration() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "dw-photo-lab-three-canvas";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 30);
    camera.position.set(0, 0, 6.2);

    const key = new THREE.DirectionalLight(0xffffff, 3.1);
    key.position.set(3, 4, 5);
    scene.add(key, new THREE.HemisphereLight(0xb8f5e6, 0x102521, 2.2));

    const group = new THREE.Group();
    group.rotation.set(-0.11, 0.36, -0.05);
    scene.add(group);

    const panel = roundedBox(3.24, 2.12, 0.18, 0x14231f, 0.13);
    panel.castShadow = true;
    group.add(panel);

    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 420;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#0d1715";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const bands = ["#e9a3a2", "#357e72", "#6fc4ad", "#d6bb81", "#423647"];
      bands.forEach((color, index) => {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(index * 156 - 36, 420);
        context.lineTo(index * 156 + 172, 0);
        context.lineTo(index * 156 + 250, 0);
        context.lineTo(index * 156 + 42, 420);
        context.closePath();
        context.fill();
      });
      context.globalAlpha = 0.22;
      context.strokeStyle = "#ffffff";
      context.lineWidth = 3;
      for (let y = 24; y < 420; y += 20) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(720, y - 38);
        context.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const image = new THREE.Mesh(
      new THREE.PlaneGeometry(1.98, 1.48),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    image.position.set(-0.32, 0, 0.105);
    group.add(image);

    const crop = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.32, 1.04, 0.02)),
      new THREE.LineBasicMaterial({ color: 0xd7fff3, transparent: true, opacity: 0.92 })
    );
    crop.position.set(-0.32, 0, 0.135);
    group.add(crop);

    const controls = new THREE.Group();
    controls.position.set(1.18, 0, 0.12);
    group.add(controls);
    [0.42, 0.02, -0.38].forEach((y, index) => {
      const rail = roundedBox(0.62, 0.045, 0.045, 0x6e9e91, 0.03);
      rail.position.set(0, y, 0);
      controls.add(rail);
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 20, 20),
        new THREE.MeshStandardMaterial({ color: index === 1 ? 0xffad8d : 0x5be2bd, roughness: 0.25, metalness: 0.1 })
      );
      knob.position.set(index === 0 ? -0.18 : index === 1 ? 0.12 : -0.06, y, 0.07);
      knob.userData.phase = index * 1.8;
      controls.add(knob);
    });

    const picker = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.025, 12, 28), new THREE.MeshStandardMaterial({ color: 0xd7fff3, roughness: 0.25 }));
    const stem = roundedBox(0.035, 0.24, 0.035, 0xd7fff3, 0.02);
    stem.position.set(0.1, -0.13, 0);
    stem.rotation.z = -0.65;
    picker.add(ring, stem);
    picker.position.set(1.18, -0.74, 0.17);
    group.add(picker);

    const swatch = roundedBox(0.76, 0.5, 0.1, 0xbc615a, 0.07);
    swatch.position.set(-1.52, -1.26, 0.1);
    swatch.rotation.z = -0.16;
    group.add(swatch);

    let frame = 0;
    let width = 1;
    let height = 1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const render = (time = 0) => {
      const t = time * 0.001;
      if (!reduced) {
        group.rotation.y = 0.34 + Math.sin(t * 0.62) * 0.13;
        group.rotation.x = -0.1 + Math.cos(t * 0.55) * 0.035;
        group.position.y = Math.sin(t * 0.8) * 0.09;
        crop.scale.setScalar(1 + Math.sin(t * 1.1) * 0.04);
        controls.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
            child.position.x = Math.sin(t * 1.25 + Number(child.userData.phase)) * 0.16;
          }
        });
        picker.rotation.z = Math.sin(t * 0.9) * 0.12;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      texture.dispose();
      renderer.dispose();
      host.replaceChildren();
    };
  }, []);

  return <div ref={hostRef} className="dw-photo-lab-three" role="img" aria-label="Animated 3D Material Exchange Photo Lab editor illustration" />;
}
