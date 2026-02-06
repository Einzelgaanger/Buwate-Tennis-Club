import { useState } from 'react';
import { X, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, CLUB_INFO } from '@/lib/constants';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId?: string;
  sessionId?: string;
  amount?: number;
  description?: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  sessionId,
  amount: presetAmount,
  description: presetDescription,
}: PaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [amount, setAmount] = useState(presetAmount?.toString() || '');
  const [transactionRef, setTransactionRef] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [description, setDescription] = useState(presetDescription || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedAmount = parseInt(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (!transactionRef.trim()) {
      toast({
        title: "Transaction reference required",
        description: "Please enter the MoMo transaction reference.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        booking_id: bookingId || null,
        session_id: sessionId || null,
        amount: parsedAmount,
        payment_method: 'momo',
        momo_number: momoNumber || null,
        transaction_reference: transactionRef.trim(),
        description: description || 'Payment',
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "Payment submitted!",
        description: "Your payment is pending verification by admin.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-display text-xl font-bold">Submit Payment</h2>
            <p className="text-sm text-muted-foreground">
              Enter your MoMo transaction details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Info */}
          <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold" />
              <h3 className="font-semibold">Send Payment To</h3>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="font-semibold text-lg">{CLUB_INFO.momoNumber}</p>
              <p className="text-sm text-muted-foreground">{CLUB_INFO.momoName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (UGX)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={!!presetAmount}
              />
              {amount && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(parseInt(amount) || 0)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionRef">Transaction Reference *</Label>
              <Input
                id="transactionRef"
                placeholder="e.g., TXN123456789"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                The reference number from your MoMo confirmation message
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="momoNumber">Your MoMo Number (optional)</Label>
              <Input
                id="momoNumber"
                placeholder="e.g., 0770123456"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this payment for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 btn-primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
