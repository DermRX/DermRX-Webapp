import { Express } from "express";
import { detectLesions, analyzeLesions } from "./lesionDetectionClient";
import { storage } from "./storage";
import { createServer } from "http";

export async function registerRoutes(app: Express) {
  app.post("/api/detect", async (req, res) => {
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
      await storage.createAnalysis(analysis);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Analysis failed: " + error });
    }
  });


  app.get("/api/analyses/:patientId", async (req, res) => {
    try {
      const analyses = await storage.getAnalyses(req.params.patientId);
      res.json(analyses);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: "Failed to fetch analyses: " + message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}