import { useState, useEffect } from 'react';
import { format, addDays, isBefore, startOfDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  maxDaysAhead?: number;
}

export function BookingCalendar({ 
  selectedDate, 
  onSelectDate, 
  maxDaysAhead = 14 
}: BookingCalendarProps) {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const daysToShow = 7;

  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));
  const maxDate = addDays(new Date(), maxDaysAhead);

  const canGoPrev = isBefore(startOfDay(new Date()), startDate);
  const canGoNext = isBefore(addDays(startDate, daysToShow), maxDate);

  const handlePrev = () => {
    if (canGoPrev) {
      setStartDate(addDays(startDate, -daysToShow));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setStartDate(addDays(startDate, daysToShow));
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="font-semibold text-sm sm:text-base">Select Date</h3>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground min-w-[120px] sm:min-w-[140px] text-center">
            {format(dates[0], 'MMM d')} - {format(dates[dates.length - 1], 'MMM d')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {dates.map((date) => {
          const isSelected = selectedDate && 
            format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isPast = isBefore(date, startOfDay(new Date()));
          const isTooFar = isBefore(maxDate, date);
          const isDisabled = isPast || isTooFar;

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDisabled && onSelectDate(date)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all min-h-[72px] sm:min-h-0",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                isDisabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent",
                isToday(date) && !isSelected && "border-primary/50"
              )}
            >
              <span className="text-[10px] sm:text-xs text-inherit opacity-70">
                {format(date, 'EEE')}
              </span>
              <span className="text-base sm:text-lg font-semibold">
                {format(date, 'd')}
              </span>
              <span className="text-[10px] sm:text-xs text-inherit opacity-70">
                {format(date, 'MMM')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
