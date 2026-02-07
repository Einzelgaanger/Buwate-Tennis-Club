import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, Mail, Phone, MoreVertical, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Coach extends Profile {
  role?: string;
}

export default function AdminCoaches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingCoaches, setPendingCoaches] = useState<Coach[]>([]);
  const [approvedCoaches, setApprovedCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Approval dialog
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      // Get all coach user_ids
      const { data: coachRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'coach');

      if (coachRoles && coachRoles.length > 0) {
        const coachIds = coachRoles.map(r => r.user_id);
        
        // Get pending coaches
        const { data: pending } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', coachIds)
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: false });

        // Get approved coaches
        const { data: approved } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', coachIds)
          .eq('approval_status', 'approved')
          .order('full_name');

        setPendingCoaches(pending || []);
        setApprovedCoaches(approved || []);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCoach = async (coach: Coach) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', coach.id);

      if (error) throw error;

      toast({
        title: "Coach approved!",
        description: `${coach.full_name} can now access their coach dashboard.`,
      });

      fetchCoaches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve coach.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectCoach = async () => {
    if (!selectedCoach) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'rejected',
          notes: rejectionReason || 'Application rejected',
        })
        .eq('id', selectedCoach.id);

      if (error) throw error;

      toast({
        title: "Application rejected",
        description: `${selectedCoach.full_name}'s application has been rejected.`,
      });

      setShowApprovalDialog(false);
      setSelectedCoach(null);
      setRejectionReason('');
      fetchCoaches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowApprovalDialog(true);
  };

  const filteredPending = pendingCoaches.filter((coach) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      coach.full_name.toLowerCase().includes(query) ||
      coach.email?.toLowerCase().includes(query)
    );
  });

  const filteredApproved = approvedCoaches.filter((coach) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      coach.full_name.toLowerCase().includes(query) ||
      coach.email?.toLowerCase().includes(query)
    );
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6 md:space-y-8">
          <div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold truncate">Coaches</h1>
            <p className="text-muted-foreground mt-1">
              Manage and approve coach applications
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search coaches..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="relative">
                Pending Approval
                {pendingCoaches.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gold text-gold-foreground">
                    {pendingCoaches.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedCoaches.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : filteredPending.length > 0 ? (
                <div className="space-y-4">
                  {filteredPending.map((coach) => (
                    <div key={coach.id} className="dashboard-card border-gold/30">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                            <Clock className="w-8 h-8 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg font-semibold">{coach.full_name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                              {coach.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {coach.email}
                                </span>
                              )}
                              {coach.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {coach.phone}
                                </span>
                              )}
                            </div>
                            {coach.bio && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {coach.bio}
                              </p>
                            )}
                            {coach.specialties && coach.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {coach.specialties.map((s) => (
                                  <span key={s} className="badge-primary">{s}</span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Applied {format(new Date(coach.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            onClick={() => handleApproveCoach(coach)}
                            disabled={processing}
                            className="btn-primary"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openRejectDialog(coach)}
                            disabled={processing}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No pending applications</h3>
                  <p className="text-muted-foreground">All coach applications have been reviewed.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : filteredApproved.length > 0 ? (
                <div className="space-y-3">
                  {filteredApproved.map((coach) => (
                    <div key={coach.id} className="dashboard-card">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {coach.avatar_url ? (
                              <img 
                                src={coach.avatar_url} 
                                alt={coach.full_name} 
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="font-semibold text-primary">
                                {coach.full_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{coach.full_name}</p>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              {coach.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {coach.email}
                                </span>
                              )}
                              <span>Rate: {formatCurrency(coach.hourly_rate || 50000)}/hr</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="badge-primary flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                          {coach.approved_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(coach.approved_at), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No approved coaches</h3>
                  <p className="text-muted-foreground">Approved coaches will appear here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Rejection Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting {selectedCoach?.full_name}'s application.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reason for rejection</Label>
                <Textarea
                  placeholder="e.g., Insufficient experience, missing certifications..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRejectCoach}
                disabled={processing}
                variant="destructive"
              >
                {processing ? 'Processing...' : 'Reject Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
