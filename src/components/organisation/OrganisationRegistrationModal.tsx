import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";

interface OrganisationRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (organisation: any) => void;
}

const OrganisationRegistrationModal: React.FC<OrganisationRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check organisation name availability
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
      setNameAvailable(true); // fallback
    } finally {
      setCheckingName(false);
    }
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));

    const timeoutId = setTimeout(() => {
      checkNameAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle avatar selection
  const handleAvatarChange = (file: File | null) => {
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarUrl(null);
    }
  };

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (file: File) => {
    if (!file) throw new Error("No file provided");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `organization_avatars/${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('organisation')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('organisation')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register an organisation.",
        variant: "destructive",
      });
      return;
    }

    if (nameAvailable === false) {
      toast({
        title: "Name unavailable",
        description: "This organisation name is already taken.",
        variant: "destructive",
      });
      return;
    }

    if (!avatarFile) {
      toast({
        title: "Avatar required",
        description: "Please upload an organisation photo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user already has an organisation
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (existingOrg) {
        toast({
          title: "Organisation already registered",
          description: "You can only register one organisation per account.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Upload avatar
      let avatarPublicUrl = '';
      try {
        avatarPublicUrl = await uploadAvatar(avatarFile);
      } catch (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        toast({
          title: "Avatar upload failed",
          description: "Failed to upload organisation photo. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert organisation
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          owner_id: user.id,
          avatar_url: avatarPublicUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      toast({
        title: "Organisation registered!",
        description: "Your organisation has been submitted for approval.",
      });

      onSuccess(data);
      onClose();

      // Reset form
      setFormData({ name: "", description: "" });
      setAvatarFile(null);
      setAvatarUrl(null);
      setNameAvailable(null);

    } catch (error) {
      console.error('Error registering organisation:', error);
      toast({
        title: "Registration failed",
        description: "Failed to register organisation. Please check console.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Register Organisation
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to register an organisation before creating events. 
            Your organisation will be reviewed by our admin team.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Organisation Name */}
          <div className="space-y-2">
            <Label htmlFor="org-name">Organisation Name *</Label>
            <Input
              id="org-name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter organisation name"
              required
            />
            {checkingName && (
              <p className="text-sm text-muted-foreground">Checking availability...</p>
            )}
            {nameAvailable === true && formData.name && (
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              value={formData.description}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of your organisation (optional)"
              rows={3}
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label htmlFor="org-avatar">Organisation Photo *</Label>
            <Input
              id="org-avatar"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleAvatarChange(e.target.files ? e.target.files[0] : null)
              }
              required
            />
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Preview"
                className="h-24 w-24 object-cover rounded-md mt-2"
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || nameAvailable === false || !formData.name.trim()}
            >
              {isSubmitting ? "Registering..." : "Register Organisation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganisationRegistrationModal;
