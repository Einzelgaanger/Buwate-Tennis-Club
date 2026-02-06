import { Calendar, Filter, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Session = Database['public']['Tables']['coaching_sessions']['Row'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CoachSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('coach_id', user!.id)
        .order('session_date', { ascending: false });

      if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['coach']}>
      <DashboardLayout>
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Session Management
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Sessions
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                View and manage your coaching sessions
              </p>
            </div>
            <Button variant="outline" className="rounded-xl border-border/50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </motion.div>

          {/* Sessions List */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <motion.div 
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{session.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.session_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })} • {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize mt-1">{session.session_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(session.amount || 0)}</p>
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold capitalize mt-2 ${getStatusStyles(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2">No sessions yet</h3>
                <p className="text-muted-foreground text-lg">Your coaching sessions will appear here.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
