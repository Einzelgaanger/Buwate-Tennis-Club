import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, CreditCard, ArrowRight, Plus, Trophy, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

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

export default function MemberDashboard() {
  const { profile, user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    hoursPlayed: 0,
    pendingPayments: 0,
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
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user!.id)
        .gte('booking_date', today)
        .order('booking_date', { ascending: true })
        .limit(5);

      if (bookings) {
        setUpcomingBookings(bookings);
      }

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

      const { count: pendingPayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'pending');

      setStats({
        totalBookings: totalBookings || 0,
        hoursPlayed: Math.round(hoursPlayed),
        pendingPayments: pendingPayments || 0,
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
      label: 'Hours Played',
      value: `${stats.hoursPlayed}h`,
      icon: Clock,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPayments,
      icon: CreditCard,
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
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
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-6 group`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

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
                            {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`
                            inline-flex px-3 py-1.5 rounded-full text-xs font-semibold capitalize
                            ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : ''}
                            ${booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : ''}
                            ${booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : ''}
                          `}>
                            {booking.status}
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
