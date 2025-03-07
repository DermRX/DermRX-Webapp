import { useContext, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ImageUpload } from "@/components/image-upload/image-upload";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { ResultsDisplay } from "@/components/results-display";
import { ManualAnnotation } from "@/components/manual-annotation";
import type { Analysis } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AppContext } from "@/context/AppContext";
import { ImageUploadPatient } from "@/components/image-upload/image-upload-patient";
import { fetchImage } from "@/services/api";

type AnalysisState = "idle" | "detecting" | "adjusting" | "analyzing" | "complete";

export default function AnalysisPage() {
  const appContext = useContext(AppContext);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [imageBase64, setImageBase64] = useState<string>();
  const [detectedLesions, setDetectedLesions] = useState<Array<{ id: string; boundingBox: any }>>([]);
const [bodyArea, setBodyArea] = useState<string>("");
const bodyAreas = [
  "Face", "Neck", "Chest", "Back", "Arms", "Legs", "Hands", "Feet"
];
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
      setAnalysisState("adjusting");
      setProgress(40);
    }
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      setAnalysisState("analyzing");
      const res = await apiRequest("POST", "/api/analyze", {
        imageBase64,
        patientId: "demo-patient",
        detectedLesions,
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
    setProgress(20);
    detectMutation.mutate(base64);
  };

  const handleAddBox = (box: any) => {
    setDetectedLesions(prev => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        boundingBox: box
      }
    ]);
  };

  const handleDeleteBox = (id: string) => {
    setDetectedLesions(prev => prev.filter(lesion => lesion.id !== id));
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
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Body Area</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={bodyArea}
                onChange={(e) => setBodyArea(e.target.value)}
                required
              >
                <option value="">Select area...</option>
                {bodyAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            {
                appContext.patientFhirId ? 
                    <ImageUploadPatient onImageSelect={handleImageSelect}/>:
                    <ImageUpload onImageSelect={handleImageSelect} /> 
            }
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

        {analysisState === "adjusting" && imageBase64 && (
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Initial Detection Complete</h2>
                <p className="text-muted-foreground">
                  We've detected {detectedLesions.length} potential lesion{detectedLesions.length !== 1 ? 's' : ''}.
                  Please review the detected regions and make any necessary adjustments:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                  <li>Click and drag to draw additional regions if needed</li>
                  <li>Click on any region to select it, then use the delete button to remove it</li>
                  <li>Once you're satisfied with the regions, click "Analyze" to proceed</li>
                </ul>
              </div>

              <ManualAnnotation
                imageUrl={`data:image/jpeg;base64,${imageBase64}`}
                existingBoxes={detectedLesions}
                onAddBox={handleAddBox}
                onDeleteBox={handleDeleteBox}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please ensure all relevant lesions are marked before proceeding with the analysis.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAnalysisState("idle");
                  setImageBase64(undefined);
                  setDetectedLesions([]);
                  setProgress(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => analysisMutation.mutate()}
                disabled={analysisMutation.isPending || detectedLesions.length === 0}
              >
                {analysisMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Analyze {detectedLesions.length} Region{detectedLesions.length !== 1 ? 's' : ''}
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