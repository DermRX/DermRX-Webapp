
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Analysis } from "@shared/schema";
import { useState } from "react";

interface PatientTimelineProps {
  analyses: Analysis[];
}

export function PatientTimeline({ analyses }: PatientTimelineProps) {
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const bodyAreas = ["all", ...Array.from(new Set(analyses.map(a => a.bodyArea).filter(Boolean)))];
  
  const filteredAnalyses = selectedArea === "all" 
    ? analyses 
    : analyses.filter(a => a.bodyArea === selectedArea);

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by body area" />
          </SelectTrigger>
          <SelectContent>
            {bodyAreas.map(area => (
              <SelectItem key={area} value={area}>
                {area === "all" ? "All Areas" : area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {sortedAnalyses.map((analysis) => (
          <Card key={analysis.id} className="p-4">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 flex-shrink-0">
                <img 
                  src={analysis.imageUrl} 
                  alt="Analysis thumbnail" 
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {format(new Date(analysis.createdAt), 'MMMM d, yyyy')}
                  </p>
                  {analysis.bodyArea && (
                    <Badge variant="outline" className="ml-2">
                      {analysis.bodyArea}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">
                    {analysis.detectedLesions?.length || 0} lesion{analysis.detectedLesions?.length !== 1 ? 's' : ''} detected
                  </p>
                  {analysis.notes && (
                    <p className="text-sm text-muted-foreground">
                      {analysis.notes}
                    </p>
                  )}
                </div>
                {analysis.detectedLesions && analysis.detectedLesions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.detectedLesions.map((lesion) => (
                      <Badge key={lesion.id} variant="secondary" className="text-xs">
                        {lesion.classification.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
