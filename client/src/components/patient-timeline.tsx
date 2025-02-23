
import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { Analysis } from '@shared/schema';

interface PatientTimelineProps {
  analyses: Analysis[];
}

export function PatientTimeline({ analyses }: PatientTimelineProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const bodyAreas = Array.from(new Set(analyses.map(a => a.bodyArea).filter(Boolean)));
  const filteredAnalyses = selectedArea 
    ? analyses.filter(a => a.bodyArea === selectedArea)
    : analyses;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" onClick={() => setSelectedArea(null)}>
            All Areas
          </TabsTrigger>
          {bodyAreas.map(area => (
            <TabsTrigger 
              key={area} 
              value={area}
              onClick={() => setSelectedArea(area)}
            >
              {area}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredAnalyses.map((analysis) => (
          <Card key={analysis.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(analysis.createdAt), 'MMM d, yyyy')}
                </p>
                {analysis.bodyArea && (
                  <Badge variant="outline" className="mt-1">
                    {analysis.bodyArea}
                  </Badge>
                )}
                <p className="mt-2">
                  {analysis.detectedLesions?.length || 0} lesion(s) detected
                </p>
                {analysis.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {analysis.notes}
                  </p>
                )}
              </div>
              <img 
                src={analysis.imageUrl} 
                alt="Analysis thumbnail" 
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
