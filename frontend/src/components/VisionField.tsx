/** Vision Field component rendering GLSL perimetry shader with fallback. */

import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useScotomaStore } from '../store/useScotomaStore';
import { LensId } from '../types';

const LENSES: LensId[] = [
  'money', 'time', 'health_energy', 'reversibility',
  'relationships', 'opportunity_cost', 'identity_values', 'learning_growth',
  'risk_downside', 'dependency_control', 'ethics_fairness', 'future_regret'
];

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 st = vUv - 0.5;
    float dist = length(st);
    float grid = abs(sin(dist * 25.0 - uTime * 0.6)) * 0.2;
    vec3 baseColor = mix(vec3(0.04, 0.06, 0.12), vec3(0.01, 0.02, 0.05), dist * 2.0);
    vec3 glowColor = vec3(0.0, 0.94, 1.0) * grid * 0.5;
    gl_FragColor = vec4(baseColor + glowColor, 1.0);
  }
`;

export const VisionField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const { latestAnalysis, setHoveredLens, hoveredLens } = useScotomaStore();
  const coverage = latestAnalysis?.coverage || {};

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !containerRef.current) {
      setWebglSupported(false);
      return;
    }

    let animationId: number = 0;
    let glCanvas: HTMLCanvasElement | null = null;

    try {
      const renderer = new Renderer({ width: 340, height: 340, alpha: true });
      const gl = renderer.gl;
      glCanvas = gl.canvas;
      containerRef.current.appendChild(glCanvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: { uTime: { value: 0 } },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const renderLoop = (t: number) => {
        program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene: mesh });
        animationId = requestAnimationFrame(renderLoop);
      };
      animationId = requestAnimationFrame(renderLoop);
    } catch {
      setWebglSupported(false);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (glCanvas && glCanvas.parentNode) glCanvas.parentNode.removeChild(glCanvas);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070A12',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!webglSupported && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, #0B1120 0%, #030509 100%)',
          }}
        />
      )}

      {/* 12 Perimetry Lens Dots */}
      {LENSES.map((lens, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const radius = 120;
        const x = 170 + radius * Math.cos(angle) - 12;
        const y = 170 + radius * Math.sin(angle) - 12;
        const isCovered = (coverage[lens] || 0) > 0;
        const isHovered = hoveredLens === lens;

        return (
          <button
            key={lens}
            onMouseEnter={() => setHoveredLens(lens)}
            onMouseLeave={() => setHoveredLens(null)}
            title={`${lens.replace('_', ' ')} (${coverage[lens] || 0} claims)`}
            aria-label={`Lens ${lens.replace('_', ' ')}`}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: isCovered ? 'var(--cyan-glow)' : 'var(--vermilion-neon)',
              boxShadow: isHovered
                ? '0 0 16px 6px var(--cyan-glow)'
                : isCovered
                ? '0 0 10px var(--cyan-glow)'
                : '0 0 10px var(--vermilion-neon)',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
          />
        );
      })}
    </div>
  );
};
