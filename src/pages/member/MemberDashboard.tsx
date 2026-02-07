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
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Hours Booked',
      value: `${stats.hoursBooked}h`,
      icon: Clock,
      gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      label: 'Hours Played',
      value: `${stats.hoursPlayed}h`,
      icon: Trophy,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Pending Actions',
      value: stats.unpaidBookingsCount + stats.pendingPaymentsCount,
      icon: AlertCircle,
      gradient: stats.unpaidBookingsCount + stats.pendingPaymentsCount > 0 
        ? 'from-amber-500/20 via-amber-500/10 to-transparent' 
        : 'from-muted/20 via-muted/10 to-transparent',
      iconBg: stats.unpaidBookingsCount + stats.pendingPaymentsCount > 0 
        ? 'bg-amber-500/20' 
        : 'bg-muted/20',
      iconColor: stats.unpaidBookingsCount + stats.pendingPaymentsCount > 0 
        ? 'text-amber-400' 
        : 'text-muted-foreground',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout>
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Member Portal
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Player'}!
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Ready for your next game? Here's your tennis overview.
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 rounded-xl">
              <Link to="/member/bookings">
                <Plus className="w-4 h-4 mr-2" />
                Book Court
              </Link>
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-5 group`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pending Payments Alert */}
          {(unpaidBookings.length > 0 || pendingPayments.length > 0) && (
            <motion.div 
              variants={itemVariants}
              className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="font-display text-lg font-semibold">Payment Actions Required</h2>
              </div>

              <div className="space-y-4">
                {/* Unpaid Bookings - Need to submit payment */}
                {unpaidBookings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Unpaid Bookings ({unpaidBookings.length})
                    </h3>
                    <div className="space-y-2">
                      {unpaidBookings.slice(0, 3).map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50"
                        >
                          <div>
                            <p className="font-medium">
                              {format(new Date(booking.booking_date), 'MMM d, yyyy')} • {booking.start_time?.slice(0, 5)}
                            </p>
                            <p className="text-sm text-muted-foreground">
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
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            <Receipt className="w-4 h-4 mr-1" />
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
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending Verification ({pendingPayments.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingPayments.slice(0, 3).map((payment) => (
                        <div 
                          key={payment.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50"
                        >
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              Ref: {payment.transaction_reference} • {payment.description}
                            </p>
                          </div>
                          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold ring-1 ring-amber-500/20">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: '/member/bookings', label: 'Book Court', icon: Calendar, color: 'blue' },
                  { href: '/member/coaching', label: 'Book Coach', icon: Users, color: 'emerald' },
                  { href: '/member/payments', label: 'Payments', icon: CreditCard, color: 'amber' },
                  { href: '/profile', label: 'My Profile', icon: Target, color: 'primary' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  >
                    <div className={`p-2.5 rounded-xl bg-${action.color}-500/10 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-5 h-5 text-${action.color === 'primary' ? 'primary' : action.color + '-400'}`} />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Bookings */}
            <motion.div 
              variants={itemVariants}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="font-display text-lg font-semibold">Upcoming Bookings</h2>
                </div>
                <Link 
                  to="/member/bookings" 
                  className="flex items-center gap-2 text-sm text-primary font-medium hover:gap-3 transition-all"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="p-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-semibold">
                            {new Date(booking.booking_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)} • {booking.court?.name}
                          </p>
                        </div>
                        <div className="text-right flex flex-col gap-1">
                          <span className={`
                            inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize
                            ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : ''}
                            ${booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : ''}
                          `}>
                            {booking.status}
                          </span>
                          <span className={`
                            inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize
                            ${booking.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : ''}
                            ${booking.payment_status === 'unpaid' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : ''}
                          `}>
                            {booking.payment_status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">No upcoming bookings</p>
                    <Button asChild variant="link" className="mt-2 text-primary">
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
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent backdrop-blur-sm p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-semibold">Membership Status</h2>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`
                    inline-flex px-4 py-1.5 rounded-full text-sm font-semibold capitalize
                    ${profile?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : ''}
                    ${profile?.status === 'inactive' ? 'bg-muted text-muted-foreground' : ''}
                    ${profile?.status === 'suspended' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : ''}
                  `}>
                    {profile?.status || 'active'}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold ring-1 ring-blue-500/20 capitalize">
                    {profile?.membership_type?.replace('_', ' ') || 'Pay as you play'}
                  </span>
                </div>
              </div>
              {profile?.membership_end && (
                <div className="text-right p-4 rounded-xl bg-muted/30">
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-semibold text-lg">
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