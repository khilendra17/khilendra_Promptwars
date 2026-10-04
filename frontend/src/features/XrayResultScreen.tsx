/** X-ray Result screen displaying 3-column analysis dashboard. */

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
        <button className="brutalist-btn" onClick={() => setScreen('landing')}>
          Return to Start
        </button>
      </div>
    );
  }

  const gapPercentage = Math.round(latestAnalysis.attention_gap * 100);

  return (
    <div style={{ maxWidth: '1280px', margin: '1.5rem auto', padding: '0 1rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>{session.decision_title}</h2>
          <p className="mono-font" style={{ fontSize: '0.9rem', color: 'var(--oxide)' }}>
            Options: {session.options.join(' | ')}
          </p>
        </div>
        <button className="brutalist-btn" onClick={() => setScreen('summary')}>
          View Full Summary ➔
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: X-ray Reasoning */}
        <div className="brutalist-card">
          <h3 className="mono-font" style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '2px solid var(--ink)', paddingBottom: '0.5rem' }}>
            📄 REASONING X-RAY
          </h3>
          <XrayText reasoning={session.reasoning} />
        </div>

        {/* Center Column: Vision Field & Attention-Gap */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <VisionField />

          <div className="brutalist-card" style={{ width: '100%', textAlign: 'center' }}>
            <h4 className="mono-font" style={{ fontSize: '0.85rem' }}>ATTENTION-GAP SCORE</h4>
            <div className="mono-font" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--vermilion)' }}>
              {gapPercentage}%
            </div>
            <p className="mono-font" style={{ fontSize: '0.75rem', color: 'var(--oxide)' }}>
              Share of unconsidered decision lenses
            </p>
          </div>
        </div>

        {/* Right Column: Blind Spots & Fragility */}
        <div>
          <h3 className="mono-font" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            🔍 BLIND SPOTS ({latestAnalysis.blind_spots.length})
          </h3>

          {latestAnalysis.blind_spots.map((spot) => (
            <BlindSpotCard key={spot.id} spot={spot} />
          ))}

          {latestAnalysis.fragility.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 className="mono-font" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                ⚖️ ASSUMPTION FRAGILITY
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
