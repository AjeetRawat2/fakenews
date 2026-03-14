import axios from "axios";
import cheerio from "cheerio";

export const extractNewsText = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    const selectors = [
      "article p",
      ".article-body p",
      ".story-body p",
      ".post-content p",
      "p",
    ];

    const noisePatterns = [
      "advertisement",
      "subscribe",
      "sign up",
      "read more",
      "newsletter",
    ];

    let articleText = "";

    for (const selector of selectors) {
      const paragraphs = $(selector);

      if (paragraphs.length > 5) {
        paragraphs.each((i, el) => {
          const text = $(el).text().trim();

          if (text.length < 40) return;

          const lower = text.toLowerCase();

          const isNoise = noisePatterns.some((n) => lower.includes(n));

          if (!isNoise) {
            articleText += text + " ";
          }
        });

        break;
      }
    }

    return articleText.trim();
  } catch (error) {
    console.error("Article extraction failed:", error.message);
    return null;
  }
};
