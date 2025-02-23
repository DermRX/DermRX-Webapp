import { pgTable, text, serial, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  imageUrl: text("image_url").notNull(),
  result: json("result").$type<{
    diagnosis: string;
    confidence: number;
    details: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  patientId: true,
  imageUrl: true,
  result: true,
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
