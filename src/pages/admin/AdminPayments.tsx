import { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle, XCircle, Filter, Clock } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type Payment = Database['public']['Tables']['payments']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface PaymentWithUser extends Payment {
  profile?: Profile;
}

export default function AdminPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  
  // Verification dialog
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithUser | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as 'pending' | 'verified' | 'rejected' | 'refunded');
      }

      const { data: paymentsData } = await query;

      if (paymentsData) {
        // Get all unique user_ids
        const userIds = [...new Set(paymentsData.map(p => p.user_id))];
        
        // Fetch profiles for all users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        // Map profiles to payments
        const paymentsWithUsers = paymentsData.map((payment) => ({
          ...payment,
          profile: profiles?.find(p => p.user_id === payment.user_id),
        }));

        setPayments(paymentsWithUsers);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (payment: PaymentWithUser) => {
    setProcessing(true);
    try {
      // Generate receipt number
      const receiptNumber = `BTC-${format(new Date(), 'yyyy')}-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          receipt_number: receiptNumber,
        })
        .eq('id', payment.id);

      if (error) throw error;

      // Update booking status if linked
      if (payment.booking_id) {
        await supabase
          .from('bookings')
          .update({ 
            payment_status: 'paid',
            status: 'confirmed'
          })
          .eq('id', payment.booking_id);
      }

      // Update coaching session if linked
      if (payment.session_id) {
        await supabase
          .from('coaching_sessions')
          .update({ payment_status: 'paid' })
          .eq('id', payment.session_id);
      }

      // Create revenue entry
      await supabase
        .from('revenue_entries')
        .insert({
          category: payment.booking_id ? 'playing_fees' : payment.session_id ? 'coaching_fees' : 'other',
          amount: payment.amount,
          entry_date: new Date().toISOString().split('T')[0],
          member_id: payment.user_id,
          payment_id: payment.id,
          description: payment.description || 'Payment verified',
          reference_number: receiptNumber,
          recorded_by: user?.id,
        });

      // Log the admin action
      await supabase
        .from('action_logs')
        .insert({
          admin_id: user?.id!,
          action_type: 'verify_payment',
          entity_type: 'payment',
          entity_id: payment.id,
          details: {
            amount: payment.amount,
            member_name: payment.profile?.full_name,
            receipt_number: receiptNumber,
            transaction_reference: payment.transaction_reference,
          },
        });

      toast({
        title: "Payment verified!",
        description: `Receipt #${receiptNumber} generated.`,
      });

      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify payment.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason || 'Payment could not be verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      // Log the admin action
      await supabase
        .from('action_logs')
        .insert({
          admin_id: user?.id!,
          action_type: 'reject_payment',
          entity_type: 'payment',
          entity_id: selectedPayment.id,
          details: {
            amount: selectedPayment.amount,
            member_name: selectedPayment.profile?.full_name,
            rejection_reason: rejectionReason || 'Payment could not be verified',
            transaction_reference: selectedPayment.transaction_reference,
          },
        });

      toast({
        title: "Payment rejected",
        description: "The member will be notified.",
      });

      setShowRejectDialog(false);
      setSelectedPayment(null);
      setRejectionReason('');
      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject payment.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (payment: PaymentWithUser) => {
    setSelectedPayment(payment);
    setShowRejectDialog(true);
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.profile?.full_name.toLowerCase().includes(query) ||
      payment.transaction_reference?.toLowerCase().includes(query) ||
      payment.description?.toLowerCase().includes(query)
    );
  });

  const stats = {
    pending: payments.filter(p => p.status === 'pending').length,
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0),
    verifiedToday: payments.filter(p => 
      p.status === 'verified' && 
      p.verified_at && 
      format(new Date(p.verified_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length,
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground mt-1">
              Verify and manage member payments
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="dashboard-card border-gold/30 bg-gold/5">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-gold" />
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold">{stats.verifiedToday}</p>
                  <p className="text-sm text-muted-foreground">Verified Today</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by member, reference, or description..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className={`dashboard-card ${payment.status === 'pending' ? 'border-gold/30' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                        <span className={`
                          inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                          ${payment.status === 'verified' ? 'bg-primary/10 text-primary' : ''}
                          ${payment.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                          ${payment.status === 'rejected' ? 'bg-destructive/10 text-destructive' : ''}
                        `}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{payment.profile?.full_name || 'Unknown User'}</p>
                        <p className="text-muted-foreground">
                          {payment.description || 'Payment'}
                        </p>
                        <p className="text-muted-foreground">
                          Ref: <span className="font-mono">{payment.transaction_reference || 'N/A'}</span>
                          {payment.momo_number && ` • From: ${payment.momo_number}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        {payment.status === 'rejected' && payment.rejection_reason && (
                          <p className="text-xs text-destructive mt-1">
                            Reason: {payment.rejection_reason}
                          </p>
                        )}
                        {payment.receipt_number && (
                          <p className="text-xs text-primary font-mono">
                            Receipt: {payment.receipt_number}
                          </p>
                        )}
                      </div>
                    </div>
                    {payment.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          onClick={() => handleVerifyPayment(payment)}
                          disabled={processing}
                          className="btn-primary"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => openRejectDialog(payment)}
                          disabled={processing}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CreditCard className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                {filterStatus === 'pending' 
                  ? 'No payments pending verification.' 
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Rejection Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this payment of {selectedPayment && formatCurrency(selectedPayment.amount)}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reason for rejection</Label>
                <Textarea
                  placeholder="e.g., Transaction reference not found, amount mismatch..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRejectPayment}
                disabled={processing}
                variant="destructive"
              >
                {processing ? 'Processing...' : 'Reject Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
