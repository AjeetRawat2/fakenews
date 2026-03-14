import axios from "axios";

const WIKI_HEADERS = {
  "User-Agent": "FakeNewsDetector/1.0 (hackathon project)",
};

export const searchWikipediaEvidence = async (claim) => {
  try {
    /*
    Step 1: Search Wikipedia for the best matching page
    */

    const searchResponse = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "query",
          list: "search",
          srsearch: claim,
          format: "json",
        },
        headers: WIKI_HEADERS,
      },
    );

    const searchResults = searchResponse.data?.query?.search;

    if (!searchResults || searchResults.length === 0) {
      return null;
    }

    /*
    Step 2: Get the top page title
    */

    const pageTitle = searchResults[0].title;

    /*
    Step 3: Fetch summary of the page
    */

    const summaryResponse = await axios.get(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(pageTitle),
      {
        headers: WIKI_HEADERS,
      },
    );

    const data = summaryResponse.data;

    return {
      title: data.title,
      summary: data.extract,
      url: data.content_urls?.desktop?.page,
    };
  } catch (error) {
    console.error("Wikipedia search error:", error.message);
    return null;
  }
};
