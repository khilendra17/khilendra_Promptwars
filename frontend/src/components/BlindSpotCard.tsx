/** Electric purple glass blind spot card. */

import React, { useState } from 'react';
import { submitAnswer } from '../lib/api';
import { useScotomaStore } from '../store/useScotomaStore';
import { BlindSpot } from '../types';

interface BlindSpotCardProps {
  spot: BlindSpot;
}

export const BlindSpotCard: React.FC<BlindSpotCardProps> = ({ spot }) => {
  const { latestAnalysis, sessionId, addAnalysis, setLoading, setSelectedQuote } =
    useScotomaStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const questions = latestAnalysis?.questions.filter((q) => q.blind_spot_id === spot.id) || [];

  const handleAnswerSubmit = async (questionId: string) => {
    const text = answers[questionId];
    if (!text || !sessionId) return;

    try {
      setSubmittingId(questionId);
      setLoading(true);
      const newAnalysis = await submitAnswer(sessionId, questionId, text);
      addAnalysis(newAnalysis);
      setAnswers((prev) => ({ ...prev, [questionId]: '' }));
    } catch {
      // Handled silently
    } finally {
      setSubmittingId(null);
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-purple" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span className={`badge-purple badge-${spot.type}`}>{spot.type}</span>
        <span className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--bright-lavender)' }}>
          LENS: {spot.lens.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {spot.evidence_quotes.length > 0 && (
        <div style={{ marginBottom: '0.85rem' }}>
          <strong className="mono-font" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            EVIDENCE QUOTE:
          </strong>
          {spot.evidence_quotes.map((q, i) => (
            <blockquote
              key={i}
              onMouseEnter={() => setSelectedQuote(q)}
              onMouseLeave={() => setSelectedQuote(null)}
              style={{
                fontStyle: 'italic',
                borderLeft: '3px solid var(--neon-violet)',
                paddingLeft: '0.75rem',
                margin: '0.35rem 0',
                fontSize: '0.95rem',
                color: 'var(--bright-lavender)',
                cursor: 'pointer',
              }}
            >
              "{q}"
            </blockquote>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--white)' }}>
        {spot.why_it_matters}
      </p>

      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            borderTop: '1px solid var(--border-purple-glow)',
            paddingTop: '0.85rem',
            marginTop: '0.85rem',
          }}
        >
          <p className="mono-font" style={{ fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--bright-lavender)' }}>
            ❓ {q.text}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="purple-input"
              placeholder="Type your clarification..."
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            />
            <button
              className="btn-electric"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              disabled={submittingId === q.id || !answers[q.id]?.trim()}
              onClick={() => handleAnswerSubmit(q.id)}
            >
              {submittingId === q.id ? '...' : 'Submit'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
