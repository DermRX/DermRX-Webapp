import { useCallback, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { AppContext } from "@/context/AppContext";
import FHIR from "fhirclient";
import { launchOption } from "@/config/config";
import IMeldRxLaunchData from '@/config/IMeldRxLaunchData';

export default function Home(){
    const appContext = useContext(AppContext);
    const onLaunchClick = useCallback(() => {
        console.log(launchOption);
        const fhirUrl = launchOption.workspaceUrl;
        FHIR.oauth2.authorize({
            clientId: launchOption.clientId,
            scope: launchOption.scope,
            redirectUri: launchOption.redirectUrl,
            iss: fhirUrl,
        });
      }, [FHIR]);

    const [, navigate] = useLocation();
    return (
        <Layout>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Melanoma Detection Assistant
              </h1>
              <p className="text-xl text-muted-foreground">
                Advanced AI-powered melanoma detection for healthcare professionals
              </p>
            </div>
    
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4 flex flex-col justify-between h-full">
                    <h2 className="text-xl font-semibold">Healthcare Providers</h2>
                    <p className="text-muted-foreground">
                    Integrate directly with your EHR system for seamless patient care
                    </p>
                    <Button className="w-full" onClick={onLaunchClick}>
                    Login to EHR
                    </Button>
                </Card>

                <Card className="p-6 space-y-4 flex flex-col justify-between h-full">
                    <h2 className="text-xl font-semibold">Quick Analysis</h2>
                    <p className="text-muted-foreground">
                    Upload and analyze images without EHR integration
                    </p>
                    <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/analysis")}
                    >
                    Start Analysis
                    </Button>
                </Card>
                </div>

    
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "https://images.unsplash.com/photo-1504813184591-01572f98c85f",
                "https://images.unsplash.com/photo-1519494080410-f9aa76cb4283",
                "https://images.unsplash.com/photo-1514416432279-50fac261c7dd",
                "https://images.unsplash.com/photo-1676312754401-d97fe43c2c4b"
              ].map((url) => (
                <Card key={url} className="aspect-square overflow-hidden">
                  <img
                    src={url}
                    alt="Medical interface"
                    className="w-full h-full object-cover"
                  />
                </Card>
              ))}
            </div>
          </div>
        </Layout>
      );
}