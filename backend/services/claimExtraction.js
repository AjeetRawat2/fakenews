import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const extractClaims = async (articleText) => {
  try {
    const prompt = `
You are a fact-checking assistant.

Extract factual, verifiable claims from the following news article.

Rules:
- Only include statements that can be fact-checked
- Ignore opinions and background context
- Keep claims short and clear
- Return ONLY JSON

Format:
{
  "claims": []
}

Article:
${articleText}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
    });

    const responseText = completion.choices[0].message.content;

    // Extract JSON safely
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.claims || !Array.isArray(parsed.claims)) {
      return [];
    }

    return parsed.claims;
  } catch (error) {
    console.error("Claim extraction failed:", error.message);

    return [];
  }
};
