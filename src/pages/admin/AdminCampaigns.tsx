import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Edit2, Trash2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  created_at: string;
}

interface Pledge {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  paid_amount: number | null;
  status: string | null;
  pledge_date: string;
  campaign_id: string | null;
  purpose: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AdminCampaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
  });

  useEffect(() => {
    fetchCampaigns();
    fetchPledges();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPledges = async () => {
    try {
      const { data, error } = await supabase
        .from('pledges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPledges(data || []);
    } catch (error) {
      console.error('Error fetching pledges:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.title || !formData.goal_amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          title: formData.title,
          description: formData.description || null,
          goal_amount: parseInt(formData.goal_amount),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Campaign created!",
        description: "Members can now view and contribute to this campaign.",
      });

      setShowCreateDialog(false);
      resetForm();
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          title: formData.title,
          description: formData.description || null,
          goal_amount: parseInt(formData.goal_amount),
          start_date: formData.start_date,
          end_date: formData.end_date || null,
        })
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      toast({
        title: "Campaign updated!",
        description: "The campaign has been updated successfully.",
      });

      setShowEditDialog(false);
      setSelectedCampaign(null);
      resetForm();
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      toast({
        title: "Campaign deleted",
        description: "The campaign has been removed.",
      });

      setShowDeleteDialog(false);
      setSelectedCampaign(null);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete campaign.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Campaign marked as ${status}.`,
      });

      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyPledgePayment = async (pledge: Pledge) => {
    try {
      const { error } = await supabase
        .from('pledges')
        .update({
          status: 'fulfilled',
          paid_amount: pledge.amount,
          remaining_amount: 0,
        })
        .eq('id', pledge.id);

      if (error) throw error;

      // Update campaign raised amount
      if (pledge.campaign_id) {
        const campaign = campaigns.find(c => c.id === pledge.campaign_id);
        if (campaign) {
          await supabase
            .from('campaigns')
            .update({ raised_amount: campaign.raised_amount + pledge.amount })
            .eq('id', pledge.campaign_id);
        }
      }

      // Log the action
      await supabase
        .from('action_logs')
        .insert({
          admin_id: user?.id!,
          action_type: 'verify_pledge',
          entity_type: 'pledge',
          entity_id: pledge.id,
          details: { amount: pledge.amount, member_name: pledge.member_name },
        });

      toast({
        title: "Pledge verified!",
        description: "The pledge payment has been confirmed.",
      });

      fetchPledges();
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify pledge.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_amount: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
    });
  };

  const openEditDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description || '',
      goal_amount: campaign.goal_amount.toString(),
      start_date: campaign.start_date,
      end_date: campaign.end_date || '',
    });
    setShowEditDialog(true);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400';
      case 'completed': return 'bg-blue-500/10 text-blue-400';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
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
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalRaised: campaigns.reduce((sum, c) => sum + c.raised_amount, 0),
    totalGoal: campaigns.reduce((sum, c) => sum + c.goal_amount, 0),
    pendingPledges: pledges.filter(p => p.status === 'pending').length,
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Fundraising
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Campaigns & Pledges
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage fundraising campaigns and member pledges
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold">{stats.activeCampaigns}</p>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-display font-bold">{formatCurrency(stats.totalRaised)}</p>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-display font-bold">
                    {stats.totalGoal > 0 ? Math.round((stats.totalRaised / stats.totalGoal) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card border-gold/30 bg-gold/5">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-gold" />
                <div>
                  <p className="text-2xl font-display font-bold">{stats.pendingPledges}</p>
                  <p className="text-sm text-muted-foreground">Pending Pledges</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="pledges">All Pledges</TabsTrigger>
              </TabsList>
              {activeTab === 'campaigns' && (
                <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              )}
            </div>

            <TabsContent value="campaigns">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <motion.div
                      key={campaign.id}
                      variants={itemVariants}
                      className="dashboard-card"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display text-lg font-semibold">{campaign.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                          )}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{formatCurrency(campaign.raised_amount)} raised</span>
                              <span className="text-muted-foreground">of {formatCurrency(campaign.goal_amount)}</span>
                            </div>
                            <Progress value={getProgressPercentage(campaign.raised_amount, campaign.goal_amount)} className="h-2" />
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Started {format(new Date(campaign.start_date), 'MMM d, yyyy')}
                            </span>
                            {campaign.end_date && (
                              <span>Ends {format(new Date(campaign.end_date), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {campaign.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateCampaignStatus(campaign.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(campaign)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Target className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first fundraising campaign</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pledges">
              {pledges.length > 0 ? (
                <div className="space-y-3">
                  {pledges.map((pledge) => (
                    <div key={pledge.id} className="dashboard-card">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">{pledge.member_name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPledgeStatusColor(pledge.status)}`}>
                              {pledge.status}
                            </span>
                          </div>
                          <p className="text-lg font-display font-bold">{formatCurrency(pledge.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {pledge.purpose || 'General pledge'} • Pledged on {format(new Date(pledge.pledge_date), 'MMM d, yyyy')}
                          </p>
                          {pledge.paid_amount && pledge.paid_amount > 0 && (
                            <p className="text-sm text-emerald-400">Paid: {formatCurrency(pledge.paid_amount)}</p>
                          )}
                        </div>
                        {pledge.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyPledgePayment(pledge)}
                            className="btn-primary"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Clock className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No pledges yet</h3>
                  <p className="text-muted-foreground">Member pledges will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Create a new fundraising campaign for members to contribute to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Court Renovation Fund"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the purpose of this campaign..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Goal Amount (UGX) *</Label>
                <Input
                  type="number"
                  value={formData.goal_amount}
                  onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                  placeholder="5000000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={processing} className="btn-primary">
                {processing ? 'Creating...' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Campaign Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>
                Update the campaign details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Goal Amount (UGX) *</Label>
                <Input
                  type="number"
                  value={formData.goal_amount}
                  onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCampaign} disabled={processing} className="btn-primary">
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the campaign "{selectedCampaign?.title}". 
                Associated pledges will not be deleted but will no longer be linked to this campaign.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCampaign}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {processing ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
