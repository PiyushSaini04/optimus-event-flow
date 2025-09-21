import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserPlus, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface OrganizationMember {
  id: string;
  user_id: string;
  role: 'main_organiser' | 'organiser' | 'pending';
  joined_at: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
}

interface OrganizationProfileCardProps {
  organization: {
    id: string;
    name: string;
    description?: string;
    avatar_url?: string;
    owner_id: string;
    status: string;
  };
}

const OrganizationProfileCard: React.FC<OrganizationProfileCardProps> = ({ organization }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [organization.id]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_organization_members', { org_id: organization.id });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const generateInviteLink = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('generate_org_invite_token', { org_id: organization.id });

      if (error) throw error;

      const link = `${window.location.origin}/register-organization?invite=${data}`;
      setInviteLink(link);
      setShowInviteModal(true);
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast({
        title: "Error",
        description: "Failed to generate invite link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const approveMember = async (memberUserId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('approve_member', {
          org_id: organization.id,
          member_user_id: memberUserId,
          approver_user_id: user?.id
        });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Member approved successfully.",
        });
        fetchMembers();
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error approving member:', error);
      toast({
        title: "Error",
        description: "Failed to approve member.",
        variant: "destructive",
      });
    }
  };

  const mainOrganizer = members.find(m => m.role === 'main_organiser');
  const organizers = members.filter(m => m.role === 'organiser');
  const pendingMembers = members.filter(m => m.role === 'pending');
  const isMainOrganizer = organization.owner_id === user?.id;

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={organization.avatar_url} alt={organization.name} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{organization.name}</h3>
              {organization.description && (
                <p className="text-muted-foreground">{organization.description}</p>
              )}
              <Badge variant={organization.status === 'approved' ? 'default' : 'secondary'}>
                {organization.status}
              </Badge>
            </div>
          </div>

          {/* Main Organizer */}
          {mainOrganizer && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Main Organizer</h4>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mainOrganizer.user_avatar} />
                  <AvatarFallback>
                    {mainOrganizer.user_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{mainOrganizer.user_name}</p>
                  <p className="text-sm text-muted-foreground">{mainOrganizer.user_email}</p>
                </div>
                <Badge className="ml-auto">Main</Badge>
              </div>
            </div>
          )}

          {/* Organizers */}
          {organizers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Organizers ({organizers.length})</h4>
              <div className="space-y-2">
                {organizers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user_avatar} />
                      <AvatarFallback>
                        {member.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user_name}</p>
                      <p className="text-sm text-muted-foreground">{member.user_email}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">Organizer</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Members */}
          {pendingMembers.length > 0 && isMainOrganizer && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Pending Approval ({pendingMembers.length})</h4>
              <div className="space-y-2">
                {pendingMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user_avatar} />
                      <AvatarFallback>
                        {member.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.user_name}</p>
                      <p className="text-sm text-muted-foreground">{member.user_email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => approveMember(member.user_id)}
                    >
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Organizer Button */}
          {isMainOrganizer && (
            <Button
              onClick={generateInviteLink}
              disabled={loading}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Add More Organizer"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Organizer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this link with someone to invite them as an organizer for {organization.name}.
            </p>
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  onClick={copyInviteLink}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• The invited person will need to create an account if they don't have one</p>
              <p>• They will be added as a pending organizer until you approve them</p>
              <p>• Only approved organizers can create events and posts</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganizationProfileCard;