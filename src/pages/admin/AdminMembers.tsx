import { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Mail, Phone, Edit, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

interface MemberWithRole extends Profile {
  role?: string;
}

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<MemberWithRole | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editMembershipType, setEditMembershipType] = useState<string>('pay_as_you_play');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      // Get all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Get all roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      if (profiles && roles) {
        const membersWithRoles = profiles.map((profile) => {
          const role = roles.find((r) => r.user_id === profile.user_id);
          return {
            ...profile,
            role: role?.role || 'member',
          };
        });
        setMembers(membersWithRoles.filter(m => m.role === 'member'));
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member: MemberWithRole) => {
    setSelectedMember(member);
    setEditStatus(member.status || 'active');
    setEditMembershipType(member.membership_type || 'pay_as_you_play');
    setShowEditDialog(true);
  };

  const handleSaveMember = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: editStatus as any,
          membership_type: editMembershipType as any,
        })
        .eq('id', selectedMember.id);

      if (error) throw error;

      toast({
        title: "Member updated",
        description: "Member details have been updated successfully.",
      });

      setShowEditDialog(false);
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update member.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member suspended",
        description: "The member has been suspended.",
      });

      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend member.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = !searchQuery || 
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold truncate">Members</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage club members ({members.length} total)
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or phone..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {filteredMembers.map((member) => (
                <div key={member.id} className="dashboard-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.full_name} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="font-semibold text-primary">
                            {member.full_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{member.full_name}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground truncate">
                          {member.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </span>
                          )}
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <span className={`
                            inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize
                            ${member.status === 'active' ? 'bg-primary/10 text-primary' : ''}
                            ${member.status === 'inactive' ? 'bg-muted text-muted-foreground' : ''}
                            ${member.status === 'suspended' ? 'bg-destructive/10 text-destructive' : ''}
                          `}>
                            {member.status}
                          </span>
                          <span className="badge-primary capitalize">
                            {member.membership_type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {format(new Date(member.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditMember(member)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          {member.status !== 'suspended' && (
                            <DropdownMenuItem 
                              onClick={() => handleSuspendMember(member.id)}
                              className="text-destructive"
                            >
                              Suspend Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-16">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">No members found</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Edit Member Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update member status and membership type
              </DialogDescription>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {selectedMember.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedMember.full_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Membership Type</Label>
                  <Select value={editMembershipType} onValueChange={setEditMembershipType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pay_as_you_play">Pay As You Play</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMember} className="btn-primary">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
