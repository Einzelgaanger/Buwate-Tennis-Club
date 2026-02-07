import { useState, useEffect } from 'react';
import { Users, Search, Calendar, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, PRICING } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookingCalendar } from '@/components/booking/BookingCalendar';

type Profile = Database['public']['Tables']['profiles']['Row'];
type CoachingSession = Database['public']['Tables']['coaching_sessions']['Row'];
type CoachAvailability = Database['public']['Tables']['coach_availability']['Row'];

interface Coach extends Profile {
  role?: string;
}

export default function MemberCoaching() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [mySessions, setMySessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking state
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState('');
  const [sessionType, setSessionType] = useState<'private' | 'semi_private' | 'group'>('private');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch coaches with approved status
      const { data: coachRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'coach');

      if (coachRoles && coachRoles.length > 0) {
        const coachIds = coachRoles.map(r => r.user_id);
        const { data: coachProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', coachIds)
          .eq('approval_status', 'approved');

        if (coachProfiles) {
          setCoaches(coachProfiles);
        }
      }

      // Fetch my sessions
      if (user) {
        const { data: sessions } = await supabase
          .from('coaching_sessions')
          .select('*')
          .eq('student_id', user.id)
          .order('session_date', { ascending: false })
          .limit(5);

        if (sessions) {
          setMySessions(sessions);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (coachId: string, date: Date) => {
    try {
      const dayOfWeek = date.getDay();
      const dateStr = format(date, 'yyyy-MM-dd');

      // Get coach blocked times for this day (is_available = false means blocked)
      const { data: blockedTimes } = await supabase
        .from('coach_availability')
        .select('*')
        .eq('coach_id', coachId)
        .eq('is_available', false)
        .or(`date.eq.${dateStr},and(recurring.eq.weekly,day_of_week.eq.${dayOfWeek})`);

      // Get confirmed sessions for this coach on this date (also blocks time)
      const { data: confirmedSessions } = await supabase
        .from('coaching_sessions')
        .select('start_time, end_time')
        .eq('coach_id', coachId)
        .eq('session_date', dateStr)
        .eq('status', 'confirmed');

      // Generate all slots from 7am to 11pm (default available)
      const allSlots: string[] = [];
      for (let h = 7; h < 23; h++) {
        allSlots.push(`${h.toString().padStart(2, '0')}:00`);
      }

      // Filter out blocked times
      const blockedHours = new Set<string>();
      
      // Add blocked availability times
      if (blockedTimes) {
        blockedTimes.forEach((block: CoachAvailability) => {
          const startHour = parseInt(block.start_time.split(':')[0]);
          const endHour = parseInt(block.end_time.split(':')[0]);
          for (let h = startHour; h < endHour; h++) {
            blockedHours.add(`${h.toString().padStart(2, '0')}:00`);
          }
        });
      }

      // Add confirmed session times
      if (confirmedSessions) {
        confirmedSessions.forEach((session) => {
          const startHour = parseInt(session.start_time.split(':')[0]);
          const endHour = parseInt(session.end_time.split(':')[0]);
          for (let h = startHour; h < endHour; h++) {
            blockedHours.add(`${h.toString().padStart(2, '0')}:00`);
          }
        });
      }

      // Available slots = all slots minus blocked
      const availableSlots = allSlots.filter(slot => !blockedHours.has(slot));
      setAvailableSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Default to all slots on error
      const defaultSlots: string[] = [];
      for (let h = 7; h < 23; h++) {
        defaultSlots.push(`${h.toString().padStart(2, '0')}:00`);
      }
      setAvailableSlots(defaultSlots);
    }
  };

  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowBookingDialog(true);
    setBookingDate(null);
    setBookingTime('');
    setSessionType('private');
    setNotes('');
    setAvailableSlots([]);
  };

  const handleDateSelect = (date: Date) => {
    setBookingDate(date);
    setBookingTime('');
    if (selectedCoach) {
      fetchAvailability(selectedCoach.user_id, date);
    }
  };

  const handleSubmitBooking = async () => {
    if (!user || !profile || !selectedCoach || !bookingDate || !bookingTime) return;

    setSubmitting(true);

    try {
      const sessionDate = format(bookingDate, 'yyyy-MM-dd');
      const startTime = `${bookingTime}:00`;
      const endTime = `${(parseInt(bookingTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00:00`;
      
      const amount = sessionType === 'private' 
        ? PRICING.coaching.private 
        : sessionType === 'semi_private'
        ? PRICING.coaching.semiPrivate
        : PRICING.coaching.group;

      const { error } = await supabase
        .from('coaching_sessions')
        .insert({
          coach_id: selectedCoach.user_id,
          student_id: user.id,
          student_name: profile.full_name,
          student_phone: profile.phone || '',
          session_date: sessionDate,
          start_time: startTime,
          end_time: endTime,
          session_type: sessionType,
          amount: amount,
          notes: notes || null,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Session requested!",
        description: "The coach will review your request and respond soon.",
      });

      setShowBookingDialog(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCoaches = coaches.filter((coach) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      coach.full_name.toLowerCase().includes(query) ||
      coach.bio?.toLowerCase().includes(query) ||
      coach.specialties?.some(s => s.toLowerCase().includes(query))
    );
  });

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Coaching</h1>
            <p className="text-muted-foreground mt-1">
              Book sessions with our professional coaches
            </p>
          </div>

          {/* My Sessions */}
          {mySessions.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-semibold">My Sessions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySessions.map((session) => (
                  <div key={session.id} className="dashboard-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {format(new Date(session.session_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.start_time?.slice(0, 5)} • {session.session_type}
                        </p>
                      </div>
                      <span className={`
                        inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${session.status === 'confirmed' ? 'bg-primary/10 text-primary' : ''}
                        ${session.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                        ${session.status === 'completed' ? 'bg-muted text-muted-foreground' : ''}
                        ${session.status === 'rejected' ? 'bg-destructive/10 text-destructive' : ''}
                      `}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search coaches..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredCoaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCoaches.map((coach) => (
                <div key={coach.id} className="dashboard-card">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {coach.avatar_url ? (
                        <img 
                          src={coach.avatar_url} 
                          alt={coach.full_name} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold">{coach.full_name}</h3>
                      {coach.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {coach.bio}
                        </p>
                      )}
                      {coach.specialties && coach.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {coach.specialties.slice(0, 3).map((specialty) => (
                            <span key={specialty} className="badge-primary">{specialty}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          From {formatCurrency(coach.hourly_rate || PRICING.coaching.private)}/hr
                        </div>
                        <Button onClick={() => handleSelectCoach(coach)}>
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No coaches available</h3>
              <p className="text-muted-foreground">Check back soon for available coaches.</p>
            </div>
          )}
        </div>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Session with {selectedCoach?.full_name}</DialogTitle>
              <DialogDescription>
                Select a date and time for your coaching session
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <BookingCalendar
                selectedDate={bookingDate}
                onSelectDate={handleDateSelect}
                maxDaysAhead={14}
              />

              {bookingDate && (
                <>
                  <div className="space-y-2">
                    <Label>Time Slot</Label>
                    <Select value={bookingTime} onValueChange={setBookingTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Type</Label>
                    <Select value={sessionType} onValueChange={(v: any) => setSessionType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private (1-on-1) - {formatCurrency(PRICING.coaching.private)}/hr</SelectItem>
                        <SelectItem value="semi_private">Semi-Private (2 students) - {formatCurrency(PRICING.coaching.semiPrivate)}/hr each</SelectItem>
                        <SelectItem value="group">Group (3-4 students) - {formatCurrency(PRICING.coaching.group)}/hr each</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="Any specific areas you want to work on..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitBooking}
                disabled={!bookingDate || !bookingTime || submitting}
                className="btn-primary"
              >
                {submitting ? 'Submitting...' : 'Request Session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
