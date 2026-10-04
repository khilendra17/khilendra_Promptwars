/** Glassmorphic fragility bar component. */

import React from 'react';
import { Fragility } from '../types';

interface FragilityBarProps {
  fragility: Fragility;
  assumptionText?: string;
}

export const FragilityBar: React.FC<FragilityBarProps> = ({ fragility, assumptionText }) => {
  const percentage = Math.round(fragility.score * 100);

  return (
    <div
      className="glass-card"
      style={{
        padding: '1rem',
        marginBottom: '0.85rem',
        borderColor: fragility.flips_leader ? 'rgba(255, 51, 102, 0.4)' : 'var(--border-glass)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span className="mono-font" style={{ fontSize: '0.8rem', fontWeight: 700, color: fragility.flips_leader ? 'var(--vermilion-neon)' : 'var(--emerald-safe)' }}>
          {fragility.flips_leader ? '⚠️ LOAD-BEARING ASSUMPTION' : 'STABLE ASSUMPTION'}
        </span>
        <span className="mono-font" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>
          {percentage}% Fragility
        </span>
      </div>

      {assumptionText && (
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          "{assumptionText}"
        </p>
      )}

      {fragility.flips_leader && (
        <p className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--vermilion-neon)' }}>
          Flipping changes leader: <strong>{fragility.leader_before}</strong> ➔ <strong>{fragility.leader_after}</strong>
        </p>
      )}

      <div
        style={{
          height: '8px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: '0.6rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: fragility.flips_leader
              ? 'linear-gradient(90deg, #FF3366, #FF6B00)'
              : 'linear-gradient(90deg, #10B981, #00F0FF)',
            boxShadow: fragility.flips_leader ? '0 0 10px var(--vermilion-neon)' : '0 0 10px var(--cyan-glow)',
          }}
        />
      </div>
    </div>
  );
};
