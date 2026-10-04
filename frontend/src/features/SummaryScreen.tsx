/** Glassmorphic Purple Summary Screen. */

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
    <div style={{ maxWidth: '880px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button className="btn-ghost-purple" onClick={() => setScreen('result')}>
          ← Back to X-Ray
        </button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost-purple" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
          <button className="btn-electric" style={{ padding: '0.65rem 1.35rem' }} onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy Text'}
          </button>
        </div>
      </div>

      <div className="glass-card-purple">
        <h1 className="heading-font" style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--white)' }}>
          {session.decision_title}
        </h1>
        <p className="mono-font" style={{ fontSize: '0.9rem', marginBottom: '1.75rem', color: 'var(--bright-lavender)' }}>
          Options Considered: {session.options.join('  |  ')}
        </p>

        <div
          style={{
            borderTop: '1px solid var(--border-purple-glow)',
            borderBottom: '1px solid var(--border-purple-glow)',
            padding: '1.35rem 0',
            margin: '1.75rem 0',
          }}
        >
          <h3 className="mono-font" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            EXECUTIVE BLIND-SPOT REPORT
          </h3>
          <p className="mono-font" style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--neon-violet)' }}>
            Attention-Gap Score: {Math.round(latestAnalysis.attention_gap * 100)}%
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--white)' }}>
            Extracted {latestAnalysis.claims.length} claims across 12 decision lenses. Identified{' '}
            {latestAnalysis.blind_spots.length} critical blind spots with Z3 formal logic proofs.
          </p>
        </div>

        <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--bright-lavender)', marginBottom: '1rem' }}>
          IDENTIFIED BLIND SPOTS
        </h3>
        {latestAnalysis.blind_spots.map((b) => (
          <div key={b.id} style={{ marginBottom: '1.25rem', borderLeft: '3px solid var(--neon-violet)', paddingLeft: '1rem' }}>
            <span className={`badge-purple badge-${b.type}`}>{b.type}</span>
            <strong className="mono-font" style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--white)' }}>
              LENS: {b.lens.replace('_', ' ').toUpperCase()}
            </strong>
            <p style={{ fontSize: '0.95rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>{b.why_it_matters}</p>
          </div>
        ))}

        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px dashed var(--border-purple-glow)',
            textAlign: 'center',
          }}
        >
          <p className="mono-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--bright-lavender)' }}>
            This tool does not decide for you.
          </p>
        </div>
      </div>
    </div>
  );
};
