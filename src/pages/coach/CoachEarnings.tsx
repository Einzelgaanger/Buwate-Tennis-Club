import { CreditCard, TrendingUp, Calendar, Activity, ArrowUpRight, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';

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

  const growthPercent = stats.lastMonth > 0 
    ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
    : 0;

  const statCards = [
    {
      label: 'This Month',
      value: formatCurrency(stats.thisMonth),
      icon: CreditCard,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      trend: growthPercent > 0 ? `+${growthPercent}%` : `${growthPercent}%`,
      trendUp: growthPercent >= 0,
    },
    {
      label: 'Last Month',
      value: formatCurrency(stats.lastMonth),
      icon: Wallet,
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      icon: TrendingUp,
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Sessions Done',
      value: stats.sessionsCompleted,
      icon: Calendar,
      gradient: 'from-primary/20 via-primary/10 to-transparent',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
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
                Financial Overview
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
              Earnings
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
              Track your coaching income and sessions
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-3 sm:p-4 md:p-5 group`}
              >
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex flex-col sm:block">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl shrink-0 ${stat.iconBg}`}>
                      <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                    </div>
                    {stat.trend && (
                      <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold shrink-0 ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stat.trendUp && <ArrowUpRight className="w-3 h-3" />}
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-foreground truncate">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-tight">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Earnings Chart Placeholder */}
          <motion.div 
            variants={itemVariants}
            className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-semibold">Earnings History</h3>
            </div>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">Detailed earnings breakdown coming soon...</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Track your weekly and monthly trends</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
