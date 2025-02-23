import { analyses, type Analysis, type InsertAnalysis } from "@shared/schema";

export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalyses(patientId: string): Promise<Analysis[]>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, Analysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentId++;
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
      // Ensure result is typed correctly according to schema
      result: insertAnalysis.result || null,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalyses(patientId: string): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.patientId === patientId
    );
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }
}

export const storage = new MemStorage();