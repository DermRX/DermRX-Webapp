import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { ScheduleAppointment } from "./schedule-appointment";
import type { DetectedLesion } from "@shared/schema";

interface LesionModalProps {
  lesion: DetectedLesion | null;
  onClose: () => void;
}

function formatLesionType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getRiskLevel(lesion: DetectedLesion): {
  level: 'high' | 'medium' | 'low';
  color: string;
  icon: JSX.Element;
  description: string;
} {
  if (lesion.classification === "melanoma" && lesion.confidence > 0.7) {
    return {
      level: 'high',
      color: 'text-red-500',
      icon: <AlertCircle className="w-8 h-8 text-red-500" />,
      description: 'Immediate medical attention recommended'
    };
  } else if (["basal_cell_carcinoma", "squamous_cell_carcinoma"].includes(lesion.classification)) {
    return {
      level: 'medium',
      color: 'text-yellow-500',
      icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
      description: 'Medical evaluation recommended'
    };
  }
  return {
    level: 'low',
    color: 'text-green-500',
    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    description: 'Regular monitoring advised'
  };
}

export function LesionModal({ lesion, onClose }: LesionModalProps) {
  if (!lesion) return null;

  const risk = getRiskLevel(lesion);

  return (
    <Dialog open={!!lesion} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {risk.icon}
            <span>{formatLesionType(lesion.classification)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <span className="text-sm font-medium">
                {Math.round(lesion.confidence * 100)}%
              </span>
            </div>
            <Progress value={lesion.confidence * 100} />
          </div>

          {/* Risk Level */}
          <div className="space-y-2">
            <h4 className="font-medium">Risk Level</h4>
            <div className={`rounded-lg border p-4 ${risk.color}`}>
              <p className="font-semibold uppercase">{risk.level}</p>
              <p className="text-sm mt-1">{risk.description}</p>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-2">
            <h4 className="font-medium">Location</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Position</p>
                <p>X: {Math.round(lesion.boundingBox.x * 100)}%</p>
                <p>Y: {Math.round(lesion.boundingBox.y * 100)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Size</p>
                <p>Width: {Math.round(lesion.boundingBox.width * 100)}%</p>
                <p>Height: {Math.round(lesion.boundingBox.height * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Schedule Follow-up */}
          <div className="pt-4 border-t">
            <ScheduleAppointment
              lesionId={lesion.id}
              classification={lesion.classification}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}