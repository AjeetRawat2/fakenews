import axios from "axios";

const API_KEY = process.env.GOOGLE_FACTCHECK_KEY;

export const searchFactCheck = async (query) => {

  try {

    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search`;

    const response = await axios.get(url, {
      params: {
        query: query,
        key: API_KEY
      }
    });

    return response.data;

  } catch (error) {

    console.error(error);
    return null;

  }
};