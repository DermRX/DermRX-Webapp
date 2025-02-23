import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import type { Analysis, DetectedLesion } from "@shared/schema";
import { useState } from "react";

interface ResultsDisplayProps {
  analysis: Analysis;
  onLesionSelect?: (lesion: DetectedLesion) => void;
}

function formatLesionType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getRiskLevel(lesion: DetectedLesion): {
  level: 'high' | 'medium' | 'low';
  color: string;
  icon: JSX.Element;
} {
  if (lesion.classification === "melanoma" && lesion.confidence > 0.7) {
    return {
      level: 'high',
      color: 'border-red-500 bg-red-500/10',
      icon: <AlertCircle className="w-8 h-8 text-red-500" />
    };
  } else if (["basal_cell_carcinoma", "squamous_cell_carcinoma"].includes(lesion.classification)) {
    return {
      level: 'medium',
      color: 'border-yellow-500 bg-yellow-500/10',
      icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />
    };
  }
  return {
    level: 'low',
    color: 'border-green-500 bg-green-500/10',
    icon: <CheckCircle className="w-8 h-8 text-green-500" />
  };
}

export function ResultsDisplay({ analysis, onLesionSelect }: ResultsDisplayProps) {
  const [selectedLesion, setSelectedLesion] = useState<DetectedLesion | null>(null);

  if (!analysis.detectedLesions || analysis.detectedLesions.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No lesions detected in this image.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image with bounding boxes */}
      <Card className="p-4">
        <div className="relative">
          <img 
            src={analysis.imageUrl} 
            alt="Analyzed skin image"
            className="w-full rounded-lg"
          />
          {analysis.detectedLesions.map((lesion) => {
            const { x, y, width, height } = lesion.boundingBox;
            const risk = getRiskLevel(lesion);
            const isSelected = selectedLesion?.id === lesion.id;

            return (
              <div
                key={lesion.id}
                className={`absolute border-2 transition-all duration-200 ${risk.color}
                          ${isSelected ? 'border-4 shadow-lg' : 'hover:border-4'}`}
                style={{
                  left: `${x * 100}%`,
                  top: `${y * 100}%`,
                  width: `${width * 100}%`,
                  height: `${height * 100}%`,
                }}
                onClick={() => {
                  setSelectedLesion(lesion);
                  onLesionSelect?.(lesion);
                }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-background border rounded-md shadow-lg p-2 text-sm">
                    {formatLesionType(lesion.classification)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Analysis Summary */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Analysis Summary</h3>
        <div className="space-y-2">
          <p>
            Found {analysis.detectedLesions.length} lesion{analysis.detectedLesions.length !== 1 ? 's' : ''}.
          </p>
          {analysis.detectedLesions.some(l => getRiskLevel(l).level === 'high') && (
            <p className="text-red-500 font-semibold">⚠️ High-risk lesions detected</p>
          )}
        </div>
      </Card>

      {/* Detailed Results */}
      <div className="space-y-4">
        {analysis.detectedLesions.map((lesion) => {
          const risk = getRiskLevel(lesion);

          return (
            <Card 
              key={lesion.id} 
              className={`p-6 transition-colors ${
                selectedLesion?.id === lesion.id ? risk.color : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div>{risk.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {formatLesionType(lesion.classification)}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Confidence</span>
                        <span className="text-sm font-medium">
                          {Math.round(lesion.confidence * 100)}%
                        </span>
                      </div>
                      <Progress value={lesion.confidence * 100} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Risk Level: <span className="font-medium">{risk.level.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}