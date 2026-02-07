import { Calendar, Plus, Search, X, Clock, MapPin, Edit2, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BookingModal } from '@/components/booking/BookingModal';
import { EditBookingModal } from '@/components/booking/EditBookingModal';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import { sendAdminNotification } from '@/lib/notifications';
import type { Database } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Court = Database['public']['Tables']['courts']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

interface BookingWithCourt extends Booking {
  court?: Court;
  payment?: Payment | null;
}

export default function MemberBookings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingWithCourt | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    bookingId?: string;
    amount?: number;
    description?: string;
  }>({ open: false });

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts(*)
        `)
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: false });

      if (bookingsData) {
        // Fetch payments for these bookings
        const bookingIds = bookingsData.map(b => b.id);
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .in('booking_id', bookingIds);

        // Map payments to bookings
        const bookingsWithPayments = bookingsData.map(booking => ({
          ...booking,
          payment: payments?.find(p => p.booking_id === booking.id) || null
        }));

        setBookings(bookingsWithPayments as BookingWithCourt[]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelingBookingId) return;

    try {
      // Get booking details for notification
      const bookingToCancel = bookings.find(b => b.id === cancelingBookingId);
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', cancelingBookingId);

      if (error) throw error;

      // Send cancellation notification to admins
      if (bookingToCancel) {
        sendAdminNotification({
          type: 'booking_cancelled',
          data: {
            memberName: profile?.full_name || 'Unknown',
            date: format(new Date(bookingToCancel.booking_date), 'MMMM d, yyyy'),
            startTime: bookingToCancel.start_time?.slice(0, 5),
            endTime: bookingToCancel.end_time?.slice(0, 5),
            courtName: bookingToCancel.court?.name || 'Court',
            reason: 'Cancelled by member',
          },
        });
      }

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    } finally {
      setCancelingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.booking_date.includes(query) ||
      booking.opponent_name?.toLowerCase().includes(query) ||
      booking.status?.toLowerCase().includes(query)
    );
  });

  const upcomingBookings = filteredBookings.filter(
    (b) => new Date(b.booking_date) >= new Date() && b.status !== 'cancelled'
  );
  const pastBookings = filteredBookings.filter(
    (b) => new Date(b.booking_date) < new Date() || b.status === 'cancelled'
  );

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold truncate">My Bookings</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                View and manage your court bookings
              </p>
            </div>
            <Button onClick={() => setShowBookingModal(true)} className="btn-primary w-full sm:w-auto h-10 sm:h-11 shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Book Court
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search bookings..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              {upcomingBookings.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="font-display text-base sm:text-lg font-semibold">Upcoming</h2>
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="dashboard-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-2 sm:gap-4 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">
                              {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {booking.court?.name || 'Court'}
                              </span>
                              {booking.opponent_name && (
                                <span>vs {booking.opponent_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shrink-0">
                          <div className="text-left sm:text-right min-w-0">
                            <p className="font-semibold text-sm sm:text-base">{formatCurrency(booking.amount || 0)}</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 sm:justify-end">
                              <span className={`
                                inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : ''}
                                ${booking.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                              `}>
                                {booking.status}
                              </span>
                              {/* Payment status with clear differentiation */}
                              {booking.payment_status === 'paid' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  <CheckCircle className="w-3 h-3" />
                                  Paid
                                </span>
                              )}
                              {booking.payment_status === 'unpaid' && booking.payment?.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
                                  <Clock className="w-3 h-3" />
                                  Verifying
                                </span>
                              )}
                              {booking.payment_status === 'unpaid' && !booking.payment && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                  <AlertCircle className="w-3 h-3" />
                                  Unpaid
                                </span>
                              )}
                            </div>
                          </div>
                          {booking.status !== 'cancelled' && (
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {/* Show submit payment button for unpaid bookings without pending payment */}
                              {booking.payment_status === 'unpaid' && !booking.payment && (
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
                                  Pay
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingBooking(booking)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCancelingBookingId(booking.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pastBookings.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="font-display text-base sm:text-lg font-semibold text-muted-foreground">Past & Cancelled</h2>
                  {pastBookings.map((booking) => (
                    <div key={booking.id} className="dashboard-card opacity-70 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-2 sm:gap-4 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">
                              {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)} • {booking.court?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="font-semibold text-sm sm:text-base">{formatCurrency(booking.amount || 0)}</p>
                          <span className={`
                            inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                            ${booking.status === 'completed' ? 'bg-muted text-muted-foreground' : ''}
                            ${booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : ''}
                            ${booking.status === 'no_show' ? 'bg-destructive/10 text-destructive' : ''}
                          `}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-16">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">Book your first court to get started!</p>
              <Button onClick={() => setShowBookingModal(true)} className="btn-primary w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Book Court
              </Button>
            </div>
          )}
        </div>

        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={fetchBookings}
        />

        {editingBooking && (
          <EditBookingModal
            isOpen={!!editingBooking}
            onClose={() => setEditingBooking(null)}
            onSuccess={fetchBookings}
            booking={editingBooking}
          />
        )}

        <AlertDialog open={!!cancelingBookingId} onOpenChange={() => setCancelingBookingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
                Cancellation fees may apply depending on timing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <PaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal({ open: false })}
          onSuccess={fetchBookings}
          bookingId={paymentModal.bookingId}
          amount={paymentModal.amount}
          description={paymentModal.description}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
