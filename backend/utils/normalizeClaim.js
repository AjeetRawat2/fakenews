export const normalizeClaim = (claim) => {
  if (!claim) return "";

  let normalized = claim.toLowerCase();

  // remove punctuation
  normalized = normalized.replace(/[^\w\s]/g, "");

  // normalize percentages
  normalized = normalized.replace(/(\d+)%/g, "$1 percent");

  // remove extra spaces
  normalized = normalized.replace(/\s+/g, " ").trim();

  // remove common stopwords
  const stopwords = [
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "and",
    "or",
    "that",
    "this",
    "it",
    "as",
    "with",
    "by",
    "from",
  ];

  normalized = normalized
    .split(" ")
    .filter((word) => !stopwords.includes(word))
    .join(" ");

  return normalized;
};
