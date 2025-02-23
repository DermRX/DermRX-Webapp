import type { DetectedLesion, LesionType } from "@shared/schema";

function generateRandomBoundingBox() {
  return {
    x: Math.random() * 0.8, // Normalized coordinates (0-1)
    y: Math.random() * 0.8,
    width: Math.random() * 0.2 + 0.1, // 10-30% of image width
    height: Math.random() * 0.2 + 0.1, // 10-30% of image height
  };
}

function getRandomLesionType(): LesionType {
  const types: LesionType[] = [
    "melanoma",
    "nevus",
    "basal_cell_carcinoma",
    "squamous_cell_carcinoma",
    "actinic_keratosis",
    "seborrheic_keratosis"
  ];
  return types[Math.floor(Math.random() * types.length)];
}

export async function analyzeSkinLesion(imageBase64: string): Promise<DetectedLesion[]> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate 1-3 random lesion detections
  const numLesions = Math.floor(Math.random() * 3) + 1;

  return Array.from({ length: numLesions }, (_, i) => ({
    id: `lesion-${i + 1}`,
    boundingBox: generateRandomBoundingBox(),
    classification: getRandomLesionType(),
    confidence: Math.random() * 0.5 + 0.5, // 50-100% confidence
  }));
}