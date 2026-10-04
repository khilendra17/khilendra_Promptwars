/** Frontend TypeScript domain model interfaces matching backend schemas. */

export type LensId =
  | 'money'
  | 'time'
  | 'health_energy'
  | 'reversibility'
  | 'relationships'
  | 'opportunity_cost'
  | 'identity_values'
  | 'learning_growth'
  | 'risk_downside'
  | 'dependency_control'
  | 'ethics_fairness'
  | 'future_regret';

export interface Claim {
  id: string;
  text: string;
  quote: string;
  kind: 'factor' | 'assumption' | 'constraint' | 'preference';
  lens: LensId;
  option: string | null;
  polarity: -1 | 0 | 1;
  weight: number;
}

export interface Relation {
  kind: 'implies' | 'excludes' | 'requires';
  a: string;
  b: string;
}

export interface BlindSpot {
  id: string;
  type: 'silent' | 'assumption' | 'conflict';
  lens: LensId;
  evidence_quotes: string[];
  why_it_matters: string;
  question_ids: string[];
}

export interface Conflict {
  claim_ids: string[];
  explanation: string;
}

export interface Fragility {
  assumption_id: string;
  flips_leader: boolean;
  leader_before: string;
  leader_after: string;
  score: number;
}

export interface Question {
  id: string;
  blind_spot_id: string;
  text: string;
}

export interface Analysis {
  id: string;
  session_id: string;
  version: number;
  claims: Claim[];
  relations: Relation[];
  coverage: Record<string, number>;
  blind_spots: BlindSpot[];
  conflicts: Conflict[];
  fragility: Fragility[];
  questions: Question[];
  attention_gap: number;
  created_at: string;
}

export interface Session {
  id: string;
  decision_title: string;
  options: string[];
  reasoning: string;
  context?: string;
  status: 'pending' | 'running' | 'done' | 'failed';
}

export type ScreenState = 'landing' | 'describe' | 'scanning' | 'result' | 'summary';
