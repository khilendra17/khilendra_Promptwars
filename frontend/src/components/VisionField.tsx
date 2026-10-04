/** Vision Field component rendering GLSL perimetry shader with electric purple theme. */

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
    float grid = abs(sin(dist * 30.0 - uTime * 0.8)) * 0.25;
    vec3 baseColor = mix(vec3(0.05, 0.03, 0.10), vec3(0.02, 0.01, 0.04), dist * 2.0);
    vec3 glowColor = vec3(0.69, 0.15, 1.0) * grid * 0.7;
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
        border: '1px solid var(--border-purple-bright)',
        boxShadow: '0 0 50px rgba(176, 38, 255, 0.3), inset 0 0 30px rgba(139, 0, 255, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06040A',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!webglSupported && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, #0D0B1A 0%, #050308 100%)',
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
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backgroundColor: isCovered ? 'var(--neon-violet)' : '#FF3366',
              boxShadow: isHovered
                ? '0 0 20px 8px var(--bright-lavender)'
                : isCovered
                ? '0 0 12px var(--neon-violet)'
                : '0 0 12px #FF3366',
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
