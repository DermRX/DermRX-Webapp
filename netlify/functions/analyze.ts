import { Config } from "@netlify/functions";

const PRIMARY_API_URL = "https://8000-dep-01jnqtbwrmqd497brs9cvd73ab-d.cloudspaces.litng.ai";
const SECONDARY_API_URL = "https://soul0101-dermrx-ai-service.hf.space"; // Fallback
const HF_API_KEY = process.env.HF_API_KEY;

// Helper function to fetch with timeout
async function fetchWithTimeout(url, options, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

// Function to call the API and retry if needed
async function callAPI(imageBase64, patientId, detectedLesions) {
  const payload = JSON.stringify({ imageBase64, patientId, detectedLesions });
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${HF_API_KEY}`,
  };

  // Try primary API first
  try {
    const response = await fetchWithTimeout(`${PRIMARY_API_URL}/analyze`, {
      method: "POST",
      headers,
      body: payload,
    });

    if (!response.ok) throw new Error(`Primary API error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("Primary API failed, switching to secondary:", error.message);

    // Retry with secondary API
    try {
      const response = await fetchWithTimeout(`${SECONDARY_API_URL}/analyze`, {
        method: "POST",
        headers,
        body: payload,
      });

      if (!response.ok) throw new Error(`Secondary API error: ${response.statusText}`);
      return await response.json();
    } catch (secondaryError) {
      console.error("Both APIs failed:", secondaryError.message);
      throw new Error("Analysis failed: All API endpoints are unreachable.");
    }
  }
}

export async function handler(event) {
  try {
    const { imageBase64, patientId, detectedLesions } = JSON.parse(event.body);
    const data = await callAPI(imageBase64, patientId, detectedLesions);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
}

export const config: Config = {
  path: "/api/analyze",
};
