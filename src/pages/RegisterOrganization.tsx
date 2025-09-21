import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, UserPlus, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

const RegisterOrganization = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [activeTab, setActiveTab] = useState(inviteToken ? 'join' : 'create');
  const [loading, setLoading] = useState(false);

  // New Organization Form
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    description: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  // Join Organization Form
  const [joinData, setJoinData] = useState({
    inviteLink: inviteToken || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (inviteToken) {
      setJoinData({ inviteLink: inviteToken });
      setActiveTab('join');
    }
  }, [inviteToken]);

  // Check organization name availability
  const checkNameAvailability = async (name: string) => {
    if (!name.trim()) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      const { data } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', name.trim())
        .maybeSingle();
      
      setNameAvailable(!data);
    } catch (error) {
      console.error("Name check error:", error);
      setNameAvailable(true);
    } finally {
      setCheckingName(false);
    }
  };

  const handleNameChange = (value: string) => {
    setNewOrgData(prev => ({ ...prev, name: value }));
    
    const timeoutId = setTimeout(() => {
      checkNameAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('organisation')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('organisation')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || nameAvailable === false) return;

    setLoading(true);
    try {
      // Check if user already has an organization
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (existingOrg) {
        toast({
          title: "Organization already exists",
          description: "You can only register one organization per account.",
          variant: "destructive",
        });
        return;
      }

      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        if (!avatarUrl) {
          toast({
            title: "Upload failed",
            description: "Failed to upload organization photo.",
            variant: "destructive",
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgData.name.trim(),
          description: newOrgData.description.trim() || null,
          owner_id: user.id,
          avatar_url: avatarUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Organization registered!",
        description: "Your organization has been submitted for approval.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Registration failed",
        description: "Failed to register organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Extract token from invite link
      const url = new URL(joinData.inviteLink);
      const token = url.searchParams.get('invite');

      if (!token) {
        toast({
          title: "Invalid link",
          description: "The invite link is not valid.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .rpc('join_organization_by_token', {
          invite_token: token,
          joining_user_id: user.id
        });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Failed to join",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining organization:', error);
      toast({
        title: "Error",
        description: "Failed to join organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Organization Registration</h1>
          <p className="text-muted-foreground mt-2">
            Create a new organization or join an existing one
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">New Organization</TabsTrigger>
                <TabsTrigger value="join">Join Organization</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6 mt-6">
                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    Create a new organization to start hosting events and managing your community.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name *</Label>
                    <Input
                      id="org-name"
                      value={newOrgData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter organization name"
                      required
                    />
                    {checkingName && (
                      <p className="text-sm text-muted-foreground">Checking availability...</p>
                    )}
                    {nameAvailable === true && newOrgData.name && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Name is available
                      </p>
                    )}
                    {nameAvailable === false && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Name is already taken
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-description">Description</Label>
                    <Textarea
                      id="org-description"
                      value={newOrgData.description}
                      onChange={(e) => setNewOrgData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your organization (optional)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-avatar">Organization Photo</Label>
                    <Input
                      id="org-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-md mt-2"
                      />
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || nameAvailable === false || !newOrgData.name.trim()}
                    className="w-full"
                  >
                    {loading ? "Creating..." : "Create Organization"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="join" className="space-y-6 mt-6">
                <Alert>
                  <UserPlus className="h-4 w-4" />
                  <AlertDescription>
                    Use an invite link to join an existing organization as an organizer.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleJoinOrganization} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-link">Invite Link *</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="invite-link"
                        value={joinData.inviteLink}
                        onChange={(e) => setJoinData({ inviteLink: e.target.value })}
                        placeholder="Paste the invite link here"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• You'll be added as a pending organizer</p>
                    <p>• The main organizer needs to approve your request</p>
                    <p>• Once approved, you can create events and posts</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !joinData.inviteLink.trim()}
                    className="w-full"
                  >
                    {loading ? "Joining..." : "Join Organization"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganization;