export type CriterionType = 'benefit' | 'cost';

export interface Criterion {
  id: string;
  name: string;
  description?: string;
  weight: number; // 1 - 10 scale or weight value
  type: CriterionType;
  minThreshold?: number; // Optional veto score threshold
}

export interface Option {
  id: string;
  name: string;
  description?: string;
  scores: Record<string, number>; // criterionId -> score (scaleMin to scaleMax)
  notes?: Record<string, string>; // criterionId -> comment/pros-cons
  color?: string; // Color used in visual charts
}

export interface AIAnalysisResult {
  winner: string;
  summary: string;
  keyTradeoffs: string[];
  sensitivityAlerts?: string[];
  risksAndCaveats: string[];
  nextSteps: string[];
  generatedAt?: string;
}

export interface DecisionProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  scaleMin: number; // default 1
  scaleMax: number; // default 10
  weightMode: 'absolute' | 'normalized'; // absolute (raw weights) or normalized (% weights)
  criteria: Criterion[];
  options: Option[];
  aiAnalysis?: AIAnalysisResult;
}

export interface CalculatedOptionResult {
  option: Option;
  rawTotal: number;
  weightedTotal: number;
  maxPossibleWeightedTotal: number;
  normalizedPercentage: number; // 0 - 100%
  rank: number;
  criterionWeightedScores: Record<string, number>; // criterionId -> score * weight
  criterionNormalizedScores: Record<string, number>; // criterionId -> 1 to 10 adjusted score (handles cost inversion)
  isVetoed: boolean;
  vetoReasons: string[];
}

export interface DecisionTemplate {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: string;
  criteria: Omit<Criterion, 'id'>[];
  options: Omit<Option, 'id'>[];
}
