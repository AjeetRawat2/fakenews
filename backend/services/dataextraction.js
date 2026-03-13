import axios from "axios";
import cheerio from "cheerio";

const { load } = cheerio;

export const extractNewsText = async (url) => {

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
    }
  });

  const $ = load(data);

  const selectors = [
    "article p",
    ".article-body p",
    ".story-body p",
    ".post-content p",
    "p"
  ];

  const noisePatterns = [
    "advertisement",
    "subscribe",
    "sign up",
    "read more",
    "newsletter"
  ];

  let articleText = "";

  for (const selector of selectors) {

    const paragraphs = $(selector);

    if (paragraphs.length > 5) {

      paragraphs.each((i, el) => {

        const text = $(el).text().trim().toLowerCase();

        if (text.length < 40) return;

        const isNoise = noisePatterns.some(n => text.includes(n));

        if (!isNoise) {
          articleText += text + " ";
        }

      });

      break;
    }
  }

  return articleText.trim();
};