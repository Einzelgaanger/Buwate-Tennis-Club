import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, Edit2, Users } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Court = Database['public']['Tables']['courts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];
type Dependent = Database['public']['Tables']['dependents']['Row'];

interface BookingWithDetails extends Booking {
  court?: Court;
  profile?: Profile;
  payment?: Payment | null;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourt, setFilterCourt] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBooking, setEditingBooking] = useState<BookingWithDetails | null>(null);
  const [viewingDependents, setViewingDependents] = useState<{profile: Profile; dependents: Dependent[]} | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    payment_status: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch courts
      const { data: courtsData } = await supabase
        .from('courts')
        .select('*')
        .order('name');
      
      if (courtsData) {
        setCourts(courtsData);
      }

      // Fetch bookings from last 30 days to next 30 days
      const startDate = format(addDays(new Date(), -30), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (bookingsData) {
        // Get all unique user_ids and booking_ids
        const userIds = [...new Set(bookingsData.map(b => b.user_id))];
        const bookingIds = bookingsData.map(b => b.id);
        
        // Fetch profiles and payments
        const [profilesResult, paymentsResult] = await Promise.all([
          supabase.from('profiles').select('*').in('user_id', userIds),
          supabase.from('payments').select('*').in('booking_id', bookingIds)
        ]);

        // Map data together
        const bookingsWithDetails = bookingsData.map((booking) => ({
          ...booking,
          court: courtsData?.find(c => c.id === booking.court_id),
          profile: profilesResult.data?.find(p => p.user_id === booking.user_id),
          payment: paymentsResult.data?.find(p => p.booking_id === booking.id) || null,
        }));

        setBookings(bookingsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (bookingId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.payment_status = 'paid';
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking updated",
        description: `Status changed to ${status}.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking.",
        variant: "destructive",
      });
    }
  };

  const handleEditBooking = async () => {
    if (!editingBooking) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: editForm.status as any,
          payment_status: editForm.payment_status as any,
          notes: editForm.notes || null,
        })
        .eq('id', editingBooking.id);

      if (error) throw error;

      toast({
        title: "Booking updated",
        description: "All changes have been saved.",
      });

      setEditingBooking(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (booking: BookingWithDetails) => {
    setEditForm({
      status: booking.status || 'pending',
      payment_status: booking.payment_status || 'unpaid',
      notes: booking.notes || '',
    });
    setEditingBooking(booking);
  };

  const viewMemberDependents = async (profile: Profile) => {
    const { data } = await supabase
      .from('dependents')
      .select('*')
      .eq('member_id', profile.user_id)
      .order('created_at');
    
    setViewingDependents({ profile, dependents: data || [] });
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = !searchQuery || 
      booking.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.opponent_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourt = filterCourt === 'all' || booking.court_id === filterCourt;
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesCourt && matchesStatus;
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysBookings = filteredBookings.filter(b => b.booking_date === today);
  const upcomingBookings = filteredBookings.filter(b => b.booking_date > today && b.status !== 'cancelled');
  const pastBookings = filteredBookings.filter(b => b.booking_date < today || b.status === 'cancelled');

  const getPaymentBadge = (booking: BookingWithDetails) => {
    if (booking.payment_status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          <CheckCircle className="w-3 h-3" />
          Paid
        </span>
      );
    }
    if (booking.payment?.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
          <Clock className="w-3 h-3" />
          Verifying
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
        <AlertCircle className="w-3 h-3" />
        Unpaid
      </span>
    );
  };

  const renderBookingCard = (booking: BookingWithDetails) => (
    <div key={booking.id} className="dashboard-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center shrink-0
            ${booking.status === 'confirmed' ? 'bg-primary/10' : ''}
            ${booking.status === 'pending' ? 'bg-amber-500/10' : ''}
            ${booking.status === 'cancelled' ? 'bg-destructive/10' : ''}
            ${booking.status === 'completed' ? 'bg-emerald-500/10' : ''}
            ${booking.status === 'no_show' ? 'bg-destructive/10' : ''}
          `}>
            <Calendar className={`
              w-6 h-6
              ${booking.status === 'confirmed' ? 'text-primary' : ''}
              ${booking.status === 'pending' ? 'text-amber-500' : ''}
              ${booking.status === 'cancelled' ? 'text-destructive' : ''}
              ${booking.status === 'completed' ? 'text-emerald-500' : ''}
              ${booking.status === 'no_show' ? 'text-destructive' : ''}
            `} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">
              {format(new Date(booking.booking_date), 'EEE, MMM d, yyyy')}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {booking.court?.name}
              </span>
              <button 
                onClick={() => booking.profile && viewMemberDependents(booking.profile)}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <User className="w-3 h-3" />
                {booking.profile?.full_name}
              </button>
            </div>
            {booking.opponent_name && (
              <p className="text-sm text-muted-foreground mt-1">
                vs {booking.opponent_name}
              </p>
            )}
            {booking.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Note: {booking.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(booking.amount || 0)}</p>
            <div className="flex flex-wrap gap-2 mt-1 justify-end">
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize
                ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : ''}
                ${booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : ''}
                ${booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : ''}
                ${booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                ${booking.status === 'no_show' ? 'bg-destructive/10 text-destructive' : ''}
              `}>
                {booking.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {booking.status === 'no_show' && <XCircle className="w-3 h-3" />}
                {booking.status}
              </span>
              {getPaymentBadge(booking)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog(booking)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            {/* Quick actions based on current state */}
            {booking.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => handleQuickStatusUpdate(booking.id, 'confirmed')}
                className="bg-primary"
              >
                Confirm
              </Button>
            )}
            {booking.status === 'confirmed' && booking.booking_date <= today && (
              <Button
                size="sm"
                onClick={() => handleQuickStatusUpdate(booking.id, 'completed')}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Played
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">All Bookings</h1>
            <p className="text-muted-foreground mt-1">
              Manage all court bookings and mark sessions as played
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by member name..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCourt} onValueChange={setFilterCourt}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Court" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courts</SelectItem>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>{court.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="today" className="space-y-6">
              <TabsList>
                <TabsTrigger value="today">
                  Today ({todaysBookings.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-3">
                {todaysBookings.length > 0 ? (
                  todaysBookings.map(renderBookingCard)
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No bookings today</h3>
                    <p className="text-muted-foreground">Courts are available!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-3">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(renderBookingCard)
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No upcoming bookings</h3>
                    <p className="text-muted-foreground">Future bookings will appear here.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-3">
                {pastBookings.length > 0 ? (
                  pastBookings.map(renderBookingCard)
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No past bookings</h3>
                    <p className="text-muted-foreground">Completed bookings will appear here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Edit Booking Dialog */}
        <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>
                Update booking status and payment information.
              </DialogDescription>
            </DialogHeader>
            {editingBooking && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                  <p className="font-medium">{editingBooking.profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(editingBooking.booking_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {editingBooking.start_time?.slice(0, 5)} - {editingBooking.end_time?.slice(0, 5)} • {editingBooking.court?.name}
                  </p>
                  <p className="font-semibold">{formatCurrency(editingBooking.amount || 0)}</p>
                </div>

                <div className="space-y-2">
                  <Label>Booking Status</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({...editForm, status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed (Played)</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select value={editForm.payment_status} onValueChange={(v) => setEditForm({...editForm, payment_status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Input
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Add any notes..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBooking(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditBooking}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dependents Dialog */}
        <Dialog open={!!viewingDependents} onOpenChange={() => setViewingDependents(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {viewingDependents?.profile.full_name}'s Family
              </DialogTitle>
              <DialogDescription>
                Allowed players under this member's account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {viewingDependents?.dependents && viewingDependents.dependents.length > 0 ? (
                <div className="space-y-3">
                  {viewingDependents.dependents.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{dep.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {dep.relationship}
                          {dep.date_of_birth && ` • Born ${format(new Date(dep.date_of_birth), 'MMM d, yyyy')}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No family members registered.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingDependents(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}