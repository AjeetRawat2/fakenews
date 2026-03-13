export const RECENCY_LAMBDA = 0.25;

export const RECENCY_LOOKBACK_DAYS = 5;

export const RECENCY_BUCKETS = {
  today: 1.0,
  one_day: 0.85,
  three_days: 0.6,
  five_days: 0.45,
  seven_days: 0.3,
};
