import { CreditCard, Plus, Clock, CheckCircle, XCircle, Receipt, AlertCircle, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, CLUB_INFO } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Payment = Database['public']['Tables']['payments']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

interface BookingWithCourt extends Booking {
  court?: { name: string };
}

export default function MemberPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidBookings, setUnpaidBookings] = useState<BookingWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForBooking, setPaymentForBooking] = useState<{
    bookingId?: string;
    amount?: number;
    description?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (paymentsData) {
        setPayments(paymentsData);
      }

      // Fetch all bookings to check which need payment
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, court:courts(name)')
        .eq('user_id', user!.id)
        .eq('payment_status', 'unpaid')
        .neq('status', 'cancelled')
        .order('booking_date', { ascending: true });

      if (bookingsData && paymentsData) {
        // Filter out bookings that already have a payment (pending or otherwise)
        const bookingIdsWithPayments = paymentsData
          .filter(p => p.booking_id)
          .map(p => p.booking_id);
        const unpaid = bookingsData.filter(b => !bookingIdsWithPayments.includes(b.id));
        setUnpaidBookings(unpaid as BookingWithCourt[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const verifiedPayments = payments.filter(p => p.status === 'verified');
  const rejectedPayments = payments.filter(p => p.status === 'rejected');

  const stats = {
    unpaid: unpaidBookings.length,
    pending: pendingPayments.length,
    verified: verifiedPayments.length,
    total: verifiedPayments.reduce((acc, p) => acc + p.amount, 0),
  };

  const handlePayForBooking = (booking: BookingWithCourt) => {
    setPaymentForBooking({
      bookingId: booking.id,
      amount: booking.amount || 0,
      description: `Court booking - ${format(new Date(booking.booking_date), 'MMM d, yyyy')} at ${booking.start_time?.slice(0, 5)}`
    });
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentForBooking(null);
  };

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Payments</h1>
              <p className="text-muted-foreground mt-1">
                View your payment history and submit new payments
              </p>
            </div>
            <Button onClick={() => setShowPaymentModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Submit Payment
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dashboard-card border-l-4 border-l-destructive">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.unpaid}</p>
                  <p className="text-sm text-muted-foreground">Unpaid</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-l-4 border-l-amber-500">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-l-4 border-l-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.verified}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.total)}</p>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="dashboard-card bg-primary/5 border-primary/20">
            <h3 className="font-display font-semibold mb-3">Payment Information</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All payments are made via Mobile Money only. No cash accepted.
            </p>
            <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">{CLUB_INFO.momoNumber}</p>
                <p className="text-sm text-muted-foreground">{CLUB_INFO.momoName}</p>
              </div>
            </div>
          </div>

          {/* Tabs for different payment statuses */}
          <Tabs defaultValue="unpaid" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="unpaid" className="relative">
                Unpaid
                {stats.unpaid > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs">
                    {stats.unpaid}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                {stats.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs">
                    {stats.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {/* Unpaid Bookings - Need to submit payment proof */}
            <TabsContent value="unpaid" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : unpaidBookings.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    These bookings require payment. Submit your MoMo transaction reference after paying.
                  </p>
                  {unpaidBookings.map((booking) => (
                    <div key={booking.id} className="dashboard-card border-l-4 border-l-destructive">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-destructive/10">
                            <Calendar className="w-6 h-6 text-destructive" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)} • {booking.court?.name || 'Court'}
                            </p>
                            <p className="text-lg font-display font-bold mt-2">
                              {formatCurrency(booking.amount || 0)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePayForBooking(booking)}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Submit Payment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">All paid up!</h3>
                  <p className="text-muted-foreground">You have no unpaid bookings.</p>
                </div>
              )}
            </TabsContent>

            {/* Pending Verification */}
            <TabsContent value="pending" className="mt-6">
              {pendingPayments.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    These payments are awaiting admin verification.
                  </p>
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="dashboard-card border-l-4 border-l-amber-500">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-amber-500/10">
                            <Clock className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
                                <Clock className="w-3 h-3" />
                                Awaiting Verification
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {payment.description || 'Payment'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ref: {payment.transaction_reference || 'N/A'} • Submitted {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Clock className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No pending payments</h3>
                  <p className="text-muted-foreground">All submitted payments have been processed.</p>
                </div>
              )}
            </TabsContent>

            {/* Verified Payments */}
            <TabsContent value="verified" className="mt-6">
              {verifiedPayments.length > 0 ? (
                <div className="space-y-4">
                  {verifiedPayments.map((payment) => (
                    <div key={payment.id} className="dashboard-card border-l-4 border-l-primary">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <CheckCircle className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {payment.description || 'Payment'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ref: {payment.transaction_reference || 'N/A'} • {format(new Date(payment.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        {payment.receipt_number && (
                          <div className="text-right p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Receipt</p>
                            <p className="font-mono text-sm font-semibold">{payment.receipt_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No verified payments yet</h3>
                  <p className="text-muted-foreground">Your verified payments will appear here.</p>
                </div>
              )}
            </TabsContent>

            {/* Rejected Payments */}
            <TabsContent value="rejected" className="mt-6">
              {rejectedPayments.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    These payments were rejected. Please check the reason and resubmit if needed.
                  </p>
                  {rejectedPayments.map((payment) => (
                    <div key={payment.id} className="dashboard-card border-l-4 border-l-destructive">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-destructive/10">
                            <XCircle className="w-6 h-6 text-destructive" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {payment.description || 'Payment'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ref: {payment.transaction_reference || 'N/A'} • {format(new Date(payment.created_at), 'MMM d, yyyy')}
                            </p>
                            {payment.rejection_reason && (
                              <p className="text-sm text-destructive mt-2 p-2 bg-destructive/5 rounded-lg">
                                <strong>Reason:</strong> {payment.rejection_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <XCircle className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No rejected payments</h3>
                  <p className="text-muted-foreground">Great! All your payments have been accepted.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleCloseModal}
          onSuccess={fetchData}
          bookingId={paymentForBooking?.bookingId}
          amount={paymentForBooking?.amount}
          description={paymentForBooking?.description}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}