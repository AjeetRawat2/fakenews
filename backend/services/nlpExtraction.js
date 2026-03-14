import Groq from "groq-sdk";

export const extractArticleStructure = async (text) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `
You are an information extraction system.

Extract structured information from this news article.

Return STRICT JSON in this format:

{
"title": "",
"summary": "",
"people": [],
"organizations": [],
"locations": [],
"keywords": [],
"topic_category": "",
"topic_subcategory": ""
}

Rules:
- Infer entities if possible
- If unknown return empty arrays
- summary must be 1–2 sentences

Article:
${text}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const response = completion.choices[0].message.content;

    // Extract JSON safely
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Groq NLP extraction failed:", error.message);

    return null;
  }
};
