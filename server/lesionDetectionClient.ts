import axios from "axios";

const FASTAPI_URL = "https://dermrx-ai-production.up.railway.app";
// const FASTAPI_URL = "http://127.0.0.1:8000";

export async function detectLesions(imageBase64: string) {
  try {
    const response = await axios.post(`${FASTAPI_URL}/detect`, { imageBase64 });
    return response.data;
  } catch (error) {
    throw new Error("Error calling FastAPI detect endpoint: " + error);
  }
}

export async function analyzeLesions(imageBase64: string, patientId: string, detectedLesions: any[]) {
  try {
    const response = await axios.post(`${FASTAPI_URL}/analyze`, { 
      imageBase64, 
      patientId, 
      detectedLesions 
    });
    return response.data;
  } catch (error) {
    throw new Error("Error calling FastAPI analyze endpoint: " + error);
  }
}
