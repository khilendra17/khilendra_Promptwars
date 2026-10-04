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
    float grid = abs(sin(dist * 30.0 - uTime * 0.5)) * 0.15;
    vec3 color = mix(vec3(0.16, 0.10, 0.18), vec3(0.09, 0.06, 0.10), dist * 2.0);
    color += vec3(grid * 0.4, grid * 0.2, grid * 0.5);
    gl_FragColor = vec4(color, 1.0);
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

    try {
      const renderer = new Renderer({ width: 340, height: 340, alpha: true });
      const gl = renderer.gl;
      containerRef.current.appendChild(gl.canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: { uTime: { value: 0 } },
      });
      const mesh = new Mesh(gl, { geometry, program });

      let animationId: number;
      const renderLoop = (t: number) => {
        program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene: mesh });
        animationId = requestAnimationFrame(renderLoop);
      };
      animationId = requestAnimationFrame(renderLoop);

      return () => {
        cancelAnimationFrame(animationId);
        if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      };
    } catch {
      setWebglSupported(false);
    }
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '340px',
        height: '340px',
        backgroundColor: 'var(--plum-night)',
        border: '3px solid var(--ink)',
        boxShadow: '4px 4px 0px var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!webglSupported && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, #2A1B2E 0%, #17140F 100%)',
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
              border: '2px solid var(--ink)',
              backgroundColor: isCovered ? 'var(--uv-lime)' : 'var(--vermilion)',
              boxShadow: isHovered
                ? '0 0 10px 4px var(--uv-lime)'
                : isCovered
                ? '0 0 6px var(--uv-lime)'
                : '0 0 4px var(--vermilion)',
              cursor: 'pointer',
              zIndex: 10,
            }}
          />
        );
      })}
    </div>
  );
};
