import { Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminBookings() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">All Bookings</h1>
            <p className="text-muted-foreground mt-1">Manage all court bookings</p>
          </div>
          <div className="dashboard-card text-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Booking management coming soon...</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
