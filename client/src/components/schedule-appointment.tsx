import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { Clock, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ScheduleAppointmentProps {
  lesionId?: string;
  classification?: string;
  selectedLesions?: Array<{
    id: string;
    classification: string;
    boundingBox: {
      x: number;
      y: number;
    };
  }>;
}

export function ScheduleAppointment({ 
  lesionId, 
  classification,
  selectedLesions = []
}: ScheduleAppointmentProps) {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedForMonitoring, setSelectedForMonitoring] = useState<string[]>(
    lesionId ? [lesionId] : []
  );

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Here you would typically make an API call to save the appointment
      console.log("Appointment scheduled for:", { 
        date, 
        timeSlot, 
        lesionsToMonitor: selectedForMonitoring 
      });
    }, 1000);
  };

  const toggleLesionSelection = (id: string) => {
    setSelectedForMonitoring(prev => 
      prev.includes(id) 
        ? prev.filter(lesionId => lesionId !== id)
        : [...prev, id]
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Schedule Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up Appointment</DialogTitle>
          <DialogDescription>
            {selectedLesions.length > 0 
              ? "Select lesions to monitor and schedule a follow-up examination."
              : `Schedule a follow-up examination for the detected ${classification}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {selectedLesions.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Select Lesions to Monitor</h4>
                <ScrollArea className="h-[100px] rounded-md border p-2">
                  <div className="space-y-2">
                    {selectedLesions.map((lesion) => (
                      <div 
                        key={lesion.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={selectedForMonitoring.includes(lesion.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleLesionSelection(lesion.id)}
                          >
                            {selectedForMonitoring.includes(lesion.id) ? "Selected" : "Select"}
                          </Button>
                          <span className="text-sm">
                            {lesion.classification.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Position: {Math.round(lesion.boundingBox.x * 100)}%, 
                          {Math.round(lesion.boundingBox.y * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedForMonitoring.length} lesion(s)
                </p>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-medium">Select Date</h4>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>

            {date && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Select Time</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={timeSlot === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeSlot(slot)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={
                !date || 
                !timeSlot || 
                isSubmitting || 
                (selectedLesions.length > 0 && selectedForMonitoring.length === 0)
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}