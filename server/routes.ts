import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeSkinLesion } from "./ai";
import { insertAnalysisSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/analyze", async (req, res) => {
    try {
      const { imageBase64, patientId } = req.body;

      // Analyze image with AI
      const result = await analyzeSkinLesion(imageBase64);

      // Store analysis results
      const analysis = await storage.createAnalysis({
        patientId,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`,
        result
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