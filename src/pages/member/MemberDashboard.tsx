import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, CreditCard, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'];

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
      // Fetch upcoming bookings
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

      // Fetch stats
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

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Player'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Ready for your next game? Here's your tennis overview.
              </p>
            </div>
            <Button asChild className="btn-primary">
              <Link to="/member/bookings">
                <Plus className="w-4 h-4 mr-2" />
                Book Court
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.totalBookings}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.hoursPlayed}h</p>
                  <p className="text-sm text-muted-foreground">Hours Played</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pendingPayments}</p>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Upcoming Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="dashboard-card">
              <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: '/member/bookings', label: 'Book Court', icon: Calendar },
                  { href: '/member/coaching', label: 'Book Coach', icon: Users },
                  { href: '/member/payments', label: 'Payments', icon: CreditCard },
                  { href: '/profile', label: 'My Profile', icon: Users },
                ].map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors"
                  >
                    <action.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Upcoming Bookings</h2>
                <Link 
                  to="/member/bookings" 
                  className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">
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
                          inline-flex px-2 py-1 rounded-full text-xs font-medium
                          ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : ''}
                          ${booking.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                          ${booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : ''}
                        `}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No upcoming bookings</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/member/bookings">Book your first court</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Membership Status */}
          <div className="dashboard-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold mb-1">Membership Status</h2>
                <div className="flex items-center gap-3">
                  <span className={`
                    inline-flex px-3 py-1 rounded-full text-sm font-medium
                    ${profile?.status === 'active' ? 'bg-primary/10 text-primary' : ''}
                    ${profile?.status === 'inactive' ? 'bg-muted text-muted-foreground' : ''}
                    ${profile?.status === 'suspended' ? 'bg-destructive/10 text-destructive' : ''}
                  `}>
                    {profile?.status || 'active'}
                  </span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {profile?.membership_type?.replace('_', ' ') || 'Pay as you play'}
                  </span>
                </div>
              </div>
              {profile?.membership_end && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">
                    {new Date(profile.membership_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
