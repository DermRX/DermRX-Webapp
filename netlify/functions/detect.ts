import { Config } from "@netlify/functions";

const FASTAPI_URL = "https://dermrx-ai-production.up.railway.app";

export async function handler(event) {
  try {
    const { imageBase64 } = JSON.parse(event.body);
    
    const response = await fetch(`${FASTAPI_URL}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Detection failed: " + error.message }),
    };
  }
}

export const config: Config = {
    path: "/api/detect"
};