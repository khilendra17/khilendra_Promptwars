/** Component rendering assumption fragility bar and score details. */

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
      style={{
        border: '2px solid var(--ink)',
        padding: '0.75rem',
        marginBottom: '0.75rem',
        backgroundColor: fragility.flips_leader ? '#FFF4F0' : '#F5F5F5',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span className="mono-font" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          {fragility.flips_leader ? '⚠️ LOAD-BEARING ASSUMPTION' : 'ASSUMPTION STABILITY'}
        </span>
        <span className="mono-font" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          {percentage}% Fragility
        </span>
      </div>

      {assumptionText && (
        <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
          "{assumptionText}"
        </p>
      )}

      {fragility.flips_leader && (
        <p className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--vermilion)' }}>
          Flipping this assumption changes leader: <strong>{fragility.leader_before}</strong> ➔{' '}
          <strong>{fragility.leader_after}</strong>
        </p>
      )}

      <div
        style={{
          height: '10px',
          width: '100%',
          backgroundColor: 'var(--fog)',
          border: '1px solid var(--ink)',
          marginTop: '0.5rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: fragility.flips_leader ? 'var(--vermilion)' : 'var(--verdigris)',
          }}
        />
      </div>
    </div>
  );
};
