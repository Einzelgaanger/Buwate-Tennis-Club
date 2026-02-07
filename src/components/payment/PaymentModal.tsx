import { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, CLUB_INFO } from '@/lib/constants';
import { MobileMoneyIcon } from '@/components/icons/MobileMoneyIcon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId?: string;
  sessionId?: string;
  amount?: number;
  paidAmount?: number;
  description?: string;
  allowPartial?: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  sessionId,
  amount: totalAmount,
  paidAmount = 0,
  description: presetDescription,
  allowPartial = true,
}: PaymentModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const remainingBalance = (totalAmount || 0) - paidAmount;
  const [amount, setAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // For partial payments, default to remaining balance
      setAmount(remainingBalance > 0 ? remainingBalance.toString() : '');
      setTransactionRef('');
      setMomoNumber('');
      setDescription(presetDescription || '');
    }
  }, [isOpen, remainingBalance, presetDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedAmount = parseInt(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    if (totalAmount && parsedAmount > remainingBalance) {
      toast({
        title: "Amount exceeds balance",
        description: `Maximum payment allowed is ${formatCurrency(remainingBalance)}.`,
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
      // Create payment record
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

      // Send notification to admins
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'payment_submitted',
            data: {
              memberName: profile?.full_name || 'Member',
              amount: parsedAmount,
              transactionRef: transactionRef.trim(),
              description: description || 'Payment',
              isPartialPayment: totalAmount ? parsedAmount < remainingBalance : false,
              totalAmount: totalAmount || parsedAmount,
              paidSoFar: paidAmount + parsedAmount,
              remainingAfter: remainingBalance - parsedAmount,
            },
          },
        });
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
      }

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

  const progressPercentage = totalAmount ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 overflow-hidden">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[90vh] flex flex-col min-h-0 pb-[env(safe-area-inset-bottom)] sm:pb-0">
        {/* Header - fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold truncate">Submit Payment</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your MoMo transaction details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-lg hover:bg-muted transition-colors shrink-0 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Payment Info */}
            <div className="p-3 sm:p-4 rounded-xl border border-gold/30 bg-gold/5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <MobileMoneyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gold shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base">Send Payment To</h3>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-background">
                <p className="font-semibold text-base sm:text-lg break-all">{CLUB_INFO.momoNumber}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{CLUB_INFO.momoName}</p>
              </div>
            </div>

            {/* Partial Payment Progress */}
            {totalAmount && paidAmount > 0 && (
              <div className="p-3 sm:p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-sm">Payment Progress</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Paid: {formatCurrency(paidAmount)}</span>
                    <span className="text-muted-foreground">of {formatCurrency(totalAmount)}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(progressPercentage)}% complete
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-background">
                  <p className="text-sm font-medium">Remaining Balance</p>
                  <p className="text-xl font-display font-bold text-primary">{formatCurrency(remainingBalance)}</p>
                </div>
              </div>
            )}

            {/* Total Amount Display (if full payment) */}
            {totalAmount && paidAmount === 0 && (
              <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-muted/30">
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-2xl font-display font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="amount" className="text-sm">
                  Amount to Pay (UGX) *
                  {allowPartial && totalAmount && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Partial payments allowed)
                    </span>
                  )}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g., 10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  max={remainingBalance > 0 ? remainingBalance : undefined}
                  className="h-10 sm:h-11 text-base touch-manipulation"
                />
                {amount && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatCurrency(parseInt(amount) || 0)}
                    {totalAmount && parseInt(amount) < remainingBalance && (
                      <span className="text-blue-400 ml-2">
                        (Partial - {formatCurrency(remainingBalance - (parseInt(amount) || 0))} will remain)
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="transactionRef" className="text-sm">Transaction Reference *</Label>
                <Input
                  id="transactionRef"
                  placeholder="e.g., TXN123456789"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  required
                  className="h-10 sm:h-11 text-base touch-manipulation"
                />
                <p className="text-xs text-muted-foreground">
                  The reference number from your MoMo confirmation message
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="momoNumber" className="text-sm">Your MoMo Number (optional)</Label>
                <Input
                  id="momoNumber"
                  placeholder="e.g., 0770123456"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="h-10 sm:h-11 text-base touch-manipulation"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this payment for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="min-h-[72px] sm:min-h-[80px] text-base resize-none touch-manipulation"
                />
              </div>
            </div>
          </div>

          {/* Footer - fixed */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t flex-shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 sm:h-10 touch-manipulation">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-11 sm:h-10 btn-primary touch-manipulation" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
