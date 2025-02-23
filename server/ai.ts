import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSkinLesion(imageBase64: string): Promise<{
  diagnosis: string;
  confidence: number;
  details: string;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a dermatology AI assistant specialized in melanoma detection. Analyze the image and provide a detailed assessment in JSON format with fields: diagnosis (string), confidence (number 0-1), details (string)."
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Please analyze this skin lesion image for melanoma indicators:" },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          }
        ]
      }
    ],
    response_format: { type: "json_object" }
  });

  // Ensure we have a valid response
  if (!response.choices[0].message.content) {
    throw new Error("No analysis results received from AI");
  }

  return JSON.parse(response.choices[0].message.content);
}