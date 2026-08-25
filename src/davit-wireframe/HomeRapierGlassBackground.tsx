import { useEffect, useRef, type RefObject } from "react";
import RAPIER, { type RigidBody, type World } from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type RapierGlassCubesProps = {
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
};

type LegacyHomeGlassCubesProps = {
  heroRef: RefObject<HTMLElement | null>;
};

type CubeLayout = {
  x: number;
  y: number;
  z: number;
  size: number;
  rotation: [number, number, number];
  phase: number;
  pointerDepth: number;
};

type PhysicsCube = {
  mesh: THREE.Mesh;
  body: RigidBody;
  home: THREE.Vector3;
  phase: number;
};

type PhysicsState = {
  world: World;
  cubes: PhysicsCube[];
  pointerBody: RigidBody;
  unit: number;
  accumulator: number;
  lastTime: number;
};

const desktopLayout: CubeLayout[] = [
  { x: -0.27, y: 0.1, z: 70, size: 0.32, rotation: [-0.18, 0.34, -0.1], phase: 0.2, pointerDepth: 1.15 },
  { x: -0.08, y: 0.09, z: 145, size: 0.27, rotation: [0.12, -0.28, 0.12], phase: 1.6, pointerDepth: 1.45 },
  { x: 0.19, y: 0.08, z: 35, size: 0.3, rotation: [-0.12, 0.26, -0.16], phase: 2.8, pointerDepth: 0.86 },
  { x: -0.17, y: -0.15, z: 115, size: 0.23, rotation: [0.2, 0.18, 0.08], phase: 4.1, pointerDepth: 1.24 },
  { x: 0.13, y: -0.16, z: 175, size: 0.2, rotation: [-0.08, -0.24, 0.16], phase: 5.3, pointerDepth: 1.55 }
];

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uBackdrop;
  uniform vec2 uResolution;
  uniform float uRefraction;
  uniform float uChromatic;
  uniform float uLiquid;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewDirection);
    float facing = abs(dot(normal, viewDirection));
    float fresnel = pow(1.0 - facing, 2.15);
    float faceAngle = 1.0 - abs(normal.z);

    vec2 screenUv = gl_FragCoord.xy / uResolution;
    vec2 bendDirection = normal.xy + vec2(normal.y, -normal.x) * 0.14;
    float bend = uRefraction * (0.38 + faceAngle * 1.2 + fresnel * 1.8);
    vec2 liquidWarp = vec2(
      sin(screenUv.y * 31.0 + screenUv.x * 8.0 + uTime * 0.34),
      cos(screenUv.x * 27.0 - screenUv.y * 11.0 - uTime * 0.27)
    );
    liquidWarp += vec2(
      sin(screenUv.y * 63.0 - uTime * 0.19),
      cos(screenUv.x * 57.0 + uTime * 0.16)
    ) * 0.42;
    vec2 offset = bendDirection * bend + liquidWarp * uLiquid * (0.42 + faceAngle * 0.7 + fresnel * 0.35);

    vec2 uvR = clamp(screenUv + offset * (1.0 + uChromatic), 0.002, 0.998);
    vec2 uvG = clamp(screenUv + offset, 0.002, 0.998);
    vec2 uvB = clamp(screenUv + offset * (1.0 - uChromatic), 0.002, 0.998);

    vec3 baseSample = texture2D(uBackdrop, screenUv).rgb;
    vec3 refracted = vec3(
      texture2D(uBackdrop, uvR).r,
      texture2D(uBackdrop, uvG).g,
      texture2D(uBackdrop, uvB).b
    );
    vec3 liquidSmear = texture2D(
      uBackdrop,
      clamp(screenUv - offset * 0.72 + liquidWarp * uLiquid * 0.34, 0.002, 0.998)
    ).rgb;

    vec3 lightDirection = normalize(vec3(-0.4, 0.72, 0.56));
    float broadLight = pow(max(dot(normal, lightDirection), 0.0), 8.0);
    float sharpLight = pow(max(dot(reflect(-lightDirection, normal), viewDirection), 0.0), 42.0);
    float edgeLight = smoothstep(0.18, 0.92, fresnel);

    vec3 glassTint = vec3(0.955, 0.978, 0.99);
    vec3 edgeTint = vec3(0.64, 0.7, 0.74);
    float opticalMix = clamp(0.18 + faceAngle * 0.34 + fresnel * 0.52, 0.0, 1.0);
    refracted = mix(baseSample, refracted, opticalMix);
    refracted = mix(refracted, liquidSmear, 0.22 + faceAngle * 0.18);
    refracted = mix(refracted, glassTint, fresnel * 0.045);
    refracted = mix(refracted, edgeTint, edgeLight * 0.16);
    refracted += broadLight * vec3(0.022, 0.028, 0.032);
    refracted += sharpLight * vec3(0.3, 0.37, 0.42);
    refracted += edgeLight * vec3(0.025, 0.038, 0.045);
    refracted *= 1.0 - edgeLight * 0.055;

    float alpha = 0.985;
    gl_FragColor = vec4(refracted, alpha);
  }
`;

function drawCapturedText(
  context: CanvasRenderingContext2D,
  element: HTMLElement,
  containerRect: DOMRect
) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  if (rect.width <= 0 || rect.height <= 0 || style.visibility === "hidden" || style.opacity === "0") return;

  const fontSize = Number.parseFloat(style.fontSize) || 16;
  const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.1;
  const text = element.innerText || element.textContent || "";
  if (!text.trim()) return;

  context.save();
  context.fillStyle = style.color || "#050505";
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  context.textBaseline = "top";
  context.textAlign = style.textAlign === "right" ? "right" : style.textAlign === "center" ? "center" : "left";

  const baseX =
    context.textAlign === "right"
      ? rect.right - containerRect.left
      : context.textAlign === "center"
        ? rect.left - containerRect.left + rect.width / 2
        : rect.left - containerRect.left;
  let y = rect.top - containerRect.top;

  text.split(/\n+/).forEach((explicitLine) => {
    const words = explicitLine.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      y += lineHeight;
      return;
    }

    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > rect.width) {
        context.fillText(line, baseX, y);
        y += lineHeight;
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) {
      context.fillText(line, baseX, y);
      y += lineHeight;
    }
  });
  context.restore();
}

function drawSectionTexture(container: HTMLElement, pixelRatio: number) {
  const containerRect = container.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(containerRect.width * pixelRatio));
  canvas.height = Math.max(1, Math.round(containerRect.height * pixelRatio));
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  context.scale(pixelRatio, pixelRatio);
  const containerStyle = window.getComputedStyle(container);
  context.fillStyle = containerStyle.backgroundColor === "rgba(0, 0, 0, 0)"
    ? "#ffffff"
    : containerStyle.backgroundColor;
  context.fillRect(0, 0, containerRect.width, containerRect.height);

  const portrait = container.querySelector<HTMLImageElement>(".dw-home-hero-portrait-card img");
  const portraitFrame = container.querySelector<HTMLElement>(".dw-home-hero-portrait-card");
  if (portrait?.complete && portrait.naturalWidth && portraitFrame) {
    const frameRect = portraitFrame.getBoundingClientRect();
    const frameX = frameRect.left - containerRect.left;
    const frameY = frameRect.top - containerRect.top;
    const frameRatio = frameRect.width / frameRect.height;
    const imageRatio = portrait.naturalWidth / portrait.naturalHeight;
    let sourceWidth = portrait.naturalWidth;
    let sourceHeight = portrait.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > frameRatio) {
      sourceWidth = portrait.naturalHeight * frameRatio;
      sourceX = (portrait.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = portrait.naturalWidth / frameRatio;
      sourceY = (portrait.naturalHeight - sourceHeight) / 2;
    }

    context.save();
    context.beginPath();
    context.rect(frameX, frameY, frameRect.width, frameRect.height);
    context.clip();
    context.filter = "grayscale(1) contrast(1.08) brightness(0.92)";
    context.drawImage(
      portrait,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      frameX,
      frameY,
      frameRect.width,
      frameRect.height
    );
    context.restore();
  }

  const headline = container.querySelector<HTMLElement>(".dw-home-hero-statement h1");
  if (headline) {
    const headlineRect = headline.getBoundingClientRect();
    const style = window.getComputedStyle(headline);
    const fontSize = Number.parseFloat(style.fontSize) || 100;
    const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.0679;
    const lines = Array.from(headline.querySelectorAll(":scope > span")).map((line) => line.textContent || "");
    context.fillStyle = style.color || "#050505";
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.textBaseline = "top";
    context.textAlign = "left";
    const x = headlineRect.left - containerRect.left;
    const y = headlineRect.top - containerRect.top;
    lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  }

  container
    .querySelectorAll<HTMLElement>("[data-glass-capture]")
    .forEach((element) => drawCapturedText(context, element, containerRect));

  return canvas;
}

export function RapierGlassCubes({ containerRef, className = "" }: RapierGlassCubesProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const container = containerRef.current;
    if (!layer || !container) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "dw-home-glass-canvas";
    layer.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 1, 5000);
    const placeholder = new Uint8Array([255, 255, 255, 255]);
    const backdropTexture = new THREE.DataTexture(placeholder, 1, 1, THREE.RGBAFormat);
    backdropTexture.colorSpace = THREE.SRGBColorSpace;
    backdropTexture.needsUpdate = true;

    const uniforms = {
      uBackdrop: { value: backdropTexture as THREE.Texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uRefraction: { value: 0.014 },
      uChromatic: { value: 0.052 },
      uLiquid: { value: 0.0058 },
      uTime: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide,
      toneMapped: false
    });

    const geometry = new RoundedBoxGeometry(1, 1, 1, 10, 0.12);
    const cubes = desktopLayout.map((layout) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.layout = layout;
      scene.add(mesh);
      return mesh;
    });

    const pointerTarget = new THREE.Vector3(50, 50, 50);
    const pointerCurrent = new THREE.Vector3(50, 50, 50);
    const pointerDelta = new THREE.Vector3();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let animationFrame = 0;
    let captureTimer = 0;
    let physicsTimer = 0;
    let activeTexture: THREE.Texture = backdropTexture;
    let physics: PhysicsState | null = null;
    let rapierReady = false;
    let pointerActive = false;
    let isVisible = false;
    let disposed = false;

    const destroyPhysics = () => {
      physics?.world.free();
      physics = null;
    };

    const rebuildPhysics = () => {
      if (!rapierReady || disposed) return;
      destroyPhysics();

      const basis = Math.min(width, height);
      const compact = width < 760;
      const tablet = width >= 760 && width < 1020;
      const visibleCount = compact ? 2 : tablet ? 3 : cubes.length;
      const unit = Math.max(120, basis * 0.25);
      const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
      world.timestep = 1 / 60;
      const halfWidth = width / unit / 2;
      const halfHeight = height / unit / 2;
      const safeInset = 0.08;

      const physicsCubes: PhysicsCube[] = [];
      cubes.forEach((mesh, index) => {
        if (index >= visibleCount) return;
        const layout = mesh.userData.layout as CubeLayout;
        const physicalSize = basis * layout.size * (compact ? 0.82 : 1);
        const physicsSize = physicalSize / unit;
        const cubeHalf = physicsSize * 0.5;
        const home = new THREE.Vector3(
          THREE.MathUtils.clamp(layout.x * width / unit, -halfWidth + cubeHalf + safeInset, halfWidth - cubeHalf - safeInset),
          THREE.MathUtils.clamp(layout.y * height / unit, -halfHeight + cubeHalf + safeInset, halfHeight - cubeHalf - safeInset),
          layout.z / unit
        );
        const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...layout.rotation));
        const body = world.createRigidBody(
          RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(home.x, home.y, home.z)
            .setRotation({ x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w })
            .setLinearDamping(0.95)
            .setAngularDamping(3.15)
            .setCcdEnabled(true)
            .setCanSleep(false)
        );
        body.setLinvel(
          {
            x: Math.sin(layout.phase) * 0.035,
            y: Math.cos(layout.phase * 1.37) * 0.035,
            z: Math.sin(layout.phase * 0.71) * 0.018
          },
          true
        );
        body.setAngvel(
          {
            x: Math.sin(layout.phase) * 0.055,
            y: Math.cos(layout.phase) * 0.05,
            z: Math.sin(layout.phase * 0.63) * 0.04
          },
          true
        );
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(cubeHalf, cubeHalf, cubeHalf)
            .setMass(0.82)
            .setRestitution(0.22)
            .setFriction(0.18),
          body
        );
        physicsCubes.push({ mesh, body, home, phase: layout.phase });
      });

      const pointerBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(50, 50, 50)
      );
      world.createCollider(
        RAPIER.ColliderDesc.ball(compact ? 0.42 : 0.62).setRestitution(0.58).setFriction(0.06),
        pointerBody
      );

      const wallThickness = 0.28;
      const wallDepth = 4.2;
      const walls = [
        { position: [-halfWidth + safeInset - wallThickness / 2, 0, 0], half: [wallThickness / 2, halfHeight + 1, wallDepth] },
        { position: [halfWidth - safeInset + wallThickness / 2, 0, 0], half: [wallThickness / 2, halfHeight + 1, wallDepth] },
        { position: [0, halfHeight - safeInset + wallThickness / 2, 0], half: [halfWidth + 1, wallThickness / 2, wallDepth] },
        { position: [0, -halfHeight + safeInset - wallThickness / 2, 0], half: [halfWidth + 1, wallThickness / 2, wallDepth] },
        { position: [0, 0, 2.35], half: [halfWidth + 1, halfHeight + 1, wallThickness / 2] },
        { position: [0, 0, -2.35], half: [halfWidth + 1, halfHeight + 1, wallThickness / 2] }
      ];
      walls.forEach(({ position, half }) => {
        const wall = world.createRigidBody(
          RAPIER.RigidBodyDesc.fixed().setTranslation(position[0], position[1], position[2])
        );
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(half[0], half[1], half[2]).setRestitution(0.28).setFriction(0.08),
          wall
        );
      });

      pointerTarget.set(50, 50, 50);
      pointerCurrent.set(50, 50, 50);
      pointerActive = false;
      physics = { world, cubes: physicsCubes, pointerBody, unit, accumulator: 0, lastTime: performance.now() };
    };

    const updateLayout = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);

      camera.aspect = width / height;
      camera.position.z = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.updateProjectionMatrix();

      const compact = width < 760;
      const tablet = width >= 760 && width < 1020;
      const visibleCount = compact ? 2 : tablet ? 3 : cubes.length;
      const basis = Math.min(width, height);

      cubes.forEach((cube, index) => {
        const layout = cube.userData.layout as CubeLayout;
        cube.visible = index < visibleCount;
        cube.scale.setScalar(basis * layout.size * (compact ? 0.82 : 1));
        cube.position.set(layout.x * width, layout.y * height, layout.z);
        cube.rotation.set(...layout.rotation);
      });

      window.clearTimeout(physicsTimer);
      physicsTimer = window.setTimeout(rebuildPhysics, 80);
    };

    const captureContainer = (delay = 140) => {
      window.clearTimeout(captureTimer);
      captureTimer = window.setTimeout(async () => {
        if (disposed) return;
        try {
          const image = container.querySelector("img");
          if (image && !image.complete) await image.decode();
          if (document.fonts?.ready) await document.fonts.ready;
          const captured = drawSectionTexture(container, pixelRatio);
          if (disposed) return;

          const nextTexture = new THREE.CanvasTexture(captured);
          nextTexture.colorSpace = THREE.SRGBColorSpace;
          nextTexture.minFilter = THREE.LinearFilter;
          nextTexture.magFilter = THREE.LinearFilter;
          nextTexture.generateMipmaps = false;
          nextTexture.needsUpdate = true;

          if (activeTexture !== backdropTexture) activeTexture.dispose();
          activeTexture = nextTexture;
          uniforms.uBackdrop.value = nextTexture;
          layer.classList.add("is-ready");
        } catch (error) {
          console.warn("Unable to prepare the glass refraction texture", error);
        }
      }, delay);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!physics || event.pointerType === "touch") return;
      const nextX = (event.clientX - rect.left - rect.width / 2) / physics.unit;
      const nextY = -(event.clientY - rect.top - rect.height / 2) / physics.unit;
      pointerTarget.set(nextX, nextY, 0.36);
      if (!pointerActive) {
        pointerCurrent.copy(pointerTarget);
        physics.pointerBody.setTranslation(
          { x: pointerCurrent.x, y: pointerCurrent.y, z: pointerCurrent.z },
          true
        );
      }
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
      pointerTarget.set(50, 50, 50);
      pointerCurrent.set(50, 50, 50);
      physics?.pointerBody.setTranslation({ x: 50, y: 50, z: 50 }, true);
    };

    const render = (time: number) => {
      if (!isVisible) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      uniforms.uTime.value = time * 0.001;
      if (physics) {
        const frameDelta = Math.min((time - physics.lastTime) / 1000, 0.05);
        physics.lastTime = time;
        physics.accumulator += Math.max(0, frameDelta);
        let steps = 0;

        while (physics.accumulator >= physics.world.timestep && steps < 3) {
          physics.accumulator -= physics.world.timestep;
          steps += 1;

          if (pointerActive && !reducedMotion) {
            pointerDelta.copy(pointerTarget).sub(pointerCurrent);
            const maxStep = 0.72;
            if (pointerDelta.length() > maxStep) pointerDelta.setLength(maxStep);
            pointerCurrent.add(pointerDelta);
            physics.pointerBody.setNextKinematicTranslation({
              x: pointerCurrent.x,
              y: pointerCurrent.y,
              z: pointerCurrent.z
            });
          } else {
            physics.pointerBody.setNextKinematicTranslation({ x: 50, y: 50, z: 50 });
          }

          const seconds = time * 0.001;
          physics.cubes.forEach(({ body, home, phase }) => {
            if (reducedMotion) {
              body.setLinvel({ x: 0, y: 0, z: 0 }, false);
              body.setAngvel({ x: 0, y: 0, z: 0 }, false);
              return;
            }
            const position = body.translation();
            const homePull = {
              x: (home.x - position.x) * 0.0052 + Math.sin(seconds * 0.28 + phase) * 0.00012,
              y: (home.y - position.y) * 0.0052 + Math.cos(seconds * 0.24 + phase) * 0.00012,
              z: (home.z - position.z) * 0.0042 + Math.sin(seconds * 0.19 + phase) * 0.00008
            };
            body.applyImpulse(homePull, true);
          });
          physics.world.step();
        }

        physics.cubes.forEach(({ mesh, body }) => {
          const position = body.translation();
          const rotation = body.rotation();
          mesh.position.set(position.x * physics!.unit, position.y * physics!.unit, position.z * physics!.unit);
          mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        });
      }

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    updateLayout();
    captureContainer(220);
    void RAPIER.init().then(() => {
      if (disposed) return;
      rapierReady = true;
      rebuildPhysics();
    });
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
      captureContainer(220);
    });
    resizeObserver.observe(container);
    const themeObserver = new MutationObserver(() => captureContainer(80));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-dw-theme"]
    });
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (physics) physics.lastTime = performance.now();
          captureContainer(80);
        }
      },
      { rootMargin: "160px 0px" }
    );
    visibilityObserver.observe(container);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.clearTimeout(captureTimer);
      window.clearTimeout(physicsTimer);
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      cubes.forEach((cube) => scene.remove(cube));
      destroyPhysics();
      geometry.dispose();
      material.dispose();
      activeTexture.dispose();
      if (backdropTexture !== activeTexture) backdropTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef]);

  return (
    <div
      ref={layerRef}
      className={`dw-home-rapier-bg dw-rapier-glass-cubes ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

export function HomeRapierGlassBackground({ heroRef }: LegacyHomeGlassCubesProps) {
  return <RapierGlassCubes containerRef={heroRef} />;
}
