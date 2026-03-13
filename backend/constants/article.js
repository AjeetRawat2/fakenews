export const ARTICLE_TYPES = [
  "news",
  "opinion",
  "blog",
  "social_media",
  "press_release",
];

export const SOURCE_RELIABILITY = {
  government: 0.95,
  major_media: 0.9,
  verified_media: 0.8,
  local_media: 0.65,
  blog: 0.4,
  unknown: 0.3,
};

export const SUPPORTED_LANGUAGES = ["en"];

export const MAX_ARTICLE_LENGTH = 10000;
