import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { ResultsDisplay } from "@/components/results-display";
import { Link } from "wouter";
import type { Analysis } from "@shared/schema";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";

// Placeholder components - these need to be implemented
const PatientTimeline = ({ analyses }: { analyses: any[] }) => (
  <div>
    {/* Implement timeline visualization here */}
    <p>Patient Timeline (Placeholder)</p>
    {analyses.map((analysis) => (
      <div key={analysis.id}>{analysis.id}</div>
    ))}
  </div>
);

const LesionTracking = ({ analysis }: { analysis: any }) => (
  <div>
    {/* Implement lesion tracking visualization here */}
    <p>Lesion Tracking (Placeholder)</p>
  </div>
);


export default function Home() {
  const { data: analyses, isLoading } = useQuery<Analysis[]>({
    queryKey: ["/api/analyses/demo-patient"],
  });
  const appContext = useContext(AppContext);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div>
            <h1>Welcome</h1>
            <p>Patient ID: {appContext?.patientFhirId}</p>
            <p>FHIR URL: {appContext?.fhirUrl}</p>
            <p>Access Token: {appContext?.accessToken}</p>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome to MelanomaAI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload skin lesion images for AI-powered melanoma detection.
            </p>
            <Link href="/analysis">
              <Button>Start New Analysis</Button>
            </Link>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Previous Analyses</h2>
        <div className="max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4">Patient History</h2>
          <PatientTimeline analyses={analyses || []} />
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {analyses?.map((analysis) => (
              <ResultsDisplay key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}