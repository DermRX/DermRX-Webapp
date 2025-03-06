import { Config } from "@netlify/functions";

// const FASTAPI_URL = "https://dermrx-ai-production.up.railway.app";
const FASTAPI_URL = "https://soul0101-dermrx-ai-service.hf.space";
const HF_API_KEY = process.env.HF_API_KEY;

export async function handler(event) {
  try {
    const { imageBase64, patientId, detectedLesions } = JSON.parse(event.body);
    const response = await fetch(`${FASTAPI_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${HF_API_KEY}`},
        body: JSON.stringify({ 
            imageBase64, 
            patientId, 
            detectedLesions 
          }),
      });

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data),
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