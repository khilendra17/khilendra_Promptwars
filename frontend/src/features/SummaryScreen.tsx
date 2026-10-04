/** Glassmorphic Summary Screen. */

import React, { useState } from 'react';
import { useScotomaStore } from '../store/useScotomaStore';

export const SummaryScreen: React.FC = () => {
  const { session, latestAnalysis, setScreen } = useScotomaStore();
  const [copied, setCopied] = useState(false);

  if (!session || !latestAnalysis) {
    return null;
  }

  const handleCopy = () => {
    const text = `SCOTOMA Analysis Report
Title: ${session.decision_title}
Options: ${session.options.join(', ')}
Attention-Gap Score: ${Math.round(latestAnalysis.attention_gap * 100)}%

Blind Spots:
${latestAnalysis.blind_spots.map((b) => `- [${b.type.toUpperCase()}] Lens: ${b.lens} - ${b.why_it_matters}`).join('\n')}

This tool does not decide for you.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button className="btn-outline" onClick={() => setScreen('result')}>
          ← Back to X-Ray
        </button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
          <button className="btn-glow" style={{ padding: '0.6rem 1.25rem' }} onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy Text'}
          </button>
        </div>
      </div>

      <div className="glass-card">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFF' }}>
          {session.decision_title}
        </h1>
        <p className="mono-font" style={{ fontSize: '0.9rem', marginBottom: '1.75rem', color: 'var(--cyan-glow)' }}>
          Options Considered: {session.options.join('  |  ')}
        </p>

        <div
          style={{
            borderTop: '1px solid var(--border-glass)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '1.25rem 0',
            margin: '1.75rem 0',
          }}
        >
          <h3 className="mono-font" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            EXECUTIVE SUMMARY
          </h3>
          <p className="mono-font" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--vermilion-neon)' }}>
            Attention-Gap Score: {Math.round(latestAnalysis.attention_gap * 100)}%
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Extracted {latestAnalysis.claims.length} claims across 12 decision lenses. Identified{' '}
            {latestAnalysis.blind_spots.length} critical blind spots.
          </p>
        </div>

        <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--cyan-glow)', marginBottom: '1rem' }}>
          IDENTIFIED BLIND SPOTS
        </h3>
        {latestAnalysis.blind_spots.map((b) => (
          <div key={b.id} style={{ marginBottom: '1.25rem', borderLeft: '3px solid var(--cyan-glow)', paddingLeft: '1rem' }}>
            <span className={`badge-glow badge-${b.type}`}>{b.type}</span>
            <strong className="mono-font" style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              LENS: {b.lens.replace('_', ' ').toUpperCase()}
            </strong>
            <p style={{ fontSize: '0.95rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>{b.why_it_matters}</p>
          </div>
        ))}

        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px dashed var(--border-glass)',
            textAlign: 'center',
          }}
        >
          <p className="mono-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>
            This tool does not decide for you.
          </p>
        </div>
      </div>
    </div>
  );
};
