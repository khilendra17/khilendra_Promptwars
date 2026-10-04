/** Glassmorphic X-ray Result Screen dashboard. */

import React from 'react';
import { BlindSpotCard } from '../components/BlindSpotCard';
import { FragilityBar } from '../components/FragilityBar';
import { VisionField } from '../components/VisionField';
import { XrayText } from '../components/XrayText';
import { useScotomaStore } from '../store/useScotomaStore';

export const XrayResultScreen: React.FC = () => {
  const { session, latestAnalysis, setScreen } = useScotomaStore();

  if (!session || !latestAnalysis) {
    return (
      <div style={{ textAlign: 'center', margin: '4rem auto' }}>
        <p>No analysis data found.</p>
        <button className="btn-glow" onClick={() => setScreen('landing')}>
          Return to Start
        </button>
      </div>
    );
  }

  const gapPercentage = Math.round(latestAnalysis.attention_gap * 100);

  return (
    <div style={{ maxWidth: '1320px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>{session.decision_title}</h2>
          <p className="mono-font" style={{ fontSize: '0.9rem', color: 'var(--cyan-glow)', marginTop: '0.25rem' }}>
            Options: {session.options.join('  |  ')}
          </p>
        </div>
        <button className="btn-glow" onClick={() => setScreen('summary')}>
          View Executive Summary ➔
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: X-ray Reasoning */}
        <div className="glass-card">
          <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--cyan-glow)', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.6rem' }}>
            📄 REASONING X-RAY
          </h3>
          <XrayText reasoning={session.reasoning} />
        </div>

        {/* Center Column: Vision Field & Attention-Gap */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
          <VisionField />

          <div className="glass-card" style={{ width: '100%', textAlign: 'center' }}>
            <h4 className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ATTENTION-GAP SCORE</h4>
            <div className="mono-font" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--vermilion-neon)' }}>
              {gapPercentage}%
            </div>
            <p className="mono-font" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Share of unconsidered decision lenses
            </p>
          </div>
        </div>

        {/* Right Column: Blind Spots & Fragility */}
        <div>
          <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--cyan-glow)', marginBottom: '1rem' }}>
            🔍 PROVEN BLIND SPOTS ({latestAnalysis.blind_spots.length})
          </h3>

          {latestAnalysis.blind_spots.map((spot) => (
            <BlindSpotCard key={spot.id} spot={spot} />
          ))}

          {latestAnalysis.fragility.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--cyan-glow)', marginBottom: '1rem' }}>
                ⚖️ ASSUMPTION FRAGILITY ANALYSIS
              </h3>
              {latestAnalysis.fragility.map((frag) => {
                const claim = latestAnalysis.claims.find((c) => c.id === frag.assumption_id);
                return <FragilityBar key={frag.assumption_id} fragility={frag} assumptionText={claim?.quote} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
