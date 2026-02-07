import { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle, XCircle, Clock, Download, FileText, Eye } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  const [verifiedSearchQuery, setVerifiedSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  // Verification dialog
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithUser | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Related payments for history view
  const [relatedPayments, setRelatedPayments] = useState<PaymentWithUser[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsData) {
        const userIds = [...new Set(paymentsData.map(p => p.user_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

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

      // Update booking status if linked - handle partial payments
      if (payment.booking_id) {
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', payment.booking_id)
          .single();

        if (booking) {
          const totalAmount = booking.total_amount || booking.amount || 0;
          const newPaidAmount = (booking.paid_amount || 0) + payment.amount;
          const newBalance = Math.max(0, totalAmount - newPaidAmount);
          // Only mark as paid if balance is 0
          const paymentStatus = newBalance === 0 ? 'paid' : 'unpaid';

          await supabase
            .from('bookings')
            .update({ 
              payment_status: paymentStatus,
              paid_amount: newPaidAmount,
              balance_amount: newBalance,
              status: 'confirmed'
            })
            .eq('id', payment.booking_id);
        }
      }

      // Update coaching session if linked
      if (payment.session_id) {
        const { data: session } = await supabase
          .from('coaching_sessions')
          .select('*')
          .eq('id', payment.session_id)
          .single();

        if (session) {
          const totalAmount = session.total_amount || session.amount || 0;
          const newPaidAmount = (session.paid_amount || 0) + payment.amount;
          const newBalance = Math.max(0, totalAmount - newPaidAmount);
          const paymentStatus = newBalance === 0 ? 'paid' : 'unpaid';

          await supabase
            .from('coaching_sessions')
            .update({ 
              payment_status: paymentStatus,
              paid_amount: newPaidAmount,
              balance_amount: newBalance,
            })
            .eq('id', payment.session_id);
        }
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

      // Send email notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'payment_verified',
            data: {
              memberName: payment.profile?.full_name,
              amount: payment.amount,
              receiptNumber,
              verifiedBy: 'Admin',
            },
          },
        });
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
      }

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

      // Send rejection notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'payment_rejected',
            data: {
              memberName: selectedPayment.profile?.full_name,
              amount: selectedPayment.amount,
              transactionRef: selectedPayment.transaction_reference,
              rejectionReason: rejectionReason || 'Payment could not be verified',
              rejectedBy: 'Admin',
            },
          },
        });
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
      }

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

  const openDetailsDialog = async (payment: PaymentWithUser) => {
    setSelectedPayment(payment);
    
    // Fetch related payments for the same booking/session
    if (payment.booking_id || payment.session_id) {
      const query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: true });

      if (payment.booking_id) {
        query.eq('booking_id', payment.booking_id);
      } else if (payment.session_id) {
        query.eq('session_id', payment.session_id);
      }

      const { data } = await query;
      
      if (data) {
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        setRelatedPayments(data.map(p => ({
          ...p,
          profile: profiles?.find(pr => pr.user_id === p.user_id),
        })));
      }
    } else {
      setRelatedPayments([]);
    }
    
    setShowDetailsDialog(true);
  };

  const exportToCSV = () => {
    const verifiedPayments = payments.filter(p => p.status === 'verified');
    const filtered = verifiedPayments.filter((payment) => {
      if (!verifiedSearchQuery) return true;
      const query = verifiedSearchQuery.toLowerCase();
      return (
        payment.profile?.full_name?.toLowerCase().includes(query) ||
        payment.transaction_reference?.toLowerCase().includes(query) ||
        payment.receipt_number?.toLowerCase().includes(query) ||
        payment.description?.toLowerCase().includes(query)
      );
    });

    const headers = ['Receipt #', 'Member', 'Amount', 'Transaction Ref', 'Description', 'Verified Date', 'MoMo Number'];
    const rows = filtered.map(p => [
      p.receipt_number || '',
      p.profile?.full_name || '',
      p.amount.toString(),
      p.transaction_reference || '',
      p.description || '',
      p.verified_at ? format(new Date(p.verified_at), 'yyyy-MM-dd HH:mm') : '',
      p.momo_number || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `verified-payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "Export complete",
      description: `Exported ${filtered.length} verified payments.`,
    });
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const verifiedPayments = payments.filter(p => p.status === 'verified');
  const rejectedPayments = payments.filter(p => p.status === 'rejected');

  const filteredPending = pendingPayments.filter((payment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.profile?.full_name?.toLowerCase().includes(query) ||
      payment.transaction_reference?.toLowerCase().includes(query) ||
      payment.description?.toLowerCase().includes(query)
    );
  });

  const filteredVerified = verifiedPayments.filter((payment) => {
    if (!verifiedSearchQuery) return true;
    const query = verifiedSearchQuery.toLowerCase();
    return (
      payment.profile?.full_name?.toLowerCase().includes(query) ||
      payment.transaction_reference?.toLowerCase().includes(query) ||
      payment.receipt_number?.toLowerCase().includes(query) ||
      payment.description?.toLowerCase().includes(query)
    );
  });

  const stats = {
    pending: pendingPayments.length,
    pendingAmount: pendingPayments.reduce((a, p) => a + p.amount, 0),
    verifiedToday: verifiedPayments.filter(p => 
      p.verified_at && 
      format(new Date(p.verified_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length,
    totalVerified: verifiedPayments.reduce((a, p) => a + p.amount, 0),
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="dashboard-card border-gold/30 bg-gold/5">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-gold" />
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
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
            <div className="dashboard-card border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.totalVerified)}</p>
                  <p className="text-sm text-muted-foreground">Total Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending" className="relative">
                Pending
                {stats.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-gold text-black text-xs">
                    {stats.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="verified">Verified History</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {/* Pending Payments */}
            <TabsContent value="pending" className="mt-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by member, reference, or description..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : filteredPending.length > 0 ? (
                <div className="space-y-3">
                  {filteredPending.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="dashboard-card border-gold/30"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-gold/10 text-gold">
                              pending
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
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsDialog(payment)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CreditCard className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No pending payments</h3>
                  <p className="text-muted-foreground">All payments have been processed.</p>
                </div>
              )}
            </TabsContent>

            {/* Verified History */}
            <TabsContent value="verified" className="mt-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by member, receipt, reference..." 
                    className="pl-10"
                    value={verifiedSearchQuery}
                    onChange={(e) => setVerifiedSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {filteredVerified.length > 0 ? (
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Transaction Ref</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVerified.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-sm">
                            {payment.receipt_number || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {payment.profile?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {payment.description || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.transaction_reference || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.verified_at ? format(new Date(payment.verified_at), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailsDialog(payment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No verified payments</h3>
                  <p className="text-muted-foreground">
                    {verifiedSearchQuery ? 'No payments match your search.' : 'Verified payments will appear here.'}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Rejected */}
            <TabsContent value="rejected" className="mt-6">
              {rejectedPayments.length > 0 ? (
                <div className="space-y-3">
                  {rejectedPayments.map((payment) => (
                    <div key={payment.id} className="dashboard-card border-destructive/30">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-destructive/10 text-destructive">
                              rejected
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">{payment.profile?.full_name || 'Unknown User'}</p>
                            <p className="text-muted-foreground">{payment.description || 'Payment'}</p>
                            <p className="text-muted-foreground">
                              Ref: <span className="font-mono">{payment.transaction_reference || 'N/A'}</span>
                            </p>
                            {payment.rejection_reason && (
                              <p className="text-xs text-destructive">
                                Reason: {payment.rejection_reason}
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
                  <p className="text-muted-foreground">Rejected payments will appear here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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

        {/* Payment Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                View payment information and history
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6 py-4">
                {/* Main Payment Info */}
                <div className="p-4 rounded-xl border bg-muted/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-display font-bold">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${selectedPayment.status === 'verified' ? 'bg-primary/10 text-primary' : ''}
                        ${selectedPayment.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                        ${selectedPayment.status === 'rejected' ? 'bg-destructive/10 text-destructive' : ''}
                      `}>
                        {selectedPayment.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member</p>
                      <p className="font-medium">{selectedPayment.profile?.full_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction Ref</p>
                      <p className="font-mono text-sm">{selectedPayment.transaction_reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">MoMo Number</p>
                      <p className="font-mono text-sm">{selectedPayment.momo_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-sm">{format(new Date(selectedPayment.created_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    {selectedPayment.receipt_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Receipt #</p>
                        <p className="font-mono text-sm font-semibold text-primary">{selectedPayment.receipt_number}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{selectedPayment.description || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Payment History (for related payments) */}
                {relatedPayments.length > 1 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Payment History ({relatedPayments.length} payments)
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ref</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedPayments.map((p) => (
                            <TableRow key={p.id} className={p.id === selectedPayment.id ? 'bg-muted/50' : ''}>
                              <TableCell className="text-sm">
                                {format(new Date(p.created_at), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(p.amount)}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                  ${p.status === 'verified' ? 'bg-primary/10 text-primary' : ''}
                                  ${p.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                                  ${p.status === 'rejected' ? 'bg-destructive/10 text-destructive' : ''}
                                `}>
                                  {p.status}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {p.transaction_reference || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Verified</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(relatedPayments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
