import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeSkinLesion } from "./ai";
import { insertAnalysisSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/detect", async (req, res) => {
    try {
      const { imageBase64 } = req.body;

      // Simulate detection delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate 1-3 random lesion positions
      const numLesions = Math.floor(Math.random() * 3) + 1;
      const detectedLesions = Array.from({ length: numLesions }, (_, i) => ({
        id: `lesion-${i + 1}`,
        boundingBox: {
          x: Math.random() * 0.8,
          y: Math.random() * 0.8,
          width: Math.random() * 0.2 + 0.1,
          height: Math.random() * 0.2 + 0.1
        }
      }));

      res.json({ detectedLesions });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: "Detection failed: " + message });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { imageBase64, patientId, lesions } = req.body;

      // Analyze each lesion (both detected and manually added)
      const analyzedLesions = await analyzeSkinLesion(imageBase64, lesions); // Assuming analyzeSkinLesion is updated to handle lesions

      // Store analysis results
      const analysis = await storage.createAnalysis({
        patientId,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`,
        analyzedLesions // Use analyzedLesions instead of detectedLesions
      });

      res.json(analysis);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ message: "Analysis failed: " + message });
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