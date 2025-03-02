import { analyzeLesions } from "./lesionDetectionClient.js"

export async function handler(event) {
  try {
    const { imageBase64, patientId, detectedLesions } = JSON.parse(event.body);
    const analysis = await analyzeLesions(imageBase64, patientId, detectedLesions);
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
