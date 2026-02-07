import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, CreditCard, CheckCircle, XCircle, ArrowRight, Sparkles, Activity, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type CoachingSession = Database['public']['Tables']['coaching_sessions']['Row'];

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

export default function CoachDashboard() {
  const { profile, user } = useAuth();
  const [pendingSessions, setPendingSessions] = useState<CoachingSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<CoachingSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    pendingRequests: 0,
    monthlyEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];

      const { data: pending } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('coach_id', user!.id)
        .eq('status', 'pending')
        .order('session_date', { ascending: true })
        .limit(5);

      if (pending) {
        setPendingSessions(pending);
      }

      const { data: todayData } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('coach_id', user!.id)
        .eq('session_date', today)
        .in('status', ['confirmed', 'completed'])
        .order('start_time', { ascending: true });

      if (todayData) {
        setTodaySessions(todayData);
      }

      const { count: totalSessions } = await supabase
        .from('coaching_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user!.id)
        .eq('status', 'completed');

      const { count: pendingRequests } = await supabase
        .from('coaching_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user!.id)
        .eq('status', 'pending');

      const { data: monthlyData } = await supabase
        .from('coaching_sessions')
        .select('amount')
        .eq('coach_id', user!.id)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        .gte('session_date', startOfMonth);

      const monthlyEarnings = monthlyData 
        ? monthlyData.reduce((acc, s) => acc + (s.amount || 0), 0)
        : 0;

      setStats({
        totalSessions: totalSessions || 0,
        pendingRequests: pendingRequests || 0,
        monthlyEarnings,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId: string, action: 'confirmed' | 'rejected') => {
    try {
      await supabase
        .from('coaching_sessions')
        .update({ 
          status: action,
          rejection_reason: action === 'rejected' ? 'Schedule conflict' : null
        })
        .eq('id', sessionId);

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Sessions',
      value: stats.totalSessions,
      icon: Calendar,
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      label: 'This Month',
      value: formatCurrency(stats.monthlyEarnings),
      icon: CreditCard,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
  ];

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
          <motion.div variants={itemVariants} className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/25 to-primary/10">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-semibold">
                Coach Portal
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
              Coach Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
              Manage your sessions and availability
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-3 sm:p-4 md:p-5 group`}
              >
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-2 sm:gap-4">
                  <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl shrink-0 ${stat.iconBg}`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-foreground truncate">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Today's Sessions */}
            <motion.div 
              variants={itemVariants}
              className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/20 shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-semibold truncate">Today's Sessions</h2>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {loading ? (
                  <div className="space-y-2 sm:space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 sm:h-16 bg-muted/50 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : todaySessions.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {todaySessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{session.student_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)} • {session.session_type}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] sm:text-xs font-semibold ring-1 ring-emerald-500/25 capitalize shrink-0 w-fit">
                          {session.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">No sessions today</p>
                    <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">Enjoy your day off!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pending Requests */}
            <motion.div 
              variants={itemVariants}
              className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/20 shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-semibold truncate">Pending Requests</h2>
                </div>
                <Link 
                  to="/coach/sessions" 
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary font-medium hover:gap-2 sm:hover:gap-3 transition-all shrink-0"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>

              <div className="p-3 sm:p-4">
                {loading ? (
                  <div className="space-y-2 sm:space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 sm:h-28 bg-muted/50 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : pendingSessions.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {pendingSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors space-y-2 sm:space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">{session.student_name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {new Date(session.session_date).toLocaleDateString()} • {session.start_time?.slice(0, 5)}
                            </p>
                          </div>
                          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] sm:text-xs font-semibold ring-1 ring-amber-500/25 capitalize shrink-0 w-fit">
                            {session.session_type}
                          </span>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSessionAction(session.id, 'confirmed')}
                            className="flex-1 h-9 sm:h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSessionAction(session.id, 'rejected')}
                            className="flex-1 h-9 sm:h-9 rounded-lg sm:rounded-xl border-border/50 text-xs sm:text-sm"
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Decline
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">No pending requests</p>
                    <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">All caught up!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/20 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h2 className="font-display text-base sm:text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              {[
                { href: '/coach/availability', label: 'Set Availability', icon: Clock, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
                { href: '/coach/sessions', label: 'All Sessions', icon: Calendar, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
                { href: '/coach/earnings', label: 'View Earnings', icon: CreditCard, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
                { href: '/profile', label: 'Edit Profile', icon: Target, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
              ].map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 min-h-[44px] sm:min-h-0"
                >
                  <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 ${action.iconBg} group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.iconColor}`} />
                  </div>
                  <span className="font-medium text-xs sm:text-sm truncate">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
