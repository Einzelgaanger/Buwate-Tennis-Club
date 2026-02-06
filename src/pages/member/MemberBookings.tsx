import { Calendar, Plus, Search, Filter, X, Clock, MapPin, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BookingModal } from '@/components/booking/BookingModal';
import { EditBookingModal } from '@/components/booking/EditBookingModal';
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

interface BookingWithCourt extends Booking {
  court?: Court;
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

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts(*)
        `)
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: false });

      if (data) {
        setBookings(data as BookingWithCourt[]);
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
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">My Bookings</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your court bookings
              </p>
            </div>
            <Button onClick={() => setShowBookingModal(true)} className="btn-primary">
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
            <div className="space-y-8">
              {upcomingBookings.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-semibold">Upcoming</h2>
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="dashboard-card">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
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
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(booking.amount || 0)}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`
                                inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : ''}
                                ${booking.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                              `}>
                                {booking.status}
                              </span>
                              <span className={`
                                inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                ${booking.payment_status === 'paid' ? 'bg-primary/10 text-primary' : ''}
                                ${booking.payment_status === 'unpaid' ? 'bg-destructive/10 text-destructive' : ''}
                              `}>
                                {booking.payment_status}
                              </span>
                            </div>
                          </div>
                          {booking.status !== 'cancelled' && (
                            <div className="flex gap-2">
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
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-semibold text-muted-foreground">Past & Cancelled</h2>
                  {pastBookings.map((booking) => (
                    <div key={booking.id} className="dashboard-card opacity-70">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)} • {booking.court?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(booking.amount || 0)}</p>
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
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Book your first court to get started!</p>
              <Button onClick={() => setShowBookingModal(true)} className="btn-primary">
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
