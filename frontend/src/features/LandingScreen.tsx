/** Landing screen component for SCOTOMA. */

import React from 'react';
import { ScenarioChips, DemoScenario } from '../components/ScenarioChips';
import { useScotomaStore } from '../store/useScotomaStore';

interface LandingScreenProps {
  onStartWithScenario: (scenario?: DemoScenario) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStartWithScenario }) => {
  const { setScreen } = useScotomaStore();

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '3rem auto',
        padding: '0 1rem',
        textAlign: 'center',
      }}
    >
      <div className="brutalist-card" style={{ padding: '3rem 2rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3rem',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}
        >
          SCOTOMA
        </h1>
        <p
          className="mono-font"
          style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            color: 'var(--oxide)',
          }}
        >
          The Neuro-Symbolic Visual Field Analyzer for Critical Decisions.
        </p>
        <p
          style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            textAlign: 'left',
            lineHeight: 1.6,
          }}
        >
          SCOTOMA never recommends an option or decides for you. Instead, it translates your reasoning
          into a formal logic graph, proves logical contradictions with a Z3 theorem prover, tests load-bearing
          assumptions, and reveals silent decision lenses you forgot to consider.
        </p>

        <ScenarioChips onSelect={(sc) => onStartWithScenario(sc)} />

        <button
          className="brutalist-btn"
          style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
          onClick={() => {
            onStartWithScenario(undefined);
            setScreen('describe');
          }}
        >
          Begin Decision Analysis ➔
        </button>
      </div>
    </div>
  );
};
