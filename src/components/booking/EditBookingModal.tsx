import { useState, useEffect } from 'react';
import { format, addMinutes, parse } from 'date-fns';
import { X, Loader2, Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingCalendar } from './BookingCalendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import { CourtSelector } from './CourtSelector';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PRICING, formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Court = Database['public']['Tables']['courts']['Row'];

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: Booking & { court?: Court };
}

export function EditBookingModal({ isOpen, onClose, onSuccess, booking }: EditBookingModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [opponentName, setOpponentName] = useState('');
  const [notes, setNotes] = useState('');

  const isMember = profile?.membership_type !== 'pay_as_you_play';

  useEffect(() => {
    if (isOpen && booking) {
      setSelectedDate(new Date(booking.booking_date));
      setSelectedCourtId(booking.court_id);
      setSelectedTime(booking.start_time?.slice(0, 5) || null);
      setDuration(booking.duration_minutes || 60);
      setOpponentName(booking.opponent_name || '');
      setNotes(booking.notes || '');
    }
  }, [isOpen, booking]);

  const calculateAmount = () => {
    if (!selectedTime) return 0;
    
    const hour = parseInt(selectedTime.split(':')[0]);
    const isPrimeTime = (hour >= 8 && hour < 12) || (hour >= 15 && hour < 18);
    const hours = duration / 60;
    
    if (isMember) {
      return PRICING.courtBooking.member.standard * hours;
    }
    
    return (isPrimeTime ? PRICING.courtBooking.nonMember.primeTime : PRICING.courtBooking.nonMember.standard) * hours;
  };

  const amount = calculateAmount();

  const handleSubmit = async () => {
    if (!user || !selectedDate || !selectedCourtId || !selectedTime) return;

    setLoading(true);

    try {
      const bookingDate = format(selectedDate, 'yyyy-MM-dd');
      const startTime = `${selectedTime}:00`;
      const endTime = format(
        addMinutes(parse(selectedTime, 'HH:mm', new Date()), duration),
        'HH:mm:ss'
      );

      const hour = parseInt(selectedTime.split(':')[0]);
      const isPrimeTime = (hour >= 8 && hour < 12) || (hour >= 15 && hour < 18);

      const { error } = await supabase
        .from('bookings')
        .update({
          court_id: selectedCourtId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: duration,
          is_prime_time: isPrimeTime,
          amount: amount,
          opponent_name: opponentName || null,
          notes: notes || null,
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Booking updated!",
        description: "Your booking has been successfully updated.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 overflow-hidden">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col min-h-0 pb-[env(safe-area-inset-bottom)] sm:pb-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="font-display text-lg sm:text-xl font-bold truncate">Edit Booking</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Update your booking details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-lg hover:bg-muted transition-colors shrink-0 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <BookingCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            maxDaysAhead={isMember ? 14 : 7}
          />
          
          {selectedDate && (
            <CourtSelector
              selectedCourtId={selectedCourtId}
              onSelectCourt={setSelectedCourtId}
            />
          )}

          {selectedDate && selectedCourtId && (
            <>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TimeSlotPicker
                selectedDate={selectedDate}
                courtId={selectedCourtId}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                duration={duration}
                excludeBookingId={booking.id}
              />
            </>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opponent">Playing with (optional)</Label>
              <Input
                id="opponent"
                placeholder="Opponent's name"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Updated Amount */}
          {selectedTime && (
            <div className="p-3 sm:p-4 rounded-xl bg-muted/50 space-y-2 sm:space-y-3">
              <h3 className="font-semibold">Updated Booking</h3>
              <div className="space-y-2 text-sm">
                {selectedDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {selectedTime} - {format(addMinutes(parse(selectedTime, 'HH:mm', new Date()), duration), 'HH:mm')} ({duration} min)
                </div>
              </div>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="font-medium text-sm sm:text-base">New Amount</span>
                <span className="font-display text-lg sm:text-xl font-bold text-primary truncate">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t flex-shrink-0 bg-background">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial h-11 sm:h-10 touch-manipulation">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedDate || !selectedCourtId || !selectedTime}
            className="btn-primary flex-1 sm:flex-initial h-11 sm:h-10 touch-manipulation"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
