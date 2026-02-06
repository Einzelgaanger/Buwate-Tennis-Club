import { Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MemberCoaching() {
  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Coaching</h1>
            <p className="text-muted-foreground mt-1">
              Book sessions with our professional coaches
            </p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search coaches..." className="pl-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="dashboard-card">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold">Coach {i === 1 ? 'David' : 'Sarah'}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {i === 1 ? 'Specializing in serve technique and match strategy' : 'Expert in junior development and fundamentals'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Private', 'Group', 'Junior'].map((tag) => (
                        <span key={tag} className="badge-primary">{tag}</span>
                      ))}
                    </div>
                    <Button className="w-full">Book Session</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
