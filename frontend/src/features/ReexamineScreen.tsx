/** Reexamine screen component for reviewing timeline version history. */

import React from 'react';
import { useScotomaStore } from '../store/useScotomaStore';

export const ReexamineScreen: React.FC = () => {
  const { analyses, setScreen } = useScotomaStore();

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="brutalist-card">
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Analysis Timeline</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {analyses.map((a) => (
            <div
              key={a.id}
              style={{
                borderLeft: '4px solid var(--uv-lime)',
                paddingLeft: '1rem',
                backgroundColor: '#FFF',
                padding: '0.75rem',
              }}
            >
              <h4 className="mono-font">Version {a.version}</h4>
              <p className="mono-font" style={{ fontSize: '0.85rem' }}>
                Attention-Gap: {Math.round(a.attention_gap * 100)}% | Blind Spots: {a.blind_spots.length}
              </p>
            </div>
          ))}
        </div>
        <button className="brutalist-btn" onClick={() => setScreen('result')}>
          Return to X-Ray
        </button>
      </div>
    </div>
  );
};
