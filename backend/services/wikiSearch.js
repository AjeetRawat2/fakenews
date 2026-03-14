import axios from "axios";

/*
Search Wikipedia and return summary evidence
*/

export const searchWikipediaEvidence = async (claim) => {
  try {
    /*
    Use first 6 words of claim as search query
    (short queries work better)
    */

    const query = claim.split(" ").slice(0, 6).join(" ");

    /*
    Step 1: Search Wikipedia
    */

    const searchResponse = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "query",
          list: "search",
          srsearch: query,
          format: "json",
        },
      },
    );

    const results = searchResponse.data?.query?.search;

    if (!results || results.length === 0) {
      return null;
    }

    const pageTitle = results[0].title;

    /*
    Step 2: Get page summary
    */

    const summaryResponse = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        pageTitle,
      )}`,
    );

    const summary = summaryResponse.data?.extract;

    if (!summary) {
      return null;
    }

    return {
      title: pageTitle,
      summary: summary,
    };
  } catch (error) {
    console.error("Wikipedia search error:", error.message);
    return null;
  }
};
