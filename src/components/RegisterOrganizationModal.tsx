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
import { useToast } from "@/hooks/use-toast";

interface RegisterOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterOrganization: (
    organizationData: {
      name: string;
      description: string;
      website: string;
      contact_email: string;
      phone_number: string;
    }
  ) => void;
}

const RegisterOrganizationModal: React.FC<RegisterOrganizationModalProps> = ({
  isOpen,
  onClose,
  onRegisterOrganization,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onRegisterOrganization({
        name,
        description,
        website,
        contact_email: contactEmail,
        phone_number: phoneNumber,
      });
      toast({
        title: "Registration Successful",
        description: "Your organization has been registered.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error registering your organization.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Register Your Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="org-name" className="text-right">
              Organization Name
            </Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="org-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="org-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="org-website" className="text-right">
              Website
            </Label>
            <Input
              id="org-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="url"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="org-email" className="text-right">
              Contact Email
            </Label>
            <Input
              id="org-email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              type="email"
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="org-phone" className="text-right">
              Phone Number
            </Label>
            <Input
              id="org-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterOrganizationModal;
