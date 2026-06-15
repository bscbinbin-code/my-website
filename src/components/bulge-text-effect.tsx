"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import html2canvas from "html2canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import type CustomShaderMaterialImpl from "three-custom-shader-material/vanilla";

const vertexShader = `
uniform vec2 uMouse;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

float circle(vec2 uv, vec2 circlePosition, float radius) {
  float dist = distance(circlePosition, uv);
  return 1. - smoothstep(0.0, radius, dist);
}

float elevation(float radius, float intensity) {
  float circleShape = circle(uv, (uMouse * 0.5) + 0.5, radius);
  return circleShape * intensity;
}

void main() {
  vec3 newPosition = position;
  float pulse = 0.84 + sin(uTime * 1.2) * 0.16;
  float bulge = elevation(0.24, 0.92 * pulse);
  newPosition.z += bulge;

  csm_Position = newPosition;
  vUv = uv;
  vElevation = bulge;
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main() {
  vec4 finalTexture = texture2D(uTexture, vUv);
  vec2 lightPosition = (uMouse * 0.5) + 0.5;
  float cursorGlow = 1. - smoothstep(0.0, 0.36, distance(vUv, lightPosition));
  float edgeGlow = smoothstep(0.08, 0.88, vElevation);
  float shimmer = 0.5 + 0.5 * sin((vUv.x * 42.0) + (uTime * 1.8));
  vec3 glowColor = vec3(0.92, 0.96, 1.0) * (cursorGlow * 0.28 + edgeGlow * 0.22 + shimmer * edgeGlow * 0.06);
  csm_DiffuseColor = vec4(finalTexture.rgb + glowColor * finalTexture.a, finalTexture.a);
}
`;

type ShaderUniforms = {
  uTexture: { value: THREE.Texture | null };
  uMouse: { value: THREE.Vector2 };
  uTime: { value: number };
};

type DotFieldUniforms = {
  uMouse: { value: THREE.Vector2 };
  uTime: { value: number };
  uViewport: { value: THREE.Vector2 };
};

const dotFieldVertexShader = `
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uViewport;

attribute float aSeed;
attribute vec2 aGridUv;

varying float vAlpha;
varying float vGlow;
varying vec3 vColor;

void main() {
  vec3 p = position;
  vec2 mousePosition = uMouse * uViewport * 0.5;
  float distanceToMouse = distance(p.xy, mousePosition);
  float focus = 1.0 - smoothstep(0.0, min(uViewport.x, uViewport.y) * 0.44, distanceToMouse);
  float bandOne = sin((aGridUv.x * 8.8) + (uTime * 0.62) + (aGridUv.y * 2.4));
  float bandTwo = sin((aGridUv.y * 7.2) - (uTime * 0.54) + (aGridUv.x * 3.2));
  float wave = (bandOne + bandTwo) * 0.5;
  float ripple = sin(distanceToMouse * 5.2 - uTime * 2.1) * focus;

  p.z += wave * 0.18 + ripple * 0.52 + focus * 0.42;
  p.xy += normalize(vec2(
    sin(aSeed * 19.7 + uTime * 0.24),
    cos(aSeed * 23.1 - uTime * 0.2)
  )) * (0.006 + focus * 0.028);

  vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;

  float blueBand = smoothstep(0.26, 0.86, sin((aGridUv.x * 5.6) + (aGridUv.y * 3.2) + uTime * 0.32) * 0.5 + 0.5);
  float amberBand = smoothstep(0.42, 0.96, sin((aGridUv.x * -4.4) + (aGridUv.y * 5.8) - uTime * 0.28) * 0.5 + 0.5);
  vec3 baseColor = vec3(0.72, 0.74, 0.66);
  vec3 blueColor = vec3(0.12, 0.30, 0.86);
  vec3 amberColor = vec3(0.96, 0.68, 0.08);
  vColor = mix(baseColor, blueColor, blueBand * 0.52);
  vColor = mix(vColor, amberColor, amberBand * 0.34);
  vGlow = clamp(focus * 0.82 + abs(wave) * 0.22, 0.0, 1.0);
  vAlpha = 0.34 + blueBand * 0.18 + amberBand * 0.14 + focus * 0.28;
  gl_PointSize = (1.18 + focus * 1.95 + abs(wave) * 0.52) * (5.8 / -modelViewPosition.z);
}
`;

const dotFieldFragmentShader = `
varying float vAlpha;
varying float vGlow;
varying vec3 vColor;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float distanceFromCenter = length(point);
  float dotMask = 1.0 - smoothstep(0.34, 0.5, distanceFromCenter);
  float core = 1.0 - smoothstep(0.0, 0.24, distanceFromCenter);
  vec3 color = vColor + vec3(0.42, 0.46, 0.55) * vGlow * core;
  gl_FragColor = vec4(color, dotMask * vAlpha);
}
`;

function seededUnit(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}

function FinalBulgeText({
  className = "",
  refCallback,
}: {
  className?: string;
  refCallback?: (element: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={refCallback} className={`final-bulge-dom ${className}`.trim()}>
      <div className="final-bulge-dom__type" aria-label="All shot on Fujifilm XH2">
        <span>ALL</span>
        <span>SHOT</span>
        <span>ON</span>
        <span>FUJIFILM XH2</span>
      </div>
    </div>
  );
}

function useDomToCanvas(domElement: HTMLElement | null) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (!domElement) return;

    let cancelled = false;
    let timeout = 0;

    const createFallbackCanvas = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const sourceRect = domElement.getBoundingClientRect();
      const width = Math.max(1, Math.round(sourceRect.width * scale));
      const height = Math.max(1, Math.round(sourceRect.height * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const typeElement = domElement.querySelector<HTMLElement>(".final-bulge-dom__type");
      const lineElements = Array.from(domElement.querySelectorAll<HTMLElement>(".final-bulge-dom__type span"));

      canvas.width = width;
      canvas.height = height;
      if (!context || !typeElement || lineElements.length === 0) return canvas;

      const typeStyles = window.getComputedStyle(typeElement);
      const fontFamily = typeStyles.fontFamily;
      const fontWeight = typeStyles.fontWeight;

      context.scale(scale, scale);
      context.fillStyle = "#fff";
      context.textBaseline = "top";

      lineElements.forEach((lineElement) => {
        const lineStyles = window.getComputedStyle(lineElement);
        const lineRect = lineElement.getBoundingClientRect();
        const x = lineRect.left - sourceRect.left;
        const y = lineRect.top - sourceRect.top;
        const lineFontSize = parseFloat(lineStyles.fontSize);
        const matrix = new DOMMatrixReadOnly(lineStyles.transform === "none" ? undefined : lineStyles.transform);
        const horizontalScale = Number.isFinite(matrix.a) ? matrix.a : 1;

        context.save();
        context.shadowColor = "rgba(255,255,255,0.28)";
        context.shadowBlur = 8;
        context.font = `${fontWeight} ${lineFontSize}px ${fontFamily}`;
        context.translate(x, y);
        context.scale(horizontalScale, 1);
        context.fillText(lineElement.textContent ?? "", 0, 0);
        context.restore();
      });

      return canvas;
    };

    const convertDomToCanvas = async () => {
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(resolve));

      let canvas: HTMLCanvasElement;

      try {
        canvas = await html2canvas(domElement, {
          backgroundColor: null,
          scale: Math.min(window.devicePixelRatio || 1, 2),
          logging: false,
          ignoreElements: (element) =>
            element instanceof HTMLCanvasElement ||
            element.classList.contains("final-bulge-canvas") ||
            element.classList.contains("nextjs-toast"),
          onclone: (documentClone) => {
            const clonedSource = documentClone.querySelector<HTMLElement>(".final-bulge-dom--source");
            if (clonedSource) clonedSource.style.opacity = "1";
          },
        });
      } catch {
        canvas = createFallbackCanvas();
      }

      if (cancelled) return;

      const nextTexture = new THREE.CanvasTexture(canvas);
      nextTexture.colorSpace = THREE.SRGBColorSpace;
      nextTexture.generateMipmaps = false;
      nextTexture.minFilter = THREE.LinearFilter;
      nextTexture.magFilter = THREE.LinearFilter;
      nextTexture.needsUpdate = true;
      setTexture((previousTexture) => {
        previousTexture?.dispose();
        return nextTexture;
      });
    };

    const debouncedResize = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        void convertDomToCanvas();
      }, 100);
    };

    void convertDomToCanvas();
    window.addEventListener("resize", debouncedResize);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domElement]);

  return texture;
}

function FloatingDotField() {
  const { viewport } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const mouseLerped = useRef(new THREE.Vector2(0, 0));

  const dotGeometry = useMemo(() => {
    const columns = viewport.width > viewport.height ? 240 : 112;
    const rows = viewport.width > viewport.height ? 136 : 156;
    const count = columns * rows;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const gridUvs = new Float32Array(count * 2);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const index = y * columns + x;
        const u = x / (columns - 1);
        const v = y / (rows - 1);
        const jitterX = (seededUnit(index + 17) - 0.5) * 0.006;
        const jitterY = (seededUnit(index + 71) - 0.5) * 0.006;
        const offset = index * 3;
        const uvOffset = index * 2;

        positions[offset] = (u - 0.5 + jitterX) * viewport.width * 1.56;
        positions[offset + 1] = (v - 0.5 + jitterY) * viewport.height * 1.46;
        positions[offset + 2] = -1.4;
        seeds[index] = seededUnit(index + 131);
        gridUvs[uvOffset] = u;
        gridUvs[uvOffset + 1] = v;
      }
    }

    return { positions, seeds, gridUvs };
  }, [viewport.height, viewport.width]);

  const uniforms = useMemo<DotFieldUniforms>(
    () => ({
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uViewport: { value: new THREE.Vector2(viewport.width, viewport.height) },
    }),
    [viewport.height, viewport.width],
  );

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uViewport.value.set(viewport.width, viewport.height);
  }, [viewport.height, viewport.width]);

  useFrame((state) => {
    if (!materialRef.current) return;

    const idleX = Math.sin(state.clock.elapsedTime * 0.2) * 0.62;
    const idleY = Math.cos(state.clock.elapsedTime * 0.17) * 0.48;
    const targetX = state.pointer.x || idleX;
    const targetY = state.pointer.y || idleY;

    mouseLerped.current.x = THREE.MathUtils.lerp(mouseLerped.current.x, targetX, 0.055);
    mouseLerped.current.y = THREE.MathUtils.lerp(mouseLerped.current.y, targetY, 0.055);
    materialRef.current.uniforms.uMouse.value.copy(mouseLerped.current);
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[dotGeometry.positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[dotGeometry.seeds, 1]} />
        <bufferAttribute attach="attributes-aGridUv" args={[dotGeometry.gridUvs, 2]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={dotFieldVertexShader}
        fragmentShader={dotFieldFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function FloatingDustField() {
  const { viewport } = useThree();
  const pointsRef = useRef<THREE.Points | null>(null);

  const positions = useMemo(() => {
    const count = 180;
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      values[offset] = (seededUnit(index + 1) - 0.5) * viewport.width * 1.18;
      values[offset + 1] = (seededUnit(index + 409) - 0.5) * viewport.height * 1.12;
      values[offset + 2] = -0.9 - seededUnit(index + 811) * 1.9;
    }

    return values;
  }, [viewport.height, viewport.width]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.06) * 0.015;
    pointsRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.05;
    pointsRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.1) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f5f6ff"
        size={0.014}
        sizeAttenuation
        transparent
        opacity={0.24}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function BulgeTextScene({ texture }: { texture: THREE.CanvasTexture | null }) {
  const { viewport } = useThree();
  const materialRef = useRef<CustomShaderMaterialImpl<typeof THREE.MeshStandardMaterial> | null>(null);
  const mouseLerped = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo<ShaderUniforms>(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
    }),
    [texture],
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTexture.value = texture;
    }
  }, [texture]);

  useFrame((state) => {
    if (!materialRef.current) return;

    const idleX = Math.sin(state.clock.elapsedTime * 0.28) * 0.18;
    const idleY = Math.cos(state.clock.elapsedTime * 0.24) * 0.14;
    const targetX = state.pointer.x || idleX;
    const targetY = state.pointer.y || idleY;

    mouseLerped.current.x = THREE.MathUtils.lerp(mouseLerped.current.x, targetX, 0.1);
    mouseLerped.current.y = THREE.MathUtils.lerp(mouseLerped.current.y, targetY, 0.1);
    materialRef.current.uniforms.uMouse.value.copy(mouseLerped.current);
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <>
      <ambientLight intensity={1.8} />
      <FloatingDotField />
      <FloatingDustField />
      <mesh visible={Boolean(texture)}>
        <planeGeometry args={[viewport.width, viewport.height, 254, 254]} />
        <CustomShaderMaterial
          ref={materialRef}
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          flatShading
          transparent
          depthWrite={false}
          toneMapped={false}
          silent
        />
      </mesh>
      <pointLight position={[-2.8, -1.6, 3.2]} intensity={18} distance={8} decay={1.6} color="#ffffff" />
      <pointLight position={[2.6, 1.8, 3.8]} intensity={8} distance={7} decay={1.8} color="#dce8ff" />
    </>
  );
}

export function BulgeTextEffect() {
  const [sourceElement, setSourceElement] = useState<HTMLDivElement | null>(null);
  const texture = useDomToCanvas(sourceElement);

  return (
    <>
      <FinalBulgeText className="final-bulge-dom--source" refCallback={setSourceElement} />
      {texture ? (
        <div className="final-bulge-canvas" aria-hidden="true">
          <Canvas
            dpr={[1, 2]}
            gl={{
              antialias: true,
              preserveDrawingBuffer: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            camera={{
              fov: 55,
              near: 0.1,
              far: 200,
            }}
          >
            <BulgeTextScene texture={texture} />
          </Canvas>
        </div>
      ) : null}
    </>
  );
}
