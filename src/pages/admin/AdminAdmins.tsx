import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Search, Crown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

interface AdminWithProfile extends UserRole {
  profile?: Profile;
  created_by_profile?: Profile;
}

const SUPER_ADMIN_EMAIL = 'buwatetc@gmail.com';

export default function AdminAdmins() {
  const { user, profile: currentProfile } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  useEffect(() => {
    checkSuperAdmin();
    fetchAdmins();
  }, [user]);

  const checkSuperAdmin = async () => {
    if (!user) return;
    
    // Check if current user is super admin
    const { data } = await supabase
      .from('user_roles')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setIsSuperAdmin(data?.is_super_admin || false);
  };

  const fetchAdmins = async () => {
    try {
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (adminRoles) {
        const userIds = [...new Set([
          ...adminRoles.map(r => r.user_id),
          ...adminRoles.filter(r => r.created_by).map(r => r.created_by!)
        ])];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        const adminsWithProfiles = adminRoles.map(role => ({
          ...role,
          profile: profiles?.find(p => p.user_id === role.user_id),
          created_by_profile: role.created_by 
            ? profiles?.find(p => p.user_id === role.created_by)
            : undefined,
        }));

        setAdmins(adminsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim() || !user) return;
    
    setAddingAdmin(true);
    try {
      // Find user by email
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('email', newAdminEmail.trim().toLowerCase())
        .single();

      if (!targetProfile) {
        throw new Error('User not found. They must sign up first.');
      }

      // Check if already an admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', targetProfile.user_id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        throw new Error('This user is already an admin.');
      }

      // Update or insert role
      const { data: currentRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', targetProfile.user_id)
        .single();

      if (currentRole) {
        await supabase
          .from('user_roles')
          .update({ role: 'admin', created_by: user.id })
          .eq('id', currentRole.id);
      } else {
        await supabase
          .from('user_roles')
          .insert({ 
            user_id: targetProfile.user_id, 
            role: 'admin',
            created_by: user.id 
          });
      }

      // Log action
      await supabase.from('action_logs').insert({
        admin_id: user.id,
        action_type: 'add_admin',
        entity_type: 'user_roles',
        entity_id: targetProfile.user_id,
        details: { email: newAdminEmail, name: targetProfile.full_name },
      });

      toast({
        title: "Admin added!",
        description: `${targetProfile.full_name} is now an admin.`,
      });

      setShowAddDialog(false);
      setNewAdminEmail('');
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin.",
        variant: "destructive",
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!deletingAdminId || !user) return;

    try {
      const adminToDelete = admins.find(a => a.id === deletingAdminId);
      
      if (adminToDelete?.is_super_admin) {
        throw new Error('Cannot remove the super admin.');
      }

      // Change role to member instead of deleting
      await supabase
        .from('user_roles')
        .update({ role: 'member' })
        .eq('id', deletingAdminId);

      // Log action
      await supabase.from('action_logs').insert({
        admin_id: user.id,
        action_type: 'remove_admin',
        entity_type: 'user_roles',
        entity_id: adminToDelete?.user_id,
        details: { email: adminToDelete?.profile?.email, name: adminToDelete?.profile?.full_name },
      });

      toast({
        title: "Admin removed",
        description: "User has been changed to member role.",
      });

      setDeletingAdminId(null);
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin.",
        variant: "destructive",
      });
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      admin.profile?.full_name.toLowerCase().includes(query) ||
      admin.profile?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Admin Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage system administrators
              </p>
            </div>
            {isSuperAdmin && (
              <Button onClick={() => setShowAddDialog(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            )}
          </div>

          {!isSuperAdmin && (
            <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 text-sm">
              <p className="text-gold font-medium">
                Only the super admin ({SUPER_ADMIN_EMAIL}) can add or remove other admins.
              </p>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search admins..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredAdmins.length > 0 ? (
            <div className="space-y-3">
              {filteredAdmins.map((admin) => (
                <div 
                  key={admin.id} 
                  className={`dashboard-card ${admin.is_super_admin ? 'border-gold/50 bg-gold/5' : ''}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        admin.is_super_admin ? 'bg-gold/20' : 'bg-primary/10'
                      }`}>
                        {admin.is_super_admin ? (
                          <Crown className="w-6 h-6 text-gold" />
                        ) : (
                          <Shield className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{admin.profile?.full_name || 'Unknown'}</p>
                          {admin.is_super_admin && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-gold">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{admin.profile?.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          Added {format(new Date(admin.created_at), 'MMM d, yyyy')}
                          {admin.created_by_profile && (
                            <span>by {admin.created_by_profile.full_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSuperAdmin && !admin.is_super_admin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingAdminId(admin.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Shield className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No admins found</h3>
              <p className="text-muted-foreground">No matching administrators.</p>
            </div>
          )}
        </div>

        {/* Add Admin Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Enter the email of the user you want to make an admin. They must already have an account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>User Email</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAdmin} disabled={addingAdmin || !newAdminEmail.trim()}>
                {addingAdmin ? 'Adding...' : 'Add Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Admin Confirmation */}
        <AlertDialog open={!!deletingAdminId} onOpenChange={() => setDeletingAdminId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Admin?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove admin privileges from this user. They will be changed to a member role.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveAdmin}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Admin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
