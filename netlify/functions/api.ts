import express, { Request, Response } from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes.ts"; // Import your existing routes
import { analyzeLesions, detectLesions } from "../../server/lesionDetectionClient.ts";

const app = express();
app.use(express.json());
registerRoutes(app); // Ensure routes are registered

app.get("/", (_req: Request, res: Response) => {
    res.send("Express API on Netlify!");
});

app.post("/api/detect", async (req, res) => {
    console.log('blahblahablah2');
    try {
      const { imageBase64 } = req.body;
      const detectedLesions = await detectLesions(imageBase64);
      res.json(detectedLesions);
    } catch (error) {
      res.status(500).json({ message: "Detection failed: " + error });
    }
  });

app.post("/api/analyze", async (req, res) => {
try {
    const { imageBase64, patientId, detectedLesions } = req.body;
    const analysis = await analyzeLesions(imageBase64, patientId, detectedLesions);
    res.json(analysis);
} catch (error) {
    res.status(500).json({ message: "Analysis failed: " + error });
}
});

export const handler = serverless(app);
