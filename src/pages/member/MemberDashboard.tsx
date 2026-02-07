import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, CreditCard, ArrowRight, Plus, Trophy, Target, Sparkles, AlertCircle, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

interface BookingWithCourt extends Booking {
  court?: { name: string };
}

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

export default function MemberDashboard() {
  const { profile, user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithCourt[]>([]);
  const [unpaidBookings, setUnpaidBookings] = useState<BookingWithCourt[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    hoursPlayed: 0,
    hoursBooked: 0,
    pendingPaymentsCount: 0,
    unpaidBookingsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    bookingId?: string;
    amount?: number;
    description?: string;
  }>({ open: false });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch upcoming bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, court:courts(name)')
        .eq('user_id', user!.id)
        .gte('booking_date', today)
        .neq('status', 'cancelled')
        .order('booking_date', { ascending: true })
        .limit(5);

      if (bookings) {
        setUpcomingBookings(bookings as BookingWithCourt[]);
      }

      // Fetch unpaid bookings (no payment submitted yet)
      const { data: unpaid } = await supabase
        .from('bookings')
        .select('*, court:courts(name)')
        .eq('user_id', user!.id)
        .eq('payment_status', 'unpaid')
        .neq('status', 'cancelled')
        .gte('booking_date', today)
        .order('booking_date', { ascending: true });

      if (unpaid) {
        setUnpaidBookings(unpaid as BookingWithCourt[]);
      }

      // Fetch pending verification payments
      const { data: pending } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pending) {
        setPendingPayments(pending);
      }

      // Stats
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      const { data: completedBookings } = await supabase
        .from('bookings')
        .select('duration_minutes')
        .eq('user_id', user!.id)
        .eq('status', 'completed');

      const hoursPlayed = completedBookings 
        ? completedBookings.reduce((acc, b) => acc + (b.duration_minutes || 60), 0) / 60 
        : 0;

      // Hours booked (upcoming)
      const { data: upcomingForHours } = await supabase
        .from('bookings')
        .select('duration_minutes')
        .eq('user_id', user!.id)
        .gte('booking_date', today)
        .neq('status', 'cancelled');

      const hoursBooked = upcomingForHours 
        ? upcomingForHours.reduce((acc, b) => acc + (b.duration_minutes || 60), 0) / 60 
        : 0;

      setStats({
        totalBookings: totalBookings || 0,
        hoursPlayed: Math.round(hoursPlayed),
        hoursBooked: Math.round(hoursBooked * 10) / 10,
        pendingPaymentsCount: pending?.length || 0,
        unpaidBookingsCount: unpaid?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      gradient: 'from-blue-500/25 via-blue-500/12 to-transparent',
      iconBg: 'bg-blue-500/25',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Hours Booked',
      value: `${stats.hoursBooked}h`,
      icon: Clock,
      gradient: 'from-purple-500/25 via-purple-500/12 to-transparent',
      iconBg: 'bg-purple-500/25',
      iconColor: 'text-purple-400',
    },
    {
      label: 'Hours Played',
      value: `${stats.hoursPlayed}h`,
      icon: Trophy,
      gradient: 'from-emerald-500/25 via-emerald-500/12 to-transparent',
      iconBg: 'bg-emerald-500/25',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Pending Actions',
      value: stats.unpaidBookingsCount + stats.pendingPaymentsCount,
      icon: AlertCircle,
      gradient: stats.unpaidBookingsCount + stats.pendingPaymentsCount > 0 
        ? 'from-amber-500/25 via-amber-500/12 to-transparent' 
        : 'from-muted/25 via-muted/12 to-transparent',
      iconBg: stats.unpaidBookingsCount + stats.pendingPaymentsCount > 0 
        ? 'bg-amber-500/25' 
        : 'bg-muted/25',
      iconColor: stats.unpaidBookingsCount + stats.pendingPaymentsCount > 0 
        ? 'text-amber-400' 
        : 'text-muted-foreground',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['member']}>
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
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/15 text-primary text-[10px] sm:text-xs font-semibold">
                  Member Portal
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
                {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Player'}!
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base md:text-lg">
                Ready for your next game? Here's your tennis overview.
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto shrink-0 h-10 sm:h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 rounded-xl text-sm sm:text-base">
              <Link to="/member/bookings">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Book Court
              </Link>
            </Button>
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
                <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl shrink-0 ${stat.iconBg}`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground truncate">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pending Payments Alert */}
          {(unpaidBookings.length > 0 || pendingPayments.length > 0) && (
            <motion.div 
              variants={itemVariants}
              className="rounded-xl sm:rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/12 via-amber-500/8 to-transparent p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/25">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <h2 className="font-display text-base sm:text-lg font-semibold">Payment Actions Required</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Unpaid Bookings - Need to submit payment */}
                {unpaidBookings.length > 0 && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Unpaid Bookings ({unpaidBookings.length})
                    </h3>
                    <div className="space-y-2">
                      {unpaidBookings.slice(0, 3).map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-background/50 border border-border/50"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm sm:text-base">
                              {format(new Date(booking.booking_date), 'MMM d, yyyy')} • {booking.start_time?.slice(0, 5)}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {booking.court?.name || 'Court'} • {formatCurrency(booking.amount || 0)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setPaymentModal({
                              open: true,
                              bookingId: booking.id,
                              amount: booking.amount || 0,
                              description: `Court booking - ${format(new Date(booking.booking_date), 'MMM d, yyyy')} at ${booking.start_time?.slice(0, 5)}`
                            })}
                            className="w-full sm:w-auto shrink-0 h-9 sm:h-9 bg-amber-500 hover:bg-amber-600 text-white text-sm"
                          >
                            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                            Submit Payment
                          </Button>
                        </div>
                      ))}
                      {unpaidBookings.length > 3 && (
                        <Link 
                          to="/member/payments" 
                          className="block text-center text-sm text-primary hover:underline py-2"
                        >
                          View all {unpaidBookings.length} unpaid bookings
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Pending Verification */}
                {pendingPayments.length > 0 && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Pending Verification ({pendingPayments.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingPayments.slice(0, 3).map((payment) => (
                        <div 
                          key={payment.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-background/60 border border-border"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm sm:text-base">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Ref: {payment.transaction_reference} • {payment.description}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold ring-1 ring-amber-500/25 shrink-0 w-fit">
                            Awaiting Admin
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Actions & Upcoming Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/20">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h2 className="font-display text-base sm:text-lg font-semibold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {[
                  { href: '/member/bookings', label: 'Book Court', icon: Calendar, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400' },
                  { href: '/member/coaching', label: 'Book Coach', icon: Users, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
                  { href: '/member/payments', label: 'Payments', icon: CreditCard, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
                  { href: '/profile', label: 'My Profile', icon: Target, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 min-h-[44px] sm:min-h-0"
                  >
                    <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${action.iconBg} group-hover:scale-110 transition-transform shrink-0`}>
                      <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.iconColor}`} />
                    </div>
                    <span className="font-medium text-sm sm:text-base truncate">{action.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Bookings */}
            <motion.div 
              variants={itemVariants}
              className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/20 shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-semibold truncate">Upcoming Bookings</h2>
                </div>
                <Link 
                  to="/member/bookings" 
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
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {upcomingBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base">
                            {new Date(booking.booking_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)} • {booking.court?.name}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:flex-col sm:flex-nowrap sm:text-right sm:gap-1">
                          <span className={`
                            inline-flex px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize
                            ${booking.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25' : ''}
                            ${booking.status === 'pending' ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25' : ''}
                          `}>
                            {booking.status}
                          </span>
                          <span className={`
                            inline-flex px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize
                            ${booking.payment_status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25' : ''}
                            ${booking.payment_status === 'unpaid' ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/25' : ''}
                          `}>
                            {booking.payment_status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">No upcoming bookings</p>
                    <Button asChild variant="link" className="mt-2 text-primary text-sm sm:text-base">
                      <Link to="/member/bookings">Book your first court</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Membership Status */}
          <motion.div 
            variants={itemVariants}
            className="rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-semibold">Membership Status</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                  <span className={`
                    inline-flex px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize
                    ${profile?.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25' : ''}
                    ${profile?.status === 'inactive' ? 'bg-muted text-muted-foreground' : ''}
                    ${profile?.status === 'suspended' ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/25' : ''}
                  `}>
                    {profile?.status || 'active'}
                  </span>
                  <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-500/15 text-blue-400 text-xs sm:text-sm font-semibold ring-1 ring-blue-500/25 capitalize">
                    {profile?.membership_type?.replace('_', ' ') || 'Pay as you play'}
                  </span>
                </div>
              </div>
              {profile?.membership_end && (
                <div className="text-left md:text-right p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50 shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Expires</p>
                  <p className="font-semibold text-base sm:text-lg">
                    {new Date(profile.membership_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        <PaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal({ open: false })}
          onSuccess={fetchDashboardData}
          bookingId={paymentModal.bookingId}
          amount={paymentModal.amount}
          description={paymentModal.description}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}