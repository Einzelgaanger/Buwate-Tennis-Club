import { useState, useEffect } from 'react';
import { format, addMinutes, parse } from 'date-fns';
import { X, Loader2, CreditCard, Clock, MapPin, Calendar } from 'lucide-react';
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
import { PRICING, formatCurrency, CLUB_INFO } from '@/lib/constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ isOpen, onClose, onSuccess }: BookingModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Booking details
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [opponentName, setOpponentName] = useState('');
  const [notes, setNotes] = useState('');
  
  // Payment step
  const [transactionRef, setTransactionRef] = useState('');

  const isMember = profile?.membership_type !== 'pay_as_you_play';

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

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          court_id: selectedCourtId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: duration,
          booking_type: isMember ? 'member' : 'non_member',
          is_prime_time: isPrimeTime,
          amount: amount,
          opponent_name: opponentName || null,
          notes: notes || null,
          status: transactionRef ? 'pending' : 'pending',
          payment_status: 'unpaid',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment record if transaction reference provided
      if (transactionRef) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            booking_id: booking.id,
            amount: amount,
            payment_method: 'momo',
            transaction_reference: transactionRef,
            description: `Court booking - ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`,
            status: 'pending',
          });

        if (paymentError) throw paymentError;
      }

      toast({
        title: "Booking created!",
        description: transactionRef 
          ? "Your booking is pending payment verification."
          : "Don't forget to complete payment to confirm your booking.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedCourtId(null);
    setSelectedTime(null);
    setDuration(60);
    setOpponentName('');
    setNotes('');
    setTransactionRef('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-display text-xl font-bold">Book a Court</h2>
            <p className="text-sm text-muted-foreground">
              Step {step} of 3 - {step === 1 ? 'Select Date & Court' : step === 2 ? 'Choose Time' : 'Confirm & Pay'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <div className="space-y-6">
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
              )}
            </div>
          )}

          {step === 2 && selectedDate && selectedCourtId && (
            <div className="space-y-6">
              <TimeSlotPicker
                selectedDate={selectedDate}
                courtId={selectedCourtId}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                duration={duration}
              />

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
            </div>
          )}

          {step === 3 && selectedDate && selectedTime && (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <h3 className="font-semibold">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedTime} - {format(addMinutes(parse(selectedTime, 'HH:mm', new Date()), duration), 'HH:mm')} ({duration} min)
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Court booking
                  </div>
                </div>
                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <h3 className="font-semibold">Payment via Mobile Money</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Send payment to:</p>
                  <div className="p-3 rounded-lg bg-background">
                    <p className="font-semibold">{CLUB_INFO.momoNumber}</p>
                    <p className="text-xs">{CLUB_INFO.momoName}</p>
                  </div>
                  <p>After sending, enter the transaction reference below:</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionRef">Transaction Reference</Label>
                  <Input
                    id="transactionRef"
                    placeholder="e.g., TXN123456789"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can add this later from your bookings page if you haven't paid yet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!selectedDate || !selectedCourtId)) ||
                (step === 2 && !selectedTime)
              }
              className="btn-primary"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
