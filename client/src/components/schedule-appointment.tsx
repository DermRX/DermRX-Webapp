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
import { Clock, Calendar as CalendarIcon } from "lucide-react";

interface ScheduleAppointmentProps {
  classification?: string;
}

export function ScheduleAppointment({ classification }: ScheduleAppointmentProps) {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Schedule a follow-up examination for the selected lesions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
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
              disabled={!date || !timeSlot || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Booked</DialogTitle>
            <DialogDescription>
              Your appointment has been successfully scheduled for {date && format(date, "PPPP")} at {timeSlot}.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { 
            setShowSuccess(false);
            setOpen(false);
          }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
