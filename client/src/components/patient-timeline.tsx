import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Analysis } from "@shared/schema";

interface PatientTimelineProps {
  analyses: Analysis[];
}

export function PatientTimeline({ analyses }: PatientTimelineProps) {
  const [selectedArea, setSelectedArea] = useState<string>("all");

  // Group and sort analyses by body area in descending order (latest first)
  const analysesByArea = analyses.reduce((acc, analysis) => {
    const area = analysis.bodyArea || "Unspecified";
    if (!acc[area]) acc[area] = [];
    acc[area].push(analysis);
    return acc;
  }, {} as Record<string, Analysis[]>);

  Object.values(analysesByArea).forEach((group) => {
    group.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  const bodyAreas = ["all", ...Object.keys(analysesByArea)];

  const filteredAreas = selectedArea === "all" ? Object.keys(analysesByArea) : [selectedArea];

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by body area" />
          </SelectTrigger>
          <SelectContent>
            {bodyAreas.map((area) => (
              <SelectItem key={area} value={area}>
                {area === "all" ? "All Areas" : area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Analyses List */}
      {filteredAreas.map((area) => (
        <div key={area} className="space-y-2">
          <h3 className="font-medium text-lg">{area}</h3>
          <div className="grid gap-2">
            {analysesByArea[area].map((analysis) => (
              <Card key={analysis.id} className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={analysis.imageUrl}
                      alt="Analysis thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Analysis Details */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(analysis.createdAt), "MMM d, yyyy • HH:mm")}
                      </p>
                      <Badge variant="outline">
                        {analysis.detectedLesions?.length || 0} lesion(s)
                      </Badge>
                    </div>
                    {analysis.notes && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {analysis.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
