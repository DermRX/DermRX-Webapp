import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { Analysis } from "@shared/schema";

interface ResultsDisplayProps {
  analysis: Analysis;
}

export function ResultsDisplay({ analysis }: ResultsDisplayProps) {
  const confidence = analysis.result?.confidence || 0;
  const isDangerous = confidence > 0.7;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className={isDangerous ? "text-red-500" : "text-green-500"}>
          {isDangerous ? (
            <AlertCircle className="w-8 h-8" />
          ) : (
            <CheckCircle className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">
            {analysis.result?.diagnosis}
          </h3>
          <Progress 
            value={confidence * 100} 
            className="mb-4"
          />
          <p className="text-muted-foreground">
            {analysis.result?.details}
          </p>
        </div>
      </div>
    </Card>
  );
}
