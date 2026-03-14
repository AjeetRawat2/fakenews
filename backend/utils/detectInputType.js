export const detectInputType = (input) => {
  try {
    new URL(input);

    return "url";
  } catch {
    return "text";
  }
};
