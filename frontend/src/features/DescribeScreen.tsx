/** Describe screen component for user decision entry. */

import React, { useState } from 'react';
import { createSession, runAnalysis } from '../lib/api';
import { useScotomaStore } from '../store/useScotomaStore';

interface DescribeScreenProps {
  initialTitle?: string;
  initialOptions?: string[];
  initialReasoning?: string;
  initialContext?: string;
}

export const DescribeScreen: React.FC<DescribeScreenProps> = ({
  initialTitle = '',
  initialOptions = ['', ''],
  initialReasoning = '',
  initialContext = '',
}) => {
  const { setScreen, setSessionId, setSessionData, setLoading, setError, error } =
    useScotomaStore();

  const [title, setTitle] = useState(initialTitle);
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [reasoning, setReasoning] = useState(initialReasoning);
  const [context, setContext] = useState(initialContext);

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 4) setOptions([...options, '']);
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (validOptions.length < 2) {
      setError('Please provide at least 2 distinct options.');
      return;
    }
    if (reasoning.trim().length < 50 || reasoning.trim().length > 3000) {
      setError('Reasoning must be between 50 and 3000 characters.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setScreen('scanning');

      const id = await createSession({
        decision_title: title.trim(),
        options: validOptions,
        reasoning: reasoning.trim(),
        context: context.trim() || undefined,
      });
      setSessionId(id);

      const analysis = await runAnalysis(id);
      setSessionData(
        {
          id,
          decision_title: title,
          options: validOptions,
          reasoning,
          context,
          status: 'done',
        },
        [analysis]
      );
      setScreen('result');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze decision');
      setScreen('describe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="brutalist-card">
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Describe Your Decision</h2>

        {error && (
          <div
            className="mono-font"
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--vermilion)',
              color: '#FFF',
              marginBottom: '1rem',
              fontWeight: 700,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="mono-font" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem' }}>
              Decision Title *
            </label>
            <input
              type="text"
              className="brutalist-input"
              placeholder="e.g. Internship vs Remote Software Engineer Role"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="mono-font" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem' }}>
              Options (2 to 4) *
            </label>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="brutalist-input"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
                {options.length > 2 && (
                  <button type="button" className="brutalist-btn" onClick={() => removeOption(i)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <button type="button" className="brutalist-btn" style={{ fontSize: '0.8rem' }} onClick={addOption}>
                + Add Option
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="mono-font" style={{ fontWeight: 700 }}>
                My Reasoning & Stated Beliefs *
              </label>
              <span className="mono-font" style={{ fontSize: '0.8rem' }}>
                {reasoning.length} / 3000 chars
              </span>
            </div>
            <textarea
              className="brutalist-textarea"
              rows={6}
              placeholder="Describe your thoughts, pros/cons, constraints, and why you favor certain choices..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="mono-font" style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem' }}>
              Constraints & Additional Context (Optional)
            </label>
            <input
              type="text"
              className="brutalist-input"
              placeholder="e.g. Must decide by Friday, spouse support needed"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <button type="submit" className="brutalist-btn" style={{ width: '100%', fontSize: '1.1rem' }}>
            Run Neuro-Symbolic Scan ➔
          </button>
        </form>
      </div>
    </div>
  );
};
