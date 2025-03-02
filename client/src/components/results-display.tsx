import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, AlertTriangle, CheckCircle, Maximize2, Eye, EyeOff } from "lucide-react";
import type { Analysis, DetectedLesion } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { LesionModal } from "./lesion-modal";
import { Button } from "./ui/button";
import { HeatMapOverlay } from "./heat-map-overlay";
import { ScheduleAppointment } from "./schedule-appointment";

interface ResultsDisplayProps {
  analysis: Analysis;
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

export function ResultsDisplay({ analysis }: ResultsDisplayProps) {
  const [selectedLesion, setSelectedLesion] = useState<DetectedLesion | null>(null);
  const [selectedLesions, setSelectedLesions] = useState<DetectedLesion[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHeatMapVisible, setIsHeatMapVisible] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  if (!analysis.detectedLesions || analysis.detectedLesions.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No lesions detected in this image.</p>
      </Card>
    );
  }

  const highRiskCount = analysis.detectedLesions.filter(
    l => getRiskLevel(l).level === 'high'
  ).length;

  const mediumRiskCount = analysis.detectedLesions.filter(
    l => getRiskLevel(l).level === 'medium'
  ).length;

  const toggleLesionSelection = (lesion: DetectedLesion) => {
    if (isMultiSelectMode) {
      setSelectedLesions(prev =>
        prev.some(l => l.id === lesion.id)
          ? prev.filter(l => l.id !== lesion.id)
          : [...prev, lesion]
      );
    } else {
      setSelectedLesion(lesion);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Analysis Summary</h3>
            <p className="text-muted-foreground mt-2">
              Found {analysis.detectedLesions.length} lesion{analysis.detectedLesions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              {highRiskCount > 0 && (
                <p className="text-red-500 font-semibold">
                  ⚠️ {highRiskCount} high-risk lesion{highRiskCount !== 1 ? 's' : ''}
                </p>
              )}
              {mediumRiskCount > 0 && (
                <p className="text-yellow-500 font-semibold">
                  ⚠️ {mediumRiskCount} medium-risk lesion{mediumRiskCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              >
                {isMultiSelectMode ? "Exit Selection" : "Select Multiple"}
              </Button>
              {isMultiSelectMode && (
                <ScheduleAppointment
                  selectedLesions={selectedLesions} // Corrected prop passing
                />
              )}
            </div>
          </div>
        </div>
      </Card>
      {/* Risk Level Legend */}
    <Card className="p-4">
    <h3 className="text-lg font-semibold mb-2">Risk Level Legend</h3>
    <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-500 font-medium">High Risk</span>
        </div>
        <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <span className="text-yellow-500 font-medium">Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-500 font-medium">Low Risk</span>
        </div>
    </div>
    </Card>

      {/* Image with bounding boxes */}
      <Card className="p-4">
        <div className={`relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsHeatMapVisible(!isHeatMapVisible)}
              title={isHeatMapVisible ? "Hide heat map" : "Show heat map"}
            >
              {isHeatMapVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className={`relative ${isZoomed ? 'overflow-auto h-[80vh]' : ''}`}>
            <div ref={imageContainerRef} className="relative">
              <img
                src={analysis.imageUrl}
                alt="Analyzed skin image"
                className={`rounded-lg ${isZoomed ? 'scale-150 transform-gpu' : 'w-full'}`}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImageDimensions({
                    width: img.clientWidth,
                    height: img.clientHeight
                  });
                }}
              />
              {imageDimensions && (
                <HeatMapOverlay
                  lesions={analysis.detectedLesions}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                  visible={isHeatMapVisible}
                />
              )}
              <TooltipProvider>
                {!isHeatMapVisible && analysis.detectedLesions.map((lesion) => {
                  const { x, y, width, height } = lesion.boundingBox;
                  const risk = getRiskLevel(lesion);
                  const isSelected = isMultiSelectMode
                    ? selectedLesions.some(l => l.id === lesion.id)
                    : selectedLesion?.id === lesion.id;

                  return (
                    <Tooltip key={lesion.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute border-2 transition-all duration-200 cursor-pointer
                                    ${risk.color} ${isSelected ? 'border-4 shadow-lg' : ''}
                                    hover:border-4 hover:shadow-lg`}
                          style={{
                            left: `${x * 100}%`,
                            top: `${y * 100}%`,
                            width: `${width * 100}%`,
                            height: `${height * 100}%`,
                          }}
                          onClick={() => toggleLesionSelection(lesion)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-medium">{formatLesionType(lesion.classification)}</p>
                          <p>Risk Level: {risk.level.toUpperCase()}</p>
                          <p>Confidence: {Math.round(lesion.confidence * 100)}%</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal for selected lesion */}
      <LesionModal
        lesion={selectedLesion}
        imageUrl={analysis.imageUrl}
        onClose={() => setSelectedLesion(null)}
      />
    </div>
  );
}