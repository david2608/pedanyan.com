import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const LAYERS = {
  NONE: 0,
  TORUS_SCENE: 1,
  BLOOM_SCENE: 2,
  ENTIRE_SCENE: 3
} as const;

const BASE_DRIFT_SPEED = 0.08;
const HERO_DRIFT_SPEED = 0.01;
const FACTS_TIME_SPEED = 0.16;
const HERO_TIME_SPEED = 0.1;

function hexToVec3(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return new THREE.Vector3(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255
  );
}

const pointVertexShader = /* glsl */ `
  attribute float size;
  uniform float iTime;
  uniform vec3 iShift;
  uniform vec2 iResolution;
  uniform vec3 iAnimation;
  uniform float uDepth;
  varying float transparency;
  varying float warmness;
  vec3 warp3d(vec3 pos, float t) {
    float curv = 0.9, a = 1.9, b = 0.25, b2 = 0.03, c = 0.02;
    pos *= 2.;
    pos.x += curv * sin(c * t + a * pos.y) + t * b2;
    pos.y += curv * cos(c * t + a * pos.x);
    pos.z += curv * cos(c * t + a * pos.y);
    pos.z += curv * sin(c * t + a * pos.x) + t * b;
    pos.z = abs(pos.z);
    return pos.xyz;
  }
  void main() {
    vec3 v = warp3d(position, iTime);
    v = uDepth * (2. * fract(v + iShift) - 1.) + iAnimation;
    vec4 vpos = modelViewMatrix * vec4(v, 1.);
    transparency = step(length(v), uDepth);
    warmness = step(.75, fract(size * 7.13));
    gl_PointSize = size * iResolution.y / 1000. / -vpos.z;
    gl_Position = projectionMatrix * vpos;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying float transparency;
  varying float warmness;
  uniform float iAlpha;
  uniform vec3 uCool;
  uniform vec3 uWarm;
  void main() {
    vec3 color = mix(uCool * .8, uWarm * .8, warmness);
    float tex = smoothstep(1., .3, length(2. * gl_PointCoord - 1.));
    gl_FragColor = vec4(tex * color, tex * transparency * iAlpha);
  }
`;

const finalFragmentShader = /* glsl */ `
  uniform float iTime;
  uniform sampler2D tDiffuse;
  uniform sampler2D bloomTexture;
  uniform sampler2D torusTexture;
  uniform sampler2D haloTexture;
  uniform vec3 uBg;
  uniform vec3 uFlameA;
  uniform vec3 uFlameB;
  uniform float uFlameAmt;
  varying vec2 vUv;
  vec3 warp3d(vec3 pos, float t){
    float curv=.8,a=1.9,b=0.7;
    pos*=2.;
    pos.x+=curv*sin(t+a*pos.y)+t*b;
    pos.y+=curv*cos(t+a*pos.x);
    pos.y+=curv*sin(t+a*pos.z)+t*b;
    pos.z+=curv*cos(t+a*pos.y);
    pos.z+=curv*sin(t+a*pos.x)+t*b;
    pos.x+=curv*cos(t+a*pos.z);
    return 0.5+0.5*cos(pos.xyz+vec3(1,2,4));
  }
  void main(){
    vec2 uv = 2.*vUv - 1.;
    vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
    vec3 flame = 1.5*uFlameA*w.x;
    flame*=w.y;
    flame += uFlameB*w.z;
    flame *= smoothstep(0.25, 1., abs(uv.y));
    float md = smoothstep(-0.7, 1., -uv.y*uv.x);
    flame *= md*md;
    vec3 bg = uBg * (1.0 - 0.4 * length(uv));
    vec3 halo = texture2D(haloTexture, vUv).xyz;
    gl_FragColor = vec4(
      bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz +
      texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo,
      1.
    );
  }
`;

type CosmicDustBackgroundProps = {
  speedSourceRef: RefObject<HTMLElement | null>;
  variant?: "hero" | "facts";
};

export function CosmicDustBackground({
  speedSourceRef,
  variant = "facts"
}: CosmicDustBackgroundProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "dw-cosmic-dust-canvas";
    host.appendChild(canvas);

    const isHero = variant === "hero";
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: isHero });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    if (isHero) renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.background = isHero ? null : new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 0, 22);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
    camera.position.set(0, 0, 3);
    camera.layers.enable(LAYERS.TORUS_SCENE);
    camera.layers.enable(LAYERS.BLOOM_SCENE);
    camera.layers.enable(LAYERS.ENTIRE_SCENE);
    scene.add(camera);

    const positions: number[] = [];
    const sizes: number[] = [];
    for (let index = 0; index < 940; index += 1) {
      positions.push(2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1);
      sizes.push(25 + 25 * Math.random());
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const uniforms = {
      iTime: { value: 0 },
      iShift: { value: new THREE.Vector3() },
      iAlpha: { value: 0 },
      iAnimation: { value: new THREE.Vector3(0, 0, 0) },
      iResolution: { value: new THREE.Vector2(1, 1) },
      uDepth: { value: 3.7 },
      uCool: { value: hexToVec3(isHero ? "#4d4d4d" : "#707070") },
      uWarm: { value: hexToVec3(isHero ? "#9b9b9b" : "#f0f0f0") }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: isHero ? THREE.NormalBlending : THREE.AdditiveBlending
    });
    material.stencilWrite = false;

    const points = new THREE.Points(geometry, material);
    points.position.set(0, 0, -1);
    points.layers.enable(LAYERS.ENTIRE_SCENE);
    scene.add(points);

    let finalComposer: EffectComposer | null = null;
    let finalPass: ShaderPass | null = null;

    const blackPixel = new Uint8Array([0, 0, 0, 255]);
    const blackTexture = new THREE.DataTexture(blackPixel, 1, 1, THREE.RGBAFormat);
    blackTexture.needsUpdate = true;

    if (!isHero) {
      const FinalPass = {
        uniforms: {
          iTime: { value: 0 },
          tDiffuse: { value: null },
          torusTexture: { value: null },
          bloomTexture: { value: null },
          haloTexture: { value: blackTexture },
          uBg: { value: hexToVec3("#0b0b0b") },
          uFlameA: { value: hexToVec3("#767676") },
          uFlameB: { value: hexToVec3("#e5e5e5") },
          uFlameAmt: { value: 0.16 }
        },
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }",
        fragmentShader: finalFragmentShader
      };

      finalComposer = new EffectComposer(renderer);
      finalComposer.addPass(new RenderPass(scene, camera));
      finalPass = new ShaderPass(FinalPass);
      finalPass.uniforms.bloomTexture.value = blackTexture;
      finalPass.uniforms.torusTexture.value = blackTexture;
      finalComposer.addPass(finalPass);
    }

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      [finalComposer].forEach((composer) => {
        if (!composer) return;
        composer.setPixelRatio(pixelRatio);
        composer.setSize(width, height);
      });
      uniforms.iResolution.value.set(width * pixelRatio, height * pixelRatio);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    let wasActive = false;
    let appearStartedAt = 0;

    const render = (timestamp: number) => {
      frame = window.requestAnimationFrame(render);
      const source = speedSourceRef.current;
      const isActive = source?.dataset.dustActive === "true";

      if (!isActive) {
        wasActive = false;
        return;
      }

      if (!wasActive) {
        wasActive = true;
        appearStartedAt = timestamp;
        uniforms.iAlpha.value = 0;
      }

      const fadeProgress = Math.min(1, Math.max(0, (timestamp - appearStartedAt) / 2200));
      const easedFade = fadeProgress ** 3 * (fadeProgress * (fadeProgress * 6 - 15) + 10);
      uniforms.iAlpha.value = easedFade * (isHero ? 0.045 : 0.68);

      const baseSpeed = isHero ? HERO_DRIFT_SPEED : BASE_DRIFT_SPEED;
      const requestedSpeed = Number(source?.dataset.dustSpeed ?? baseSpeed);
      const driftSpeed = Number.isFinite(requestedSpeed)
        ? THREE.MathUtils.clamp(requestedSpeed, baseSpeed, baseSpeed * 1.5)
        : baseSpeed;

      const elapsed = performance.now() / 1000 * (isHero ? HERO_TIME_SPEED : FACTS_TIME_SPEED);
      uniforms.iTime.value = elapsed;
      uniforms.iShift.value.addScaledVector(camera.position, 0.0022 * driftSpeed);
      if (isHero) {
        camera.layers.set(LAYERS.ENTIRE_SCENE);
        renderer.render(scene, camera);
      } else if (finalComposer && finalPass) {
        finalPass.uniforms.iTime.value = elapsed;
        camera.layers.set(LAYERS.ENTIRE_SCENE);
        finalComposer.render();
      }
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      blackTexture.dispose();
      finalComposer?.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [speedSourceRef, variant]);

  return (
    <div
      className={`dw-cosmic-dust dw-cosmic-dust-${variant}`}
      ref={hostRef}
      aria-hidden="true"
    />
  );
}
