/** Electric Purple Glass Navbar Component. */

import React from 'react';
import { useScotomaStore } from '../store/useScotomaStore';

export const Navbar: React.FC = () => {
  const { currentScreen, latestAnalysis, reset, setScreen } = useScotomaStore();

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid var(--border-purple-glow)',
        backgroundColor: 'rgba(8, 6, 16, 0.9)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <h1
          onClick={reset}
          className="heading-font"
          style={{
            fontWeight: 800,
            fontSize: '1.9rem',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #B026FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          SCOTOMA
        </h1>
        <span
          className="badge-purple"
          style={{
            background: 'rgba(176, 38, 255, 0.15)',
            color: 'var(--bright-lavender)',
            border: '1px solid var(--border-purple-bright)',
            boxShadow: '0 0 15px rgba(176, 38, 255, 0.2)',
          }}
        >
          Z3 NEURO-SYMBOLIC CORE
        </span>
      </div>

      {latestAnalysis && currentScreen !== 'landing' && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="mono-font" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Analysis: <strong style={{ color: 'var(--bright-lavender)' }}>v{latestAnalysis.version}</strong>
          </span>
          <button className="btn-ghost-purple" onClick={() => setScreen('summary')}>
            Executive Report ➔
          </button>
        </div>
      )}
    </header>
  );
};
