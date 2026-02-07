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
import { sendAdminNotification } from '@/lib/notifications';

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

      // Get court name for notification
      const { data: court } = await supabase
        .from('courts')
        .select('name')
        .eq('id', selectedCourtId)
        .single();

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

        // Send payment notification
        sendAdminNotification({
          type: 'payment_submitted',
          data: {
            memberName: profile?.full_name || 'Unknown',
            amount: amount,
            transactionRef: transactionRef,
            description: `Court booking - ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`,
          },
        });
      }

      // Send booking notification to admins
      sendAdminNotification({
        type: 'booking_created',
        data: {
          memberName: profile?.full_name || 'Unknown',
          date: format(selectedDate, 'MMMM d, yyyy'),
          startTime: selectedTime,
          endTime: format(addMinutes(parse(selectedTime, 'HH:mm', new Date()), duration), 'HH:mm'),
          courtName: court?.name || 'Court',
          amount: amount,
          paymentStatus: transactionRef ? 'pending verification' : 'unpaid',
          notes: notes || null,
        },
      });

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

  const stepLabel = step === 1 ? 'Select Date & Court' : step === 2 ? 'Choose Time' : 'Confirm & Pay';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 overflow-hidden">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col min-h-0 pb-[env(safe-area-inset-bottom)] sm:pb-0">
        {/* Header - fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="font-display text-lg sm:text-xl font-bold truncate">Book a Court</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Step {step} of 3 – {stepLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-lg hover:bg-muted transition-colors shrink-0 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
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
            <div className="space-y-4 sm:space-y-6">
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
            <div className="space-y-4 sm:space-y-6">
              {/* Booking Summary */}
              <div className="p-3 sm:p-4 rounded-xl bg-muted/50 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-sm sm:text-base">Booking Summary</h3>
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
              <div className="p-3 sm:p-4 rounded-xl border border-gold/30 bg-gold/5 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gold shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base">Payment via Mobile Money</h3>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
                  <p>Send payment to:</p>
                  <div className="p-2.5 sm:p-3 rounded-lg bg-background">
                    <p className="font-semibold break-all">{CLUB_INFO.momoNumber}</p>
                    <p className="text-xs">{CLUB_INFO.momoName}</p>
                  </div>
                  <p>After sending, enter the transaction reference below:</p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="transactionRef" className="text-sm">Transaction Reference</Label>
                  <Input
                    id="transactionRef"
                    placeholder="e.g., TXN123456789"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="h-10 sm:h-11 text-base touch-manipulation"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can add this later from your bookings page if you haven't paid yet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - fixed */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-t flex-shrink-0 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="min-w-0 flex-1 sm:flex-initial h-11 sm:h-10 touch-manipulation"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!selectedDate || !selectedCourtId)) ||
                (step === 2 && !selectedTime)
              }
              className="btn-primary flex-1 sm:flex-initial h-11 sm:h-10 touch-manipulation"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1 sm:flex-initial h-11 sm:h-10 touch-manipulation"
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
