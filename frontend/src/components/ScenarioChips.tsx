/** Built-in demo scenario selector chips. */

import React from 'react';

export interface DemoScenario {
  id: string;
  title: string;
  options: string[];
  reasoning: string;
  context: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'internship',
    title: 'High-Stipend Internship vs Software Developer Job',
    options: ['Local Internship', 'Remote Software Developer'],
    reasoning:
      'I am leaning heavily towards the local internship because the stipend is very high and it is near my home so I save on commute time and rent. However, the tech stack is outdated and there is no direct mentorship or clear full-time conversion path.',
    context: 'Final year undergraduate engineering student.',
  },
  {
    id: 'relocation',
    title: 'Relocating to London for High Pay vs Staying Local',
    options: ['Relocate to London', 'Stay at Current Job'],
    reasoning:
      'Moving to London offers a 40% salary bump and prestigious company branding. However, cost of living is very high, I will be far from family support, and my spouse would need to restart their local medical residency.',
    context: 'Mid-level software architect with family.',
  },
  {
    id: 'quit_job',
    title: 'Leaving Stable MNC to Join Early-Stage Startup',
    options: ['Join Early-Stage Startup', 'Stay at Stable MNC'],
    reasoning:
      'The startup offers VP of Engineering title and 1% equity with cutting-edge AI tech. But runway is only 9 months, health insurance benefits are minimal, and work hours will likely double.',
    context: '5 years experience in enterprise corporate.',
  },
];

interface ScenarioChipsProps {
  onSelect: (scenario: DemoScenario) => void;
}

export const ScenarioChips: React.FC<ScenarioChipsProps> = ({ onSelect }) => {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      <span className="mono-font" style={{ fontSize: '0.85rem', alignSelf: 'center' }}>
        Demo Scenarios:
      </span>
      {DEMO_SCENARIOS.map((sc) => (
        <button
          key={sc.id}
          type="button"
          className="brutalist-btn"
          style={{
            fontSize: '0.75rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'var(--bone)',
          }}
          onClick={() => onSelect(sc)}
        >
          ⚡ {sc.id.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
