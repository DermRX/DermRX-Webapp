import { detectLesions } from "./lesionDetectionClient";

export async function handler(event) {
  try {
    const { imageBase64 } = JSON.parse(event.body);
    const detectedLesions = await detectLesions(imageBase64);
    return {
      statusCode: 200,
      body: JSON.stringify(detectedLesions),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Detection failed: " + error }),
    };
  }
}
