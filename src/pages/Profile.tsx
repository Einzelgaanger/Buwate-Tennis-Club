import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2, Shield, Sparkles, Camera, Users, Plus, Trash2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Dependent = Database['public']['Tables']['dependents']['Row'];
type DependentRelationship = Database['public']['Enums']['dependent_relationship'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [showAddDependent, setShowAddDependent] = useState(false);
  const [newDependent, setNewDependent] = useState({
    name: '',
    relationship: 'child' as DependentRelationship,
    date_of_birth: '',
    notes: '',
  });
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    emergency_contact: '',
    emergency_phone: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        date_of_birth: profile.date_of_birth || '',
        emergency_contact: profile.emergency_contact || '',
        emergency_phone: profile.emergency_phone || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchDependents();
    }
  }, [user]);

  const fetchDependents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('dependents')
      .select('*')
      .eq('member_id', user.id)
      .order('created_at', { ascending: true });
    if (data) {
      setDependents(data);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependent = async () => {
    if (!user || !newDependent.name) return;

    try {
      const { error } = await supabase
        .from('dependents')
        .insert({
          member_id: user.id,
          name: newDependent.name,
          relationship: newDependent.relationship,
          date_of_birth: newDependent.date_of_birth || null,
          notes: newDependent.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Family member added",
        description: `${newDependent.name} has been added to your family.`,
      });

      setNewDependent({ name: '', relationship: 'child', date_of_birth: '', notes: '' });
      setShowAddDependent(false);
      fetchDependents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add family member.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDependent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dependents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Family member removed",
        description: "The family member has been removed.",
      });
      fetchDependents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove family member.",
        variant: "destructive",
      });
    }
  };

  const getRelationshipLabel = (rel: string) => {
    const labels: Record<string, string> = {
      spouse: 'Spouse',
      child: 'Child',
      parent: 'Parent',
      sibling: 'Sibling',
      other: 'Other',
    };
    return labels[rel] || rel;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div 
          className="max-w-3xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <User className="w-5 h-5 text-primary" />
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Account Settings
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage your personal information and preferences
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            {/* Profile Header */}
            <div className="relative p-8 border-b border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
              <div className="relative flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-4 ring-background shadow-xl overflow-hidden">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-primary" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center ring-4 ring-background">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    {profile?.full_name || 'Your Name'}
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {profile?.email}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold ring-1 ring-blue-500/20 capitalize">
                      <Sparkles className="w-3.5 h-3.5" />
                      {profile?.membership_type?.replace('_', ' ') || 'Member'}
                    </span>
                    <span className={`
                      inline-flex px-3 py-1.5 rounded-full text-sm font-semibold capitalize
                      ${profile?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-muted text-muted-foreground'}
                    `}>
                      {profile?.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+256 XXX XXX XXX"
                      className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Your address"
                      className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-6 pt-6 border-t border-border/50">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-amber-400" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact" className="text-sm font-medium">Contact Name</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Emergency contact name"
                      className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone" className="text-sm font-medium">Contact Phone</Label>
                    <Input
                      id="emergency_phone"
                      type="tel"
                      value={formData.emergency_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                      placeholder="+256 XXX XXX XXX"
                      className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  About You
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself and your tennis experience..."
                    rows={4}
                    className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 rounded-xl px-8"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Family Members Section */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Family Members
              </h3>
              <Button 
                onClick={() => setShowAddDependent(true)}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 rounded-xl"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Add family members who are allowed to play under your membership. Admin can see these for verification.
            </p>

            {dependents.length > 0 ? (
              <div className="space-y-3">
                {dependents.map((dep) => (
                  <div 
                    key={dep.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{dep.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">{getRelationshipLabel(dep.relationship)}</span>
                          {dep.date_of_birth && (
                            <span>• Born {format(new Date(dep.date_of_birth), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDependent(dep.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No family members added yet.</p>
                <Button 
                  variant="link" 
                  onClick={() => setShowAddDependent(true)}
                  className="text-primary mt-2"
                >
                  Add your first family member
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Add Dependent Dialog */}
        <Dialog open={showAddDependent} onOpenChange={setShowAddDependent}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
              <DialogDescription>
                Add a family member who is allowed to play under your membership.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dep_name">Name *</Label>
                <Input
                  id="dep_name"
                  value={newDependent.name}
                  onChange={(e) => setNewDependent({ ...newDependent, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep_relationship">Relationship *</Label>
                <Select 
                  value={newDependent.relationship} 
                  onValueChange={(v) => setNewDependent({ ...newDependent, relationship: v as DependentRelationship })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep_dob">Date of Birth</Label>
                <Input
                  id="dep_dob"
                  type="date"
                  value={newDependent.date_of_birth}
                  onChange={(e) => setNewDependent({ ...newDependent, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep_notes">Notes</Label>
                <Textarea
                  id="dep_notes"
                  value={newDependent.notes}
                  onChange={(e) => setNewDependent({ ...newDependent, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDependent(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDependent} disabled={!newDependent.name}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}