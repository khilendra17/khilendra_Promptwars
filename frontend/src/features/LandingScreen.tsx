/** Glassmorphic Landing Screen for SCOTOMA. */

import React from 'react';
import { ScenarioChips, DemoScenario } from '../components/ScenarioChips';
import { useScotomaStore } from '../store/useScotomaStore';

interface LandingScreenProps {
  onStartWithScenario: (scenario?: DemoScenario) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStartWithScenario }) => {
  const { setScreen } = useScotomaStore();

  return (
    <div style={{ maxWidth: '900px', margin: '3.5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '3.5rem 2.5rem' }}>
        <span
          className="badge-glow"
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            color: 'var(--purple-z3)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            marginBottom: '1.25rem',
          }}
        >
          FORMAL REASONING & Z3 PROVER
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: '3.75rem',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #00F0FF 50%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
          }}
        >
          SCOTOMA
        </h1>

        <p
          className="mono-font"
          style={{
            fontSize: '1.15rem',
            color: 'var(--cyan-glow)',
            marginBottom: '1.75rem',
            fontWeight: 600,
          }}
        >
          See the unstated blind spots in your strategic decisions.
        </p>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.7,
          }}
        >
          SCOTOMA never tells you what to choose. Instead, it extracts your stated claims, proves logical
          contradictions with the <strong>Z3 SMT Theorem Prover</strong>, stress-tests load-bearing assumptions, and maps silent lenses you ignored.
        </p>

        <ScenarioChips onSelect={(sc) => onStartWithScenario(sc)} />

        <div style={{ marginTop: '2rem' }}>
          <button
            className="btn-glow"
            style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
            onClick={() => {
              onStartWithScenario(undefined);
              setScreen('describe');
            }}
          >
            Start Visual Field Analysis ➔
          </button>
        </div>
      </div>
    </div>
  );
};
