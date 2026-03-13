export const MAX_PROCESSING_TIME_SECONDS = 20;

export const PIPELINE_STAGES = [
  "scraping",
  "preprocessing",
  "entity_extraction",
  "topic_classification",
  "keyword_extraction",
  "claim_extraction",
  "fact_check_search",
  "severity_scoring",
];

export const VERDICT_TYPES = [
  "true",
  "false",
  "misleading",
  "unverified",
  "partially_true",
];
