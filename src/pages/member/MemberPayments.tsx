import { CreditCard, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, CLUB_INFO } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'];

export default function MemberPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Submit Payment
            </Button>
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

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="dashboard-card flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.description || 'Payment'} • Ref: {payment.transaction_reference || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`
                    inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize
                    ${payment.status === 'verified' ? 'bg-primary/10 text-primary' : ''}
                    ${payment.status === 'pending' ? 'bg-gold/10 text-gold' : ''}
                    ${payment.status === 'rejected' ? 'bg-destructive/10 text-destructive' : ''}
                  `}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CreditCard className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground">Your payment history will appear here.</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
