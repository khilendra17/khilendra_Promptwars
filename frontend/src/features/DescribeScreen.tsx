/** Electric Purple Glass Describe Screen component. */

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
    <div style={{ maxWidth: '880px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div className="glass-card-purple">
        <h2 className="heading-font" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--white)' }}>
          Describe Decision & Stated Reasoning
        </h2>

        {error && (
          <div
            className="mono-font"
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(255, 51, 102, 0.25)',
              border: '1px solid #FF3366',
              borderRadius: '10px',
              color: '#FF99BB',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="mono-font" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bright-lavender)', marginBottom: '0.4rem' }}>
              DECISION TITLE *
            </label>
            <input
              type="text"
              className="purple-input"
              placeholder="e.g. High-Stipend Internship vs Remote Software Developer Role"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="mono-font" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bright-lavender)', marginBottom: '0.4rem' }}>
              OPTIONS (2 TO 4) *
            </label>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="purple-input"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
                {options.length > 2 && (
                  <button type="button" className="btn-ghost-purple" onClick={() => removeOption(i)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <button type="button" className="btn-ghost-purple" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }} onClick={addOption}>
                + Add Option
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="mono-font" style={{ fontSize: '0.85rem', color: 'var(--bright-lavender)' }}>
                STATED REASONING & BELIEFS *
              </label>
              <span className="mono-font" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {reasoning.length} / 3000
              </span>
            </div>
            <textarea
              className="purple-textarea"
              rows={6}
              placeholder="Describe your reasoning, pros/cons, constraints, and underlying assumptions..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="mono-font" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bright-lavender)', marginBottom: '0.4rem' }}>
              CONSTRAINTS & CONTEXT (OPTIONAL)
            </label>
            <input
              type="text"
              className="purple-input"
              placeholder="e.g. Decision deadline Friday, family support constraint"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-electric" style={{ width: '100%', fontSize: '1.15rem', padding: '1.1rem' }}>
            Run Neuro-Symbolic Scan ➔
          </button>
        </form>
      </div>
    </div>
  );
};
