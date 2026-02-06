import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, CreditCard, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type CoachingSession = Database['public']['Tables']['coaching_sessions']['Row'];

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

      // Fetch pending session requests
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

      // Fetch today's sessions
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

      // Fetch stats
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

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['coach']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Coach Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your sessions and availability
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pendingRequests}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.monthlyEarnings)}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Sessions */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Today's Sessions</h2>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : todaySessions.length > 0 ? (
                <div className="space-y-3">
                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{session.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)} • {session.session_type}
                        </p>
                      </div>
                      <span className="badge-primary capitalize">{session.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No sessions today</p>
                </div>
              )}
            </div>

            {/* Pending Requests */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Pending Requests</h2>
                <Link 
                  to="/coach/sessions" 
                  className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : pendingSessions.length > 0 ? (
                <div className="space-y-3">
                  {pendingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl bg-muted/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{session.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.session_date).toLocaleDateString()} • {session.start_time?.slice(0, 5)}
                          </p>
                        </div>
                        <span className="badge-gold capitalize">{session.session_type}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSessionAction(session.id, 'confirmed')}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSessionAction(session.id, 'rejected')}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: '/coach/availability', label: 'Set Availability', icon: Clock },
                { href: '/coach/sessions', label: 'All Sessions', icon: Calendar },
                { href: '/coach/earnings', label: 'View Earnings', icon: CreditCard },
                { href: '/profile', label: 'Edit Profile', icon: Users },
              ].map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors"
                >
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
