/** Top navigation bar for SCOTOMA. */

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
        padding: '1rem 2rem',
        borderBottom: '2px solid var(--ink)',
        backgroundColor: 'var(--bone)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1
          onClick={reset}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            cursor: 'pointer',
            letterSpacing: '-0.5px',
          }}
        >
          SCOTOMA
        </h1>
        <span
          className="mono-font badge"
          style={{ backgroundColor: 'var(--plum-night)', color: 'var(--uv-lime)' }}
        >
          Visual Field Analyzer
        </span>
      </div>

      {latestAnalysis && currentScreen !== 'landing' && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="mono-font" style={{ fontSize: '0.85rem' }}>
            Analysis Version: <strong>v{latestAnalysis.version}</strong>
          </span>
          <button className="brutalist-btn" onClick={() => setScreen('summary')}>
            Summary View
          </button>
        </div>
      )}
    </header>
  );
};
