import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Clock, MapPin, User } from 'lucide-react';
import { format, startOfDay, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
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

type Booking = Database['public']['Tables']['bookings']['Row'];
type Court = Database['public']['Tables']['courts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface BookingWithDetails extends Booking {
  court?: Court;
  profile?: Profile;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourt, setFilterCourt] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
        // Get all unique user_ids
        const userIds = [...new Set(bookingsData.map(b => b.user_id))];
        
        // Fetch profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        // Map data together
        const bookingsWithDetails = bookingsData.map((booking) => ({
          ...booking,
          court: courtsData?.find(c => c.id === booking.court_id),
          profile: profiles?.find(p => p.user_id === booking.user_id),
        }));

        setBookings(bookingsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: status as any })
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

  const renderBookingCard = (booking: BookingWithDetails) => (
    <div key={booking.id} className="dashboard-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center shrink-0
            ${booking.status === 'confirmed' ? 'bg-primary/10' : ''}
            ${booking.status === 'pending' ? 'bg-gold/10' : ''}
            ${booking.status === 'cancelled' ? 'bg-destructive/10' : ''}
            ${booking.status === 'completed' ? 'bg-muted' : ''}
          `}>
            <Calendar className={`
              w-6 h-6
              ${booking.status === 'confirmed' ? 'text-primary' : ''}
              ${booking.status === 'pending' ? 'text-gold' : ''}
              ${booking.status === 'cancelled' ? 'text-destructive' : ''}
              ${booking.status === 'completed' ? 'text-muted-foreground' : ''}
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
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {booking.profile?.full_name}
              </span>
            </div>
            {booking.opponent_name && (
              <p className="text-sm text-muted-foreground mt-1">
                vs {booking.opponent_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(booking.amount || 0)}</p>
            <div className="flex gap-2 mt-1">
              <span className={`
                inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : ''}
                ${booking.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                ${booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : ''}
                ${booking.status === 'completed' ? 'bg-muted text-muted-foreground' : ''}
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
          {booking.status === 'pending' && (
            <Select onValueChange={(v) => handleUpdateStatus(booking.id, v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirm</SelectItem>
                <SelectItem value="cancelled">Cancel</SelectItem>
              </SelectContent>
            </Select>
          )}
          {booking.status === 'confirmed' && booking.booking_date <= today && (
            <Select onValueChange={(v) => handleUpdateStatus(booking.id, v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Complete</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          )}
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
              Manage all court bookings
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
