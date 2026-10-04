/** Electric Purple High-Tech Landing Screen. */

import React from 'react';
import { ScenarioChips, DemoScenario } from '../components/ScenarioChips';
import { useScotomaStore } from '../store/useScotomaStore';

interface LandingScreenProps {
  onStartWithScenario: (scenario?: DemoScenario) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStartWithScenario }) => {
  const { setScreen } = useScotomaStore();

  return (
    <div style={{ maxWidth: '920px', margin: '3.5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div className="glass-card-purple" style={{ padding: '3.75rem 2.5rem' }}>
        <span
          className="badge-purple"
          style={{
            background: 'rgba(139, 0, 255, 0.2)',
            color: 'var(--bright-lavender)',
            border: '1px solid var(--neon-violet)',
            marginBottom: '1.5rem',
            boxShadow: '0 0 15px rgba(176, 38, 255, 0.3)',
          }}
        >
          FORMAL REASONING & Z3 SMT SOLVER
        </span>

        <h1
          className="heading-font"
          style={{
            fontSize: '4rem',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: '1.25rem',
            color: 'var(--white)',
            letterSpacing: '-1px',
          }}
        >
          SCOTOMA
        </h1>

        <p
          className="mono-font"
          style={{
            fontSize: '1.2rem',
            color: 'var(--bright-lavender)',
            marginBottom: '1.75rem',
            fontWeight: 600,
          }}
        >
          Reveal unstated logical blind spots in critical strategic decisions.
        </p>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '700px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.7,
          }}
        >
          SCOTOMA never recommends an option or decides for you. Instead, it parses your stated reasoning,
          proves mathematical contradictions via the <strong>Z3 Theorem Prover</strong>, stress-tests load-bearing assumptions, and maps unconsidered decision lenses.
        </p>

        <ScenarioChips onSelect={(sc) => onStartWithScenario(sc)} />

        <div style={{ marginTop: '2.5rem' }}>
          <button
            className="btn-electric"
            style={{ fontSize: '1.15rem', padding: '1.1rem 2.75rem' }}
            onClick={() => {
              onStartWithScenario(undefined);
              setScreen('describe');
            }}
          >
            Launch Visual Field Workspace ➔
          </button>
        </div>
      </div>
    </div>
  );
};
