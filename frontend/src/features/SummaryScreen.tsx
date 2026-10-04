/** Printable summary screen for SCOTOMA session analysis. */

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
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button className="brutalist-btn" onClick={() => setScreen('result')}>
          ← Back to X-Ray
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="brutalist-btn" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
          <button className="brutalist-btn" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy as Text'}
          </button>
        </div>
      </div>

      <div className="brutalist-card" style={{ backgroundColor: '#FFF' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{session.decision_title}</h1>
        <p className="mono-font" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--oxide)' }}>
          Options Considered: {session.options.join(' | ')}
        </p>

        <div
          style={{
            borderTop: '2px solid var(--ink)',
            borderBottom: '2px solid var(--ink)',
            padding: '1rem 0',
            margin: '1.5rem 0',
          }}
        >
          <h3 className="mono-font">EXECUTIVE BLIND-SPOT SUMMARY</h3>
          <p className="mono-font" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>
            Attention-Gap Score: {Math.round(latestAnalysis.attention_gap * 100)}%
          </p>
          <p style={{ fontSize: '0.95rem' }}>
            Extracted {latestAnalysis.claims.length} claims across 12 decision lenses. Identified{' '}
            {latestAnalysis.blind_spots.length} critical blind spots.
          </p>
        </div>

        <h3 className="mono-font" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          IDENTIFIED BLIND SPOTS
        </h3>
        {latestAnalysis.blind_spots.map((b) => (
          <div key={b.id} style={{ marginBottom: '1rem', borderLeft: '3px solid var(--ink)', paddingLeft: '0.75rem' }}>
            <span className={`badge badge-${b.type}`}>{b.type}</span>
            <strong className="mono-font" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
              Lens: {b.lens.replace('_', ' ').toUpperCase()}
            </strong>
            <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{b.why_it_matters}</p>
          </div>
        ))}

        <div
          style={{
            marginTop: '3rem',
            paddingTop: '1rem',
            borderTop: '2px dashed var(--fog)',
            textAlign: 'center',
          }}
        >
          <p className="mono-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--vermilion)' }}>
            This tool does not decide for you.
          </p>
        </div>
      </div>
    </div>
  );
};
