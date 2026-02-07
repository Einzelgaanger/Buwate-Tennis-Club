import { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, Sparkles, X, Ban, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parse, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CLUB_INFO } from '@/lib/constants';
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

type CoachAvailability = Database['public']['Tables']['coach_availability']['Row'];
type CoachingSession = Database['public']['Tables']['coaching_sessions']['Row'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Generate time slots from 7am to 11pm
const generateTimeOptions = () => {
  const slots: string[] = [];
  for (let hour = CLUB_INFO.startHour; hour < CLUB_INFO.endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export default function CoachAvailability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockedTimes, setBlockedTimes] = useState<CoachAvailability[]>([]);
  const [pendingSessions, setPendingSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Block time modal
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockDate, setBlockDate] = useState<Date | null>(null);
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [blockNotes, setBlockNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch blocked times (is_available = false)
      const { data: blocked } = await supabase
        .from('coach_availability')
        .select('*')
        .eq('coach_id', user!.id)
        .eq('is_available', false)
        .order('date', { ascending: true });

      if (blocked) {
        setBlockedTimes(blocked);
      }

      // Fetch pending sessions for this coach
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('coach_id', user!.id)
        .eq('status', 'pending')
        .order('session_date', { ascending: true });

      if (sessions) {
        setPendingSessions(sessions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTime = async () => {
    if (!user || !blockDate || !blockStartTime || !blockEndTime) return;

    setSubmitting(true);

    try {
      const dateStr = format(blockDate, 'yyyy-MM-dd');
      const dayOfWeek = blockDate.getDay();

      const insertData: any = {
        coach_id: user.id,
        date: dateStr,
        start_time: `${blockStartTime}:00`,
        end_time: `${blockEndTime}:00`,
        is_available: false,
        notes: blockNotes || null,
        recurring: isRecurring ? 'weekly' : 'none',
        day_of_week: isRecurring ? dayOfWeek : null,
      };

      const { error } = await supabase
        .from('coach_availability')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Time blocked",
        description: isRecurring 
          ? `Blocked every ${format(blockDate, 'EEEE')} from ${blockStartTime} to ${blockEndTime}`
          : `Blocked ${format(blockDate, 'MMM d, yyyy')} from ${blockStartTime} to ${blockEndTime}`,
      });

      setShowBlockDialog(false);
      resetBlockForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to block time",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('coach_availability')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      toast({
        title: "Block removed",
        description: "Time slot is now available for bookings.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to remove block",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSessionAction = async (sessionId: string, action: 'confirmed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('coaching_sessions')
        .update({ status: action })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: action === 'confirmed' ? "Session confirmed" : "Session rejected",
        description: action === 'confirmed' 
          ? "The student will be notified of your confirmation."
          : "The student will be notified that the session was declined.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetBlockForm = () => {
    setBlockDate(null);
    setBlockStartTime('');
    setBlockEndTime('');
    setBlockNotes('');
    setIsRecurring(false);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Group blocked times by date
  const groupedBlocks = blockedTimes.reduce((acc, block) => {
    const key = block.recurring === 'weekly' 
      ? `weekly-${block.day_of_week}` 
      : block.date || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(block);
    return acc;
  }, {} as Record<string, CoachAvailability[]>);

  return (
    <ProtectedRoute allowedRoles={['coach']}>
      <DashboardLayout>
        <motion.div 
          className="space-y-5 sm:space-y-6 md:space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/25 to-primary/10">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-semibold">
                  Schedule Management
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
                Availability
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
                By default, you're available {CLUB_INFO.startHour}:00 AM - {CLUB_INFO.endHour > 12 ? CLUB_INFO.endHour - 12 : CLUB_INFO.endHour}:00 PM. Block times when you're unavailable.
              </p>
            </div>
            <Button 
              onClick={() => setShowBlockDialog(true)}
              className="w-full sm:w-auto h-10 sm:h-11 bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-lg shadow-destructive/20 rounded-xl shrink-0"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block Time
            </Button>
          </motion.div>

          {/* Pending Session Requests */}
          {pendingSessions.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-display text-xl font-semibold">Pending Session Requests</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
                  {pendingSessions.length}
                </span>
              </div>
              <div className="space-y-3">
                {pendingSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{session.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.session_date), 'EEE, MMM d, yyyy')} • {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {session.session_type?.replace('_', ' ')} session
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSessionAction(session.id, 'rejected')}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSessionAction(session.id, 'confirmed')}
                          className="bg-primary"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-muted-foreground mt-3 pl-16">
                        Note: {session.notes}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Blocked Times */}
          <motion.div variants={itemVariants}>
            <h2 className="font-display text-xl font-semibold mb-4">Blocked Times</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : Object.keys(groupedBlocks).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(groupedBlocks).map(([key, blocks]) => (
                  <div key={key}>
                    {blocks.map((block) => (
                      <motion.div
                        key={block.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center justify-between hover:border-destructive/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Ban className="w-6 h-6 text-destructive" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {block.recurring === 'weekly' 
                                ? `Every ${days[block.day_of_week || 0]}`
                                : format(new Date(block.date!), 'EEE, MMM d, yyyy')
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {block.start_time?.slice(0, 5)} - {block.end_time?.slice(0, 5)}
                            </p>
                            {block.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{block.notes}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveBlock(block.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-border/50 bg-card/50">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">No blocked times</h3>
                <p className="text-muted-foreground">
                  You're available for all hours ({CLUB_INFO.startHour}:00 AM - {CLUB_INFO.endHour > 12 ? CLUB_INFO.endHour - 12 : CLUB_INFO.endHour}:00 PM)
                </p>
              </div>
            )}
          </motion.div>

          {/* Info Card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent backdrop-blur-sm p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">How it works</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• By default, you're available from {CLUB_INFO.startHour}:00 AM to {CLUB_INFO.endHour > 12 ? CLUB_INFO.endHour - 12 : CLUB_INFO.endHour}:00 PM every day</li>
                  <li>• Block specific times when you're not available for sessions</li>
                  <li>• When a student books a session, it will appear in your pending requests</li>
                  <li>• Confirm or decline requests — confirmed sessions automatically block that time</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Block Time Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Block Time</DialogTitle>
              <DialogDescription>
                Mark a time slot as unavailable for coaching sessions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <BookingCalendar
                selectedDate={blockDate}
                onSelectDate={setBlockDate}
                maxDaysAhead={90}
              />

              {blockDate && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select value={blockStartTime} onValueChange={setBlockStartTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Start" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Select value={blockEndTime} onValueChange={setBlockEndTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="End" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.filter(t => t > blockStartTime).map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <Label htmlFor="recurring" className="cursor-pointer">
                      Repeat every {blockDate ? format(blockDate, 'EEEE') : 'week'}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason (optional)</Label>
                    <Textarea
                      placeholder="e.g., Personal commitment, Training..."
                      value={blockNotes}
                      onChange={(e) => setBlockNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowBlockDialog(false); resetBlockForm(); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleBlockTime}
                disabled={!blockDate || !blockStartTime || !blockEndTime || submitting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {submitting ? 'Blocking...' : 'Block Time'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
