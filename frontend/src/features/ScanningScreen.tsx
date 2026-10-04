/** Scanning screen component displaying live pipeline execution status. */

import React, { useEffect, useState } from 'react';
import { VisionField } from '../components/VisionField';

const STEPS = [
  '1. Extracting claims and relations via Gemini...',
  '2. Mapping claim coverage across 12 decision lenses...',
  '3. Proving logical contradictions with Z3 theorem prover...',
  '4. Stress-testing load-bearing assumptions (fragility analysis)...',
  '5. Generating non-leading questions and running guardrail verification...',
];

export const ScanningScreen: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        gap: '2rem',
        padding: '1rem',
      }}
    >
      <VisionField />

      <div className="brutalist-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h3 className="mono-font" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          ⚡ SCANNING DECISION FIELD
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={idx}
                className="mono-font"
                style={{
                  fontSize: '0.85rem',
                  color: isCurrent
                    ? 'var(--vermilion)'
                    : isDone
                    ? 'var(--verdigris)'
                    : 'var(--oxide)',
                  fontWeight: isCurrent ? 700 : 400,
                }}
              >
                {isDone ? '✓ ' : isCurrent ? '➔ ' : '  '}
                {step}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
