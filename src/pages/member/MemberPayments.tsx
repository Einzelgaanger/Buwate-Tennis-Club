import { CreditCard, Plus, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, CLUB_INFO } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Payment = Database['public']['Tables']['payments']['Row'];

export default function MemberPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === 'all') return true;
    return payment.status === filterStatus;
  });

  const stats = {
    pending: payments.filter(p => p.status === 'pending').length,
    verified: payments.filter(p => p.status === 'verified').length,
    total: payments.reduce((acc, p) => p.status === 'verified' ? acc + p.amount : acc, 0),
  };

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Payments</h1>
              <p className="text-muted-foreground mt-1">
                View your payment history and submit new payments
              </p>
            </div>
            <Button onClick={() => setShowPaymentModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Submit Payment
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="dashboard-card">
              <p className="text-sm text-muted-foreground">Pending Verification</p>
              <p className="text-2xl font-display font-bold text-gold">{stats.pending}</p>
            </div>
            <div className="dashboard-card">
              <p className="text-sm text-muted-foreground">Verified Payments</p>
              <p className="text-2xl font-display font-bold text-primary">{stats.verified}</p>
            </div>
            <div className="dashboard-card">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-display font-bold">{formatCurrency(stats.total)}</p>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="dashboard-card bg-primary/5 border-primary/20">
            <h3 className="font-display font-semibold mb-3">Payment Information</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All payments are made via Mobile Money only. No cash accepted.
            </p>
            <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold">{CLUB_INFO.momoNumber}</p>
                <p className="text-sm text-muted-foreground">{CLUB_INFO.momoName}</p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="dashboard-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
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
                      <p className="text-sm text-muted-foreground mt-1">
                        {payment.description || 'Payment'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ref: {payment.transaction_reference || 'N/A'} • {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {payment.status === 'rejected' && payment.rejection_reason && (
                        <p className="text-xs text-destructive mt-2">
                          Reason: {payment.rejection_reason}
                        </p>
                      )}
                    </div>
                    {payment.receipt_number && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Receipt</p>
                        <p className="font-mono text-sm">{payment.receipt_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CreditCard className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground mb-6">Your payment history will appear here.</p>
              <Button onClick={() => setShowPaymentModal(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Submit Payment
              </Button>
            </div>
          )}
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={fetchPayments}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
