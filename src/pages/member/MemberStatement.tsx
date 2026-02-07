import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Filter } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import { MobileMoneyIcon } from '@/components/icons/MobileMoneyIcon';
import type { Database } from '@/integrations/supabase/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

interface BookingWithDetails extends Booking {
  court?: { name: string };
  payment?: Payment | null;
}

interface StatementItem {
  id: string;
  date: string;
  type: 'booking' | 'payment';
  description: string;
  amount: number;
  bookingStatus?: string;
  paymentStatus?: string;
  isPlayed: boolean;
  isPaid: boolean;
  isConfirmed: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function MemberStatement() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('3'); // months

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const months = parseInt(dateRange);
      const startDate = format(startOfMonth(subMonths(new Date(), months)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, court:courts(name)')
        .eq('user_id', user!.id)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .order('booking_date', { ascending: false });

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (bookingsData && paymentsData) {
        // Map payments to bookings
        const bookingsWithPayments = bookingsData.map(booking => ({
          ...booking,
          payment: paymentsData.find(p => p.booking_id === booking.id) || null
        }));
        setBookings(bookingsWithPayments as BookingWithDetails[]);
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching statement data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary
  const summary = {
    totalBooked: bookings.length,
    totalPlayed: bookings.filter(b => b.status === 'completed').length,
    totalPending: bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length,
    totalCancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalAmount: bookings.reduce((acc, b) => acc + (b.amount || 0), 0),
    paidAmount: payments.filter(p => p.status === 'verified').reduce((acc, p) => acc + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0),
    outstandingAmount: bookings
      .filter(b => b.status !== 'cancelled' && b.payment_status === 'unpaid')
      .filter(b => !payments.some(p => p.booking_id === b.id))
      .reduce((acc, b) => acc + (b.amount || 0), 0),
    hoursBooked: bookings.reduce((acc, b) => acc + (b.duration_minutes || 60), 0) / 60,
    hoursPlayed: bookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + (b.duration_minutes || 60), 0) / 60,
  };

  const getStatusBadge = (booking: BookingWithDetails) => {
    const badges = [];
    
    // Booking status
    if (booking.status === 'completed') {
      badges.push(
        <span key="played" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
          <CheckCircle className="w-3 h-3" />
          Played
        </span>
      );
    } else if (booking.status === 'cancelled') {
      badges.push(
        <span key="cancelled" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    } else if (booking.status === 'no_show') {
      badges.push(
        <span key="noshow" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          <XCircle className="w-3 h-3" />
          No Show
        </span>
      );
    } else {
      badges.push(
        <span key="status" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 capitalize">
          <Clock className="w-3 h-3" />
          {booking.status}
        </span>
      );
    }

    // Payment status
    if (booking.payment?.status === 'verified' || booking.payment_status === 'paid') {
      badges.push(
        <span key="paid" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          <CheckCircle className="w-3 h-3" />
          Paid
        </span>
      );
    } else if (booking.payment?.status === 'pending') {
      badges.push(
        <span key="pending" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
          <Clock className="w-3 h-3" />
          Verifying
        </span>
      );
    } else if (booking.status !== 'cancelled') {
      badges.push(
        <span key="unpaid" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          <AlertCircle className="w-3 h-3" />
          Unpaid
        </span>
      );
    }

    return badges;
  };

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
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Account Statement
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Statement of Account</h1>
              <p className="text-muted-foreground mt-1">
                {profile?.full_name} • {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 1 Month</SelectItem>
                  <SelectItem value="3">Last 3 Months</SelectItem>
                  <SelectItem value="6">Last 6 Months</SelectItem>
                  <SelectItem value="12">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dashboard-card border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{summary.totalBooked}</p>
                  <p className="text-xs text-muted-foreground">Total Booked</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{summary.totalPlayed}</p>
                  <p className="text-xs text-muted-foreground">Sessions Played</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{summary.hoursPlayed}h</p>
                  <p className="text-xs text-muted-foreground">Hours Played</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-l-4 border-l-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MobileMoneyIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(summary.paidAmount)}</p>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Summary */}
          <motion.div variants={itemVariants} className="dashboard-card">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <MobileMoneyIcon className="w-5 h-5 text-primary" />
              Financial Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm text-muted-foreground">Total Billed</p>
                <p className="text-xl font-display font-bold">{formatCurrency(summary.totalAmount)}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10">
                <p className="text-sm text-emerald-600">Paid & Confirmed</p>
                <p className="text-xl font-display font-bold text-emerald-600">{formatCurrency(summary.paidAmount)}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10">
                <p className="text-sm text-amber-600">Pending Verification</p>
                <p className="text-xl font-display font-bold text-amber-600">{formatCurrency(summary.pendingAmount)}</p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10">
                <p className="text-sm text-destructive">Outstanding</p>
                <p className="text-xl font-display font-bold text-destructive">{formatCurrency(summary.outstandingAmount)}</p>
              </div>
            </div>
          </motion.div>

          {/* Booking Details Table */}
          <motion.div variants={itemVariants} className="dashboard-card overflow-hidden p-0">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Booking History
              </h3>
            </div>
            
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Court</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <p className="font-medium">{format(new Date(booking.booking_date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.booking_date), 'EEEE')}</p>
                        </td>
                        <td className="p-4 text-sm">
                          {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                        </td>
                        <td className="p-4 text-sm">{booking.court?.name || 'Court'}</td>
                        <td className="p-4 text-sm">{(booking.duration_minutes || 60) / 60}h</td>
                        <td className="p-4 font-medium">{formatCurrency(booking.amount || 0)}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {getStatusBadge(booking)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">No bookings in the selected period.</p>
              </div>
            )}
          </motion.div>

          {/* Payment History */}
          <motion.div variants={itemVariants} className="dashboard-card overflow-hidden p-0">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <MobileMoneyIcon className="w-5 h-5 text-primary" />
                Payment History
              </h3>
            </div>
            
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reference</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <p className="font-medium">{format(new Date(payment.created_at), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(payment.created_at), 'h:mm a')}</p>
                        </td>
                        <td className="p-4 text-sm max-w-[200px] truncate">{payment.description}</td>
                        <td className="p-4 text-sm font-mono">{payment.transaction_reference || '-'}</td>
                        <td className="p-4 font-medium">{formatCurrency(payment.amount)}</td>
                        <td className="p-4">
                          <span className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize
                            ${payment.status === 'verified' ? 'bg-primary/10 text-primary' : ''}
                            ${payment.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : ''}
                            ${payment.status === 'rejected' ? 'bg-destructive/10 text-destructive' : ''}
                          `}>
                            {payment.status === 'verified' && <CheckCircle className="w-3 h-3" />}
                            {payment.status === 'pending' && <Clock className="w-3 h-3" />}
                            {payment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-mono">{payment.receipt_number || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <MobileMoneyIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">No payments in the selected period.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}