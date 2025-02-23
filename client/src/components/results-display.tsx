import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { Analysis, DetectedLesion } from "@shared/schema";

interface ResultsDisplayProps {
  analysis: Analysis;
  onLesionSelect?: (lesion: DetectedLesion) => void;
}

function formatLesionType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function ResultsDisplay({ analysis, onLesionSelect }: ResultsDisplayProps) {
  if (!analysis.detectedLesions || analysis.detectedLesions.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No lesions detected in this image.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <img 
          src={analysis.imageUrl} 
          alt="Analyzed skin image"
          className="w-full rounded-lg"
        />
        {analysis.detectedLesions.map((lesion) => {
          const { x, y, width, height } = lesion.boundingBox;
          const isDangerous = lesion.classification === "melanoma" && lesion.confidence > 0.7;

          return (
            <div
              key={lesion.id}
              className={`absolute border-2 ${isDangerous ? 'border-red-500' : 'border-yellow-500'} 
                         cursor-pointer transition-all hover:border-4`}
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
              onClick={() => onLesionSelect?.(lesion)}
            />
          );
        })}
      </div>

      {analysis.detectedLesions.map((lesion) => (
        <Card key={lesion.id} className="p-6">
          <div className="flex items-start gap-4">
            <div className={lesion.classification === "melanoma" ? "text-red-500" : "text-yellow-500"}>
              {lesion.classification === "melanoma" ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <CheckCircle className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                {formatLesionType(lesion.classification)}
              </h3>
              <Progress 
                value={lesion.confidence * 100} 
                className="mb-4"
              />
              <p className="text-muted-foreground">
                Confidence: {Math.round(lesion.confidence * 100)}%
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}