import { pgTable, text, serial, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LesionType = 
  | "melanoma" 
  | "nevus"
  | "basal_cell_carcinoma"
  | "squamous_cell_carcinoma"
  | "actinic_keratosis"
  | "seborrheic_keratosis";

export type DetectedLesion = {
  id: string;
  boundingBox: BoundingBox;
  classification: LesionType;
  confidence: number;
};

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  imageUrl: text("image_url").notNull(),
  detectedLesions: json("detected_lesions").$type<DetectedLesion[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  patientId: true,
  imageUrl: true,
  detectedLesions: true,
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;