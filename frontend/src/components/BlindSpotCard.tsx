/** Blind spot card component with question answering interface. */

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
    <div
      className="brutalist-card"
      style={{ marginBottom: '1.25rem', backgroundColor: '#FDFBF7' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className={`badge badge-${spot.type}`}>{spot.type}</span>
        <span className="mono-font" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          Lens: {spot.lens.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {spot.evidence_quotes.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <strong className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--oxide)' }}>
            EVIDENCE QUOTE:
          </strong>
          {spot.evidence_quotes.map((q, i) => (
            <blockquote
              key={i}
              onMouseEnter={() => setSelectedQuote(q)}
              onMouseLeave={() => setSelectedQuote(null)}
              style={{
                fontStyle: 'italic',
                borderLeft: '3px solid var(--vermilion)',
                paddingLeft: '0.5rem',
                margin: '0.25rem 0',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              "{q}"
            </blockquote>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>{spot.why_it_matters}</p>

      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            borderTop: '1px dashed var(--fog)',
            paddingTop: '0.75rem',
            marginTop: '0.75rem',
          }}
        >
          <p className="mono-font" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            ❓ <strong>Question:</strong> {q.text}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="brutalist-input"
              placeholder="Type your response to clarify..."
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            />
            <button
              className="brutalist-btn"
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
