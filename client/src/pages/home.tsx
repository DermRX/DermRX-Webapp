import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { ResultsDisplay } from "@/components/results-display";
import { Link } from "wouter";
import type { Analysis } from "@shared/schema";

export default function Home() {
  const { data: analyses, isLoading } = useQuery<Analysis[]>({
    queryKey: ["/api/analyses/demo-patient"],
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
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
