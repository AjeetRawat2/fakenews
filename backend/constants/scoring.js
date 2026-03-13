export const IMPACT_SCORE_WEIGHTS = {
  topic_sensitivity: 0.4,
  harm_type: 0.3,
  audience_scope: 0.2,
  credibility_risk: 0.1,
};

export const FINAL_SCORE_WEIGHTS = {
  impact_score: 0.8,
  recency_score: 0.2,
};

export const RISK_LEVELS = {
  low: [0.0, 0.3],
  moderate: [0.3, 0.6],
  high: [0.6, 0.8],
  critical: [0.8, 1.0],
};
