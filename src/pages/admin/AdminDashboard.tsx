import { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

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

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeBookings: 0,
    pendingPaymentsCount: 0,
    pendingPaymentsAmount: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (payments) {
        setPendingPayments(payments);
      }

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', today)
        .order('start_time', { ascending: true });

      if (bookings) {
        setTodaysBookings(bookings);
      }

      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('booking_date', today)
        .in('status', ['pending', 'confirmed']);

      const { data: pendingPaymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      const pendingPaymentsAmount = pendingPaymentsData 
        ? pendingPaymentsData.reduce((acc, p) => acc + (p.amount || 0), 0)
        : 0;

      const { data: revenueData } = await supabase
        .from('revenue_entries')
        .select('amount')
        .gte('entry_date', startOfMonth);

      const monthlyRevenue = revenueData 
        ? revenueData.reduce((acc, r) => acc + (r.amount || 0), 0)
        : 0;

      setStats({
        totalMembers: totalMembers || 0,
        activeBookings: activeBookings || 0,
        pendingPaymentsCount: pendingPaymentsData?.length || 0,
        pendingPaymentsAmount,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, action: 'verified' | 'rejected') => {
    try {
      await supabase
        .from('payments')
        .update({ 
          status: action,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const statCards = [
    {
      label: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Active Bookings',
      value: stats.activeBookings,
      icon: Calendar,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPaymentsCount,
      icon: CreditCard,
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      trend: formatCurrency(stats.pendingPaymentsAmount),
      trendUp: false,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      icon: TrendingUp,
      gradient: 'from-primary/20 via-primary/10 to-transparent',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
      trend: '+23%',
      trendUp: true,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <motion.div 
          className="space-y-5 sm:space-y-6 md:space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/25 to-primary/10">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-semibold">
                  Admin Dashboard
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
                Welcome back, {profile?.full_name?.split(' ')[0]}
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
                Here's your club overview for today
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {statCards.map((stat, index) => (
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
                    {stat.trendUp !== undefined && (
                      <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium shrink-0 ${stat.trendUp ? 'text-emerald-400' : 'text-muted-foreground'}`}>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Today's Bookings */}
            <motion.div 
              variants={itemVariants}
              className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/20 shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-semibold truncate">Today's Bookings</h2>
                </div>
                <Link 
                  to="/admin/bookings" 
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary font-medium hover:gap-2 sm:hover:gap-3 transition-all shrink-0"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>

              <div className="p-3 sm:p-4">
                {loading ? (
                  <div className="space-y-2 sm:space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 sm:h-16 bg-muted/50 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : todaysBookings.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-auto scrollbar-thin">
                    {todaysBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base">
                              {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                              {booking.booking_type?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <span className={`
                          inline-flex px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize shrink-0 w-fit
                          ${booking.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25' : ''}
                          ${booking.status === 'pending' ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25' : ''}
                          ${booking.status === 'completed' ? 'bg-muted text-muted-foreground' : ''}
                        `}>
                          {booking.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">No bookings today</p>
                    <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">Courts are available!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pending Payments */}
            <motion.div 
              variants={itemVariants}
              className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/20 shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-semibold truncate">Pending Payments</h2>
                </div>
                <Link 
                  to="/admin/payments" 
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary font-medium hover:gap-2 sm:hover:gap-3 transition-all shrink-0"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>

              <div className="p-3 sm:p-4">
                {loading ? (
                  <div className="space-y-2 sm:space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 sm:h-24 bg-muted/50 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : pendingPayments.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-auto scrollbar-thin">
                    {pendingPayments.map((payment, index) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors space-y-2 sm:space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-base sm:text-lg truncate">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Ref: {payment.transaction_reference || 'N/A'}
                            </p>
                          </div>
                          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] sm:text-xs font-semibold ring-1 ring-amber-500/25 shrink-0 w-fit">
                            Pending
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyPayment(payment.id, 'verified')}
                            className="flex-1 h-9 sm:h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                            className="flex-1 h-9 sm:h-9 rounded-lg sm:rounded-xl border-border/50 text-xs sm:text-sm"
                          >
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">No pending payments</p>
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
                { href: '/admin/bookings', label: 'Manage Bookings', icon: Calendar, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
                { href: '/admin/members', label: 'Manage Members', icon: Users, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
                { href: '/admin/payments', label: 'Verify Payments', icon: CreditCard, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
                { href: '/admin/financials', label: 'View Financials', icon: TrendingUp, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
              ].map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 min-h-[44px] sm:min-h-0"
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
