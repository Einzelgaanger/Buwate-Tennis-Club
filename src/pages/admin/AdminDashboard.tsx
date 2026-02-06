import { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

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

      // Fetch pending payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (payments) {
        setPendingPayments(payments);
      }

      // Fetch today's bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', today)
        .order('start_time', { ascending: true });

      if (bookings) {
        setTodaysBookings(bookings);
      }

      // Fetch stats
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

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.full_name}. Here's your club overview.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.activeBookings}</p>
                  <p className="text-sm text-muted-foreground">Active Bookings</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pendingPaymentsCount}</p>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Bookings */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Today's Bookings</h2>
                <Link 
                  to="/admin/bookings" 
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
              ) : todaysBookings.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-auto">
                  {todaysBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {booking.booking_type?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <span className={`
                        inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : ''}
                        ${booking.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                        ${booking.status === 'completed' ? 'bg-muted text-muted-foreground' : ''}
                      `}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No bookings today</p>
                </div>
              )}
            </div>

            {/* Pending Payments */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Pending Payments</h2>
                <Link 
                  to="/admin/payments" 
                  className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : pendingPayments.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-auto">
                  {pendingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-xl bg-muted/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            Ref: {payment.transaction_reference || 'N/A'}
                          </p>
                        </div>
                        <span className="badge-gold">Pending</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerifyPayment(payment.id, 'verified')}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                          className="flex-1"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending payments</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: '/admin/bookings', label: 'Manage Bookings', icon: Calendar },
                { href: '/admin/members', label: 'Manage Members', icon: Users },
                { href: '/admin/payments', label: 'Verify Payments', icon: CreditCard },
                { href: '/admin/financials', label: 'View Financials', icon: TrendingUp },
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
