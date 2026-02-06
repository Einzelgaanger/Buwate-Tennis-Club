import { Clock, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CoachAvailability() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <ProtectedRoute allowedRoles={['coach']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Availability</h1>
              <p className="text-muted-foreground mt-1">
                Set your weekly availability for coaching sessions
              </p>
            </div>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Time Slot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {days.map((day) => (
              <div key={day} className="dashboard-card">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{day}</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>No availability set</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Slot
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
