/** Glassmorphic navbar component for SCOTOMA. */

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
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: 'rgba(10, 14, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <h1
          onClick={reset}
          style={{
            fontFamily: 'var(--font-main)',
            fontWeight: 800,
            fontSize: '1.8rem',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          SCOTOMA
        </h1>
        <span
          className="badge-glow"
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            color: 'var(--cyan-glow)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          NEURO-SYMBOLIC VISION FIELD
        </span>
      </div>

      {latestAnalysis && currentScreen !== 'landing' && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="mono-font" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Analysis: <strong style={{ color: 'var(--cyan-glow)' }}>v{latestAnalysis.version}</strong>
          </span>
          <button className="btn-outline" onClick={() => setScreen('summary')}>
            Executive Summary
          </button>
        </div>
      )}
    </header>
  );
};
