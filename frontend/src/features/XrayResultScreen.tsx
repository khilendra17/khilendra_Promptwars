/** Glassmorphic Purple X-ray Result Screen dashboard. */

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
        <button className="btn-electric" onClick={() => setScreen('landing')}>
          Return to Start
        </button>
      </div>
    );
  }

  const gapPercentage = Math.round(latestAnalysis.attention_gap * 100);

  return (
    <div style={{ maxWidth: '1360px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="heading-font" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--white)' }}>
            {session.decision_title}
          </h2>
          <p className="mono-font" style={{ fontSize: '0.9rem', color: 'var(--bright-lavender)', marginTop: '0.25rem' }}>
            Options: {session.options.join('  |  ')}
          </p>
        </div>
        <button className="btn-electric" onClick={() => setScreen('summary')}>
          Executive Summary Report ➔
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: X-ray Reasoning */}
        <div className="glass-card-purple">
          <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--bright-lavender)', marginBottom: '1rem', borderBottom: '1px solid var(--border-purple-glow)', paddingBottom: '0.6rem' }}>
            📄 REASONING X-RAY INSPECTOR
          </h3>
          <XrayText reasoning={session.reasoning} />
        </div>

        {/* Center Column: Vision Field & Attention-Gap */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
          <VisionField />

          <div className="glass-card-purple" style={{ width: '100%', textAlign: 'center' }}>
            <h4 className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ATTENTION-GAP SCORE</h4>
            <div className="mono-font" style={{ fontSize: '3.75rem', fontWeight: 800, color: 'var(--neon-violet)' }}>
              {gapPercentage}%
            </div>
            <p className="mono-font" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Unconsidered decision lenses share
            </p>
          </div>
        </div>

        {/* Right Column: Blind Spots & Fragility */}
        <div>
          <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--bright-lavender)', marginBottom: '1rem' }}>
            🔍 PROVEN BLIND SPOTS ({latestAnalysis.blind_spots.length})
          </h3>

          {latestAnalysis.blind_spots.map((spot) => (
            <BlindSpotCard key={spot.id} spot={spot} />
          ))}

          {latestAnalysis.fragility.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 className="mono-font" style={{ fontSize: '0.95rem', color: 'var(--bright-lavender)', marginBottom: '1rem' }}>
                ⚖️ Z3 ASSUMPTION FRAGILITY
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
