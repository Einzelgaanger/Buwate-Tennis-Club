import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Clock, CheckCircle, Heart, Send, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { MobileMoneyIcon } from '@/components/icons/MobileMoneyIcon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  goal_amount: number;
  raised_amount: number;
  start_date: string;
  end_date: string | null;
  status: string;
}

interface Pledge {
  id: string;
  amount: number;
  paid_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
  pledge_date: string;
  due_date: string;
  campaign_id: string | null;
  purpose: string | null;
  notes: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function MemberActivities() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myPledges, setMyPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPledgeDialog, setShowPledgeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedPledge, setSelectedPledge] = useState<Pledge | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');

  const [pledgeType, setPledgeType] = useState<'pledge' | 'pay_now'>('pledge');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgePaymentAmount, setPledgePaymentAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    momoNumber: '',
    transactionRef: '',
    notes: '',
  });

  useEffect(() => {
    fetchCampaigns();
    fetchMyPledges();
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPledges = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('pledges')
        .select('*')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyPledges(data || []);
    } catch (error) {
      console.error('Error fetching pledges:', error);
    }
  };

  const handleMakePledge = async () => {
    if (!selectedCampaign || !pledgeAmount || !user || !profile) return;

    setProcessing(true);
    try {
      const amount = parseInt(pledgeAmount);
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1); // Due in 1 month

      // Create pledge - don't set remaining_amount, let DB handle it
      const { data: pledgeData, error: pledgeError } = await supabase
        .from('pledges')
        .insert({
          member_id: user.id,
          member_name: profile.full_name,
          amount,
          pledge_date: format(new Date(), 'yyyy-MM-dd'),
          due_date: format(dueDate, 'yyyy-MM-dd'),
          campaign_id: selectedCampaign.id,
          purpose: selectedCampaign.title,
          status: 'pending',
          paid_amount: 0,
        })
        .select()
        .single();

      if (pledgeError) throw pledgeError;

      if (pledgeType === 'pay_now') {
        // Show payment dialog
        setSelectedPledge(pledgeData);
        setShowPledgeDialog(false);
        setShowPaymentDialog(true);
      } else {
        toast({
          title: "Pledge submitted!",
          description: "Your pledge has been recorded. You can submit payment anytime.",
        });
        setShowPledgeDialog(false);
        resetForm();
        fetchMyPledges();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit pledge.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPledge || !user || !profile) return;

    const paymentAmount = parseInt(pledgePaymentAmount) || 0;
    if (paymentAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentDetails.momoNumber || !paymentDetails.transactionRef) {
      toast({
        title: "Missing details",
        description: "Please provide your MoMo number and transaction reference.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      // Create payment record for verification
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: paymentAmount,
          description: `Pledge payment: ${selectedPledge.purpose || 'Campaign contribution'}`,
          payment_method: 'momo',
          momo_number: paymentDetails.momoNumber,
          transaction_reference: paymentDetails.transactionRef,
          notes: `Pledge ID: ${selectedPledge.id}. ${paymentDetails.notes || ''}`,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      // Update pledge with pending payment tracking
      const newPaidAmount = (selectedPledge.paid_amount || 0) + paymentAmount;
      const isFullPayment = newPaidAmount >= selectedPledge.amount;
      
      // Update pledge status based on payment - remaining_amount handled by trigger
      await supabase
        .from('pledges')
        .update({
          paid_amount: newPaidAmount,
          status: isFullPayment ? 'fulfilled' : 'partial',
        })
        .eq('id', selectedPledge.id);

      // Update campaign raised amount
      if (selectedPledge.campaign_id) {
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('raised_amount')
          .eq('id', selectedPledge.campaign_id)
          .single();
        
        if (campaign) {
          await supabase
            .from('campaigns')
            .update({
              raised_amount: campaign.raised_amount + paymentAmount,
            })
            .eq('id', selectedPledge.campaign_id);
        }
      }

      toast({
        title: "Payment submitted!",
        description: "Your payment is pending admin verification.",
      });

      setShowPaymentDialog(false);
      resetForm();
      fetchMyPledges();
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payment.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openPledgeDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPledgeAmount('');
    setPledgeType('pledge');
    setShowPledgeDialog(true);
  };

  const openPaymentForPledge = (pledge: Pledge) => {
    setSelectedPledge(pledge);
    const remaining = pledge.remaining_amount || pledge.amount;
    setPledgePaymentAmount(remaining.toString());
    setPaymentDetails({ momoNumber: '', transactionRef: '', notes: '' });
    setShowPaymentDialog(true);
  };

  const resetForm = () => {
    setPledgeAmount('');
    setPledgePaymentAmount('');
    setPledgeType('pledge');
    setPaymentDetails({ momoNumber: '', transactionRef: '', notes: '' });
    setSelectedCampaign(null);
    setSelectedPledge(null);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  const getPledgeStatusColor = (status: string | null) => {
    switch (status) {
      case 'fulfilled': return 'bg-emerald-500/10 text-emerald-400';
      case 'partial': return 'bg-blue-500/10 text-blue-400';
      case 'pending': return 'bg-gold/10 text-gold';
      case 'overdue': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const stats = {
    totalPledged: myPledges.reduce((sum, p) => sum + p.amount, 0),
    totalPaid: myPledges.reduce((sum, p) => sum + (p.paid_amount || 0), 0),
    pendingCount: myPledges.filter(p => p.status === 'pending').length,
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Club Activities
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Activities & Campaigns
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Support club initiatives and track your pledges
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.totalPledged)}</p>
                  <p className="text-sm text-muted-foreground">Total Pledged</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.totalPaid)}</p>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-gold/30 bg-gold/5">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-gold" />
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
              <TabsTrigger value="my-pledges">My Pledges</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : campaigns.length > 0 ? (
                <div className="grid gap-4">
                  {campaigns.map((campaign) => (
                    <motion.div
                      key={campaign.id}
                      variants={itemVariants}
                      className="dashboard-card"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Target className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-display text-lg font-semibold">{campaign.title}</h3>
                          </div>
                          {campaign.description && (
                            <p className="text-muted-foreground mb-4">{campaign.description}</p>
                          )}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{formatCurrency(campaign.raised_amount)} raised</span>
                              <span className="text-muted-foreground">Goal: {formatCurrency(campaign.goal_amount)}</span>
                            </div>
                            <Progress value={getProgressPercentage(campaign.raised_amount, campaign.goal_amount)} className="h-3" />
                            <p className="text-xs text-muted-foreground text-right">
                              {Math.round(getProgressPercentage(campaign.raised_amount, campaign.goal_amount))}% achieved
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Started {format(new Date(campaign.start_date), 'MMM d, yyyy')}
                            </span>
                            {campaign.end_date && (
                              <span>Ends {format(new Date(campaign.end_date), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <Button onClick={() => openPledgeDialog(campaign)} className="btn-primary shrink-0">
                          <Heart className="w-4 h-4 mr-2" />
                          Contribute
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Target className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No active campaigns</h3>
                  <p className="text-muted-foreground">Check back later for new club initiatives</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-pledges" className="mt-6">
              {myPledges.length > 0 ? (
                <div className="space-y-3">
                  {myPledges.map((pledge) => (
                    <motion.div
                      key={pledge.id}
                      variants={itemVariants}
                      className="dashboard-card"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">{pledge.purpose || 'General Pledge'}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPledgeStatusColor(pledge.status)}`}>
                              {pledge.status}
                            </span>
                          </div>
                          <p className="text-2xl font-display font-bold">{formatCurrency(pledge.amount)}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Pledged: {format(new Date(pledge.pledge_date), 'MMM d, yyyy')}</span>
                            <span>Due: {format(new Date(pledge.due_date), 'MMM d, yyyy')}</span>
                          </div>
                          {pledge.paid_amount && pledge.paid_amount > 0 && (
                            <p className="text-sm text-emerald-400 mt-1">
                              Paid: {formatCurrency(pledge.paid_amount)} 
                              {pledge.remaining_amount && pledge.remaining_amount > 0 && (
                                <span className="text-muted-foreground"> • Remaining: {formatCurrency(pledge.remaining_amount)}</span>
                              )}
                            </p>
                          )}
                        </div>
                        {pledge.status === 'pending' && (
                          <Button
                            onClick={() => openPaymentForPledge(pledge)}
                            className="btn-primary shrink-0"
                          >
                            <MobileMoneyIcon className="w-4 h-4 mr-2" />
                            Submit Payment
                          </Button>
                        )}
                        {pledge.status === 'fulfilled' && (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Paid</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No pledges yet</h3>
                  <p className="text-muted-foreground">Contribute to an active campaign to get started</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Pledge Dialog */}
        <Dialog open={showPledgeDialog} onOpenChange={setShowPledgeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contribute to {selectedCampaign?.title}</DialogTitle>
              <DialogDescription>
                Choose to pledge now and pay later, or pay immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Amount (UGX) *</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1000"
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                  placeholder="Enter amount (e.g., 50000)"
                  className="text-base"
                />
                {pledgeAmount && parseInt(pledgeAmount) > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(parseInt(pledgeAmount))}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>How would you like to contribute?</Label>
                <RadioGroup value={pledgeType} onValueChange={(v) => setPledgeType(v as 'pledge' | 'pay_now')}>
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="pledge" id="pledge" />
                    <div className="flex-1">
                      <Label htmlFor="pledge" className="cursor-pointer font-medium">Pledge & Pay Later</Label>
                      <p className="text-sm text-muted-foreground">Commit now, pay at your convenience</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="pay_now" id="pay_now" />
                    <div className="flex-1">
                      <Label htmlFor="pay_now" className="cursor-pointer font-medium">Pay Now</Label>
                      <p className="text-sm text-muted-foreground">Submit payment details immediately</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPledgeDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMakePledge} 
                disabled={processing || !pledgeAmount} 
                className="btn-primary"
              >
                {processing ? 'Submitting...' : pledgeType === 'pay_now' ? 'Continue to Payment' : 'Submit Pledge'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Payment</DialogTitle>
              <DialogDescription>
                Enter your Mobile Money payment details for verification.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Pledge Info */}
              {selectedPledge && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Pledged</span>
                    <span className="font-semibold">{formatCurrency(selectedPledge.amount)}</span>
                  </div>
                  {(selectedPledge.paid_amount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-500">Already Paid</span>
                      <span className="font-semibold text-emerald-500">{formatCurrency(selectedPledge.paid_amount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Remaining Balance</span>
                    <span className="text-lg font-display font-bold text-primary">
                      {formatCurrency(selectedPledge.remaining_amount || selectedPledge.amount)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Amount Input for Partial Payment */}
              <div className="space-y-2">
                <Label>Amount to Pay (UGX) *</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={pledgePaymentAmount}
                  onChange={(e) => setPledgePaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1000"
                  max={selectedPledge?.remaining_amount || selectedPledge?.amount}
                />
                {pledgePaymentAmount && parseInt(pledgePaymentAmount) > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(parseInt(pledgePaymentAmount))}
                    {selectedPledge && parseInt(pledgePaymentAmount) < (selectedPledge.remaining_amount || selectedPledge.amount) && (
                      <span className="text-blue-500 ml-2">(Partial payment)</span>
                    )}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>MoMo Number *</Label>
                <Input
                  value={paymentDetails.momoNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, momoNumber: e.target.value })}
                  placeholder="0772 XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Transaction Reference *</Label>
                <Input
                  value={paymentDetails.transactionRef}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionRef: e.target.value })}
                  placeholder="Enter MoMo transaction ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={paymentDetails.notes}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitPayment} disabled={processing || !pledgePaymentAmount} className="btn-primary">
                <Send className="w-4 h-4 mr-2" />
                {processing ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
