import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Court = Database['public']['Tables']['courts']['Row'];
type CourtStatus = Database['public']['Enums']['court_status'];

export default function AdminCourts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    surface: 'Clay',
    description: '',
    has_floodlights: true,
    status: 'active' as CourtStatus,
    notes: '',
  });

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const { data } = await supabase
        .from('courts')
        .select('*')
        .order('name', { ascending: true });

      if (data) {
        setCourts(data);
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingCourt(null);
    setFormData({
      name: '',
      surface: 'Clay',
      description: '',
      has_floodlights: true,
      status: 'active',
      notes: '',
    });
    setShowEditDialog(true);
  };

  const openEditDialog = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      surface: court.surface || 'Clay',
      description: court.description || '',
      has_floodlights: court.has_floodlights ?? true,
      status: court.status || 'active',
      notes: court.notes || '',
    });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Court name is required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editingCourt) {
        const { error } = await supabase
          .from('courts')
          .update({
            name: formData.name,
            surface: formData.surface,
            description: formData.description || null,
            has_floodlights: formData.has_floodlights,
            status: formData.status,
            notes: formData.notes || null,
          })
          .eq('id', editingCourt.id);

        if (error) throw error;

        // Log action
        await supabase.from('action_logs').insert({
          admin_id: user?.id,
          action_type: 'update_court',
          entity_type: 'courts',
          entity_id: editingCourt.id,
          details: { name: formData.name },
        });

        toast({ title: "Court updated!", description: `${formData.name} has been updated.` });
      } else {
        const { data, error } = await supabase
          .from('courts')
          .insert({
            name: formData.name,
            surface: formData.surface,
            description: formData.description || null,
            has_floodlights: formData.has_floodlights,
            status: formData.status,
            notes: formData.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Log action
        await supabase.from('action_logs').insert({
          admin_id: user?.id,
          action_type: 'create_court',
          entity_type: 'courts',
          entity_id: data.id,
          details: { name: formData.name },
        });

        toast({ title: "Court created!", description: `${formData.name} has been added.` });
      }

      setShowEditDialog(false);
      fetchCourts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save court.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourtId) return;

    try {
      const court = courts.find(c => c.id === deletingCourtId);
      
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', deletingCourtId);

      if (error) throw error;

      // Log action
      await supabase.from('action_logs').insert({
        admin_id: user?.id,
        action_type: 'delete_court',
        entity_type: 'courts',
        entity_id: deletingCourtId,
        details: { name: court?.name },
      });

      toast({ title: "Court deleted", description: "The court has been removed." });
      setDeletingCourtId(null);
      fetchCourts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete court.", variant: "destructive" });
    }
  };

  const filteredCourts = courts.filter((court) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      court.name.toLowerCase().includes(query) ||
      court.surface?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: CourtStatus | null) => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary';
      case 'maintenance': return 'bg-gold/10 text-gold';
      case 'closed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold truncate">Courts</h1>
              <p className="text-muted-foreground mt-1">
                Manage tennis courts
              </p>
            </div>
            <Button onClick={openAddDialog} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Court
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search courts..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredCourts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourts.map((court) => (
                <div key={court.id} className="dashboard-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{court.name}</h3>
                      <p className="text-sm text-muted-foreground">{court.surface} surface</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(court.status)}`}>
                      {court.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p className="flex items-center gap-2">
                      {court.has_floodlights ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Has floodlights
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                          No floodlights
                        </>
                      )}
                    </p>
                    {court.description && (
                      <p className="line-clamp-2">{court.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(court)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingCourtId(court.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Wrench className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No courts found</h3>
              <p className="text-muted-foreground mb-6">Add your first court to get started.</p>
              <Button onClick={openAddDialog} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Court
              </Button>
            </div>
          )}
        </div>

        {/* Edit/Add Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCourt ? 'Edit Court' : 'Add New Court'}</DialogTitle>
              <DialogDescription>
                {editingCourt ? 'Update court details.' : 'Add a new tennis court to the system.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Court Name *</Label>
                <Input
                  placeholder="e.g., Court 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Surface</Label>
                <Select value={formData.surface} onValueChange={(v) => setFormData({ ...formData, surface: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clay">Clay</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Grass">Grass</SelectItem>
                    <SelectItem value="Synthetic">Synthetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as CourtStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="floodlights">Has Floodlights</Label>
                <Switch
                  id="floodlights"
                  checked={formData.has_floodlights}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_floodlights: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Internal notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingCourt ? 'Update Court' : 'Add Court'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingCourtId} onOpenChange={() => setDeletingCourtId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Court?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this court. Any existing bookings will be orphaned.
                Consider setting status to "Closed" instead.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Court
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
