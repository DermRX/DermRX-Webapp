import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { ResultsDisplay } from "@/components/results-display";
import type { Analysis } from "@shared/schema";

export default function AnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<Analysis>();

  const mutation = useMutation({
    mutationFn: async (base64: string) => {
      const res = await apiRequest("POST", "/api/analyze", {
        imageBase64: base64,
        patientId: "demo-patient"
      });
      return res.json() as Promise<Analysis>;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    }
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Skin Lesion Analysis</h1>

        {!analysisResult ? (
          <>
            <p className="text-muted-foreground mb-6">
              Upload a clear image of the skin lesion for AI-powered analysis and detection.
            </p>
            <ImageUpload onImageSelect={(base64) => mutation.mutate(base64)} />

            {mutation.isPending && (
              <div className="mt-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Analyzing image...</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <ResultsDisplay analysis={analysisResult} />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setAnalysisResult(undefined)}
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