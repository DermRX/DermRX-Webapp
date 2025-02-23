import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import type { Analysis } from "@shared/schema";

export default function AnalysisPage() {
  const [, navigate] = useLocation();
  const [imageBase64, setImageBase64] = useState<string>();

  const mutation = useMutation({
    mutationFn: async (base64: string) => {
      const res = await apiRequest("POST", "/api/analyze", {
        imageBase64: base64,
        patientId: "demo-patient"
      });
      return res.json() as Promise<Analysis>;
    },
    onSuccess: () => {
      navigate("/");
    }
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">New Analysis</h1>
        
        <ImageUpload onImageSelect={setImageBase64} />
        
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => imageBase64 && mutation.mutate(imageBase64)}
            disabled={!imageBase64 || mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Analyze Image
          </Button>
        </div>
      </div>
    </Layout>
  );
}
