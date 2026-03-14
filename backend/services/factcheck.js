import axios from "axios";

export const searchFactCheck = async (claim) => {
  try {
    if (!process.env.GOOGLE_FACTCHECK_API_KEY) {
      console.warn("FactCheck API key missing");
      return null;
    }

    /*
    Google API works best with short queries
    */

    const query = claim.slice(0, 200);

    const response = await axios.get(
      "https://factchecktools.googleapis.com/v1alpha1/claims:search",
      {
        params: {
          query: query,
          key: process.env.GOOGLE_FACTCHECK_API_KEY,
        },
      },
    );

    return response.data;
  } catch (error) {
    /*
    Prevent crashes
    */

    if (error.response) {
      console.error(
        "FactCheck API error:",
        error.response.status,
        error.response.data,
      );
    } else {
      console.error("FactCheck request failed:", error.message);
    }

    return null;
  }
};
