import { Config } from "@netlify/functions";

const FASTAPI_URL = "https://dermrx-ai-production.up.railway.app";

export async function handler(event) {
  try {
    const { imageBase64, patientId, detectedLesions } = JSON.parse(event.body);
    const analysis = await fetch(`${FASTAPI_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            imageBase64, 
            patientId, 
            detectedLesions 
          }),
      });
    return {
      statusCode: 200,
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Analysis failed: " + error }),
    };
  }
}

export const config: Config = {
    path: "/api/analyze"
};