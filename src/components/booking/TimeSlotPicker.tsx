import { useState, useEffect } from 'react';
import { format, parse, addMinutes, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'];

interface TimeSlotPickerProps {
  selectedDate: Date;
  courtId: string;
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
  duration: number;
  excludeBookingId?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  isPrimeTime: boolean;
}

export function TimeSlotPicker({
  selectedDate,
  courtId,
  selectedTime,
  onSelectTime,
  duration,
  excludeBookingId,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

  // Generate time slots from 8:00 to 22:00 (10 PM)
  const generateSlots = (): TimeSlot[] => {
    const generatedSlots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 22;
    const now = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotEndTime = addMinutes(
          parse(slotTime, 'HH:mm', new Date()),
          duration
        );
        
        // Check if slot ends after closing time
        const closingTime = parse('22:00', 'HH:mm', new Date());
        if (isAfter(slotEndTime, closingTime)) {
          continue;
        }

        // Check if slot is in the past for today
        if (isToday) {
          const slotDateTime = setMinutes(setHours(selectedDate, hour), minute);
          if (isBefore(slotDateTime, now)) {
            continue;
          }
        }

        // Check for conflicts with existing bookings
        const hasConflict = existingBookings.some((booking) => {
          const bookingStart = parse(booking.start_time, 'HH:mm:ss', new Date());
          const bookingEnd = parse(booking.end_time, 'HH:mm:ss', new Date());
          const slotStart = parse(slotTime, 'HH:mm', new Date());
          const slotEnd = addMinutes(slotStart, duration);

          return (
            (isAfter(slotStart, bookingStart) || format(slotStart, 'HH:mm') === format(bookingStart, 'HH:mm')) && 
            isBefore(slotStart, bookingEnd)
          ) || (
            isAfter(slotEnd, bookingStart) && 
            (isBefore(slotEnd, bookingEnd) || format(slotEnd, 'HH:mm') === format(bookingEnd, 'HH:mm'))
          ) || (
            (isBefore(slotStart, bookingStart) || format(slotStart, 'HH:mm') === format(bookingStart, 'HH:mm')) && 
            (isAfter(slotEnd, bookingEnd) || format(slotEnd, 'HH:mm') === format(bookingEnd, 'HH:mm'))
          );
        });

        // Prime time: 8-12 and 15-18
        const isPrimeTime = (hour >= 8 && hour < 12) || (hour >= 15 && hour < 18);

        generatedSlots.push({
          time: slotTime,
          available: !hasConflict,
          isPrimeTime,
        });
      }
    }

    return generatedSlots;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      let query = supabase
        .from('bookings')
        .select('*')
        .eq('court_id', courtId)
        .eq('booking_date', dateStr)
        .in('status', ['pending', 'confirmed']);
      
      // Exclude current booking when editing
      if (excludeBookingId) {
        query = query.neq('id', excludeBookingId);
      }

      const { data } = await query;

      setExistingBookings(data || []);
      setLoading(false);
      setLoading(false);
    };

    if (courtId) {
      fetchBookings();
    }
  }, [selectedDate, courtId]);

  useEffect(() => {
    if (!loading) {
      setSlots(generateSlots());
    }
  }, [existingBookings, loading, duration, selectedDate]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Select Time</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Select Time</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gold/20 border border-gold/30" />
            <span className="text-muted-foreground">Prime Time</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted border border-border" />
            <span className="text-muted-foreground">Off-Peak</span>
          </div>
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No available time slots for this date.
        </p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelectTime(slot.time)}
              disabled={!slot.available}
              className={cn(
                "py-3 px-2 rounded-lg text-sm font-medium transition-all border",
                slot.available
                  ? selectedTime === slot.time
                    ? "bg-primary text-primary-foreground border-primary"
                    : slot.isPrimeTime
                    ? "bg-gold/10 border-gold/30 hover:border-gold hover:bg-gold/20"
                    : "bg-muted/50 border-border hover:border-primary/50 hover:bg-muted"
                  : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed border-transparent line-through"
              )}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
