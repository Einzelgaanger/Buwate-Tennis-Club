import { useState, useEffect } from 'react';
import { MapPin, Sun, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Court = Database['public']['Tables']['courts']['Row'];

interface CourtSelectorProps {
  selectedCourtId: string | null;
  onSelectCourt: (courtId: string) => void;
}

export function CourtSelector({ selectedCourtId, onSelectCourt }: CourtSelectorProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourts = async () => {
      const { data } = await supabase
        .from('courts')
        .select('*')
        .eq('status', 'active')
        .order('name');

      setCourts(data || []);
      setLoading(false);

      // Auto-select first court if none selected
      if (data && data.length > 0 && !selectedCourtId) {
        onSelectCourt(data[0].id);
      }
    };

    fetchCourts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Select Court</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No courts available at this time.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Select Court</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => onSelectCourt(court.id)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              selectedCourtId === court.id
                ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-lg">{court.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {court.surface} Surface
                </p>
              </div>
              <div className="flex gap-1">
                {court.has_floodlights && (
                  <div className="p-2 rounded-lg bg-gold/10" title="Floodlights available">
                    <Lightbulb className="w-4 h-4 text-gold" />
                  </div>
                )}
              </div>
            </div>
            {court.description && (
              <p className="text-sm text-muted-foreground">{court.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
