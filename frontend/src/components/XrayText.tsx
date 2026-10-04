/** X-ray text component underlining grounded evidence quotes in user text. */

import React from 'react';
import { useScotomaStore } from '../store/useScotomaStore';

interface XrayTextProps {
  reasoning: string;
}

export const XrayText: React.FC<XrayTextProps> = ({ reasoning }) => {
  const { latestAnalysis, setSelectedQuote, selectedQuote } = useScotomaStore();
  const quotes = latestAnalysis
    ? latestAnalysis.blind_spots.flatMap((b) => b.evidence_quotes).filter(Boolean)
    : [];

  if (quotes.length === 0) {
    return <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{reasoning}</p>;
  }

  // Create regex pattern to split reasoning by quotes
  const escapedQuotes = quotes.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedQuotes.join('|')})`, 'g');
  const parts = reasoning.split(regex);

  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '1.05rem' }}>
      {parts.map((part, idx) => {
        const isQuote = quotes.includes(part);
        if (isQuote) {
          const isSelected = selectedQuote === part;
          return (
            <span
              key={idx}
              className="wavy-underline"
              onClick={() => setSelectedQuote(part)}
              style={{
                backgroundColor: isSelected ? 'var(--uv-lime)' : undefined,
                fontWeight: isSelected ? 700 : 400,
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </div>
  );
};
