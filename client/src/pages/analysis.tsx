import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { ResultsDisplay } from "@/components/results-display";
import { ManualAnnotation } from "@/components/manual-annotation";
import type { Analysis, DetectedLesion } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

type AnalysisState = "idle" | "detecting" | "detected" | "analyzing" | "complete";

export default function AnalysisPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [imageBase64, setImageBase64] = useState<string>();
  const [detectedLesions, setDetectedLesions] = useState<Array<{ id: string; boundingBox: any }>>([]);
  const [analysisResult, setAnalysisResult] = useState<Analysis>();
  const [progress, setProgress] = useState(0);

  // Detection mutation
  const detectMutation = useMutation({
    mutationFn: async (base64: string) => {
      const res = await apiRequest("POST", "/api/detect", {
        imageBase64: base64,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setDetectedLesions(data.detectedLesions);
      setAnalysisState("detected");
      setProgress(50);
    }
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      setAnalysisState("analyzing");
      const res = await apiRequest("POST", "/api/analyze", {
        imageBase64,
        patientId: "demo-patient",
        lesions: detectedLesions,
      });
      return res.json() as Promise<Analysis>;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setAnalysisState("complete");
      setProgress(100);
    }
  });

  const handleImageSelect = async (base64: string) => {
    setImageBase64(base64);
    setAnalysisState("detecting");
    setProgress(25);
    detectMutation.mutate(base64);
  };

  const handleAddManualBox = (box: any) => {
    setDetectedLesions(prev => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        boundingBox: box
      }
    ]);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Skin Lesion Analysis</h1>

        {analysisState === "idle" && (
          <>
            <p className="text-muted-foreground mb-6">
              Upload a clear image of the skin lesion for AI-powered analysis and detection.
            </p>
            <ImageUpload onImageSelect={handleImageSelect} />
          </>
        )}

        {(analysisState === "detecting" || analysisState === "analyzing") && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-muted-foreground">
              {analysisState === "detecting" ? "Detecting lesions..." : "Analyzing detected lesions..."}
            </p>
          </div>
        )}

        {analysisState === "detected" && imageBase64 && (
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Initial Detection Complete</h2>
              <p className="text-muted-foreground mb-4">
                We've detected {detectedLesions.length} potential lesion{detectedLesions.length !== 1 ? 's' : ''}.
                You can manually add more regions if needed.
              </p>
              <ManualAnnotation
                imageUrl={`data:image/jpeg;base64,${imageBase64}`}
                onAddBox={handleAddManualBox}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => analysisMutation.mutate()}
                disabled={analysisMutation.isPending}
              >
                {analysisMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Analyze Detected Regions
              </Button>
            </div>
          </div>
        )}

        {analysisState === "complete" && analysisResult && (
          <div className="space-y-6">
            <ResultsDisplay analysis={analysisResult} />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAnalysisState("idle");
                  setAnalysisResult(undefined);
                  setDetectedLesions([]);
                  setImageBase64(undefined);
                  setProgress(0);
                }}
              >
                Analyze Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}