import { CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';

export default function CoachEarnings() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    totalEarnings: 0,
    sessionsCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEarnings();
    }
  }, [user]);

  const fetchEarnings = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

      const { data: thisMonthData } = await supabase
        .from('coaching_sessions')
        .select('amount')
        .eq('coach_id', user!.id)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        .gte('session_date', startOfMonth);

      const { data: lastMonthData } = await supabase
        .from('coaching_sessions')
        .select('amount')
        .eq('coach_id', user!.id)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        .gte('session_date', startOfLastMonth)
        .lte('session_date', endOfLastMonth);

      const { data: allData } = await supabase
        .from('coaching_sessions')
        .select('amount')
        .eq('coach_id', user!.id)
        .eq('status', 'completed')
        .eq('payment_status', 'paid');

      const { count: sessionsCount } = await supabase
        .from('coaching_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', user!.id)
        .eq('status', 'completed');

      setStats({
        thisMonth: thisMonthData?.reduce((acc, s) => acc + (s.amount || 0), 0) || 0,
        lastMonth: lastMonthData?.reduce((acc, s) => acc + (s.amount || 0), 0) || 0,
        totalEarnings: allData?.reduce((acc, s) => acc + (s.amount || 0), 0) || 0,
        sessionsCompleted: sessionsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['coach']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Earnings</h1>
            <p className="text-muted-foreground mt-1">
              Track your coaching income and sessions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.thisMonth)}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.lastMonth)}</p>
                  <p className="text-sm text-muted-foreground">Last Month</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.totalEarnings)}</p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.sessionsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Sessions Done</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="font-display text-lg font-semibold mb-4">Earnings History</h3>
            <p className="text-muted-foreground text-center py-8">
              Detailed earnings breakdown coming soon...
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
