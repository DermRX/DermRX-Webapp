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
      const { imageBase64, patientId, detectedLesions } = req.body;

      // Enhanced dummy analysis logic
      const analyzedLesions = detectedLesions.map(lesion => {
        const { width, height } = lesion.boundingBox;
        const area = width * height;

        // Generate more realistic classification based on size
        let classification: string;
        let confidence: number;

        if (area > 0.04) { // Large lesions are more likely to be concerning
          classification = Math.random() > 0.7 ? "melanoma" : "dysplastic_nevus";
          confidence = 0.7 + Math.random() * 0.25; // Higher confidence for larger lesions
        } else if (area > 0.02) {
          classification = ["basal_cell_carcinoma", "squamous_cell_carcinoma", "dysplastic_nevus"][Math.floor(Math.random() * 3)];
          confidence = 0.6 + Math.random() * 0.3;
        } else {
          classification = ["benign_nevus", "seborrheic_keratosis"][Math.floor(Math.random() * 2)];
          confidence = 0.5 + Math.random() * 0.4;
        }

        // For manually added boxes (IDs starting with 'manual-'), adjust confidence
        if (lesion.id.startsWith('manual-')) {
          confidence *= 0.9; // Slightly lower confidence for manual annotations
        }

        return {
          ...lesion,
          classification,
          confidence,
          tracking: {
            initialSize: area,
            lastChecked: new Date().toISOString(),
            growthRate: Math.random() * 0.1 // 0-10% growth rate
          }
        };
      });

      // Store analysis results
      const analysis = await storage.createAnalysis({
        patientId,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`,
        detectedLesions: analyzedLesions
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