export const normalizeClaim = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")   // remove punctuation
    .replace(/\s+/g, " ")      // remove extra spaces
    .trim();
};