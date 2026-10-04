/** API client methods for backend SCOTOMA endpoints. */

import { Analysis, Session } from '../types';

const API_BASE = '/api';

export async function createSession(data: {
  decision_title: string;
  options: string[];
  reasoning: string;
  context?: string;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create session' }));
    throw new Error(err.detail || 'Session creation failed');
  }
  const json = await res.json();
  return json.id;
}

export async function runAnalysis(sessionId: string): Promise<Analysis> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/analyze`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(err.detail || 'Analysis execution failed');
  }
  return res.json();
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answerText: string
): Promise<Analysis> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, answer_text: answerText }),
  });
  if (!res.ok) {
    throw new Error('Failed to submit answer');
  }
  return res.json();
}

export async function getSessionDetail(
  sessionId: string
): Promise<{ session: Session; analyses: Analysis[] }> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch session detail');
  }
  return res.json();
}
