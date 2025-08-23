import { useState } from "react";
import { motion } from "framer-motion";
<<<<<<< HEAD
import { Calendar, MapPin, Users, DollarSign, Upload, ArrowLeft, Save } from "lucide-react";
=======
import { Calendar, MapPin, DollarSign, Upload, ArrowLeft, Save } from "lucide-react";
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
<<<<<<< HEAD
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    location: '',
    organizerName: 'Optimus Tech Club',
    contactEmail: '',
    contactPhone: '',
    registrationLink: '',
    ticketPrice: '',
    maxParticipants: '',
    banner: null as File | null
  });

  const categories = [
    'Workshop',
    'Seminar', 
    'Hackathon',
    'Tech Talk',
    'Competition',
    'Bootcamp',
    'Conference',
    'Networking'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
=======
    title: "",
    description: "",
    category: "",
    start_date: "",
    end_date: "",
    location: "",
    organizer_name: "Optimus Tech Club",
    contact_email: "",
    contact_phone: "",
    registration_link: "",
    ticket_price: "",
    max_participants: "",
    banner: null as File | null,
  });

  const categories = [
    "Workshop",
    "Seminar",
    "Hackathon",
    "Tech Talk",
    "Competition",
    "Bootcamp",
    "Conference",
    "Networking",
    "Cultural",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
<<<<<<< HEAD
      setFormData(prev => ({ ...prev, banner: file }));
=======
      setFormData((prev) => ({ ...prev, banner: file }));
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
<<<<<<< HEAD
      
=======

>>>>>>> 0db5559 (Updated homepage with new sections and animations)
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create events.",
          variant: "destructive",
        });
<<<<<<< HEAD
        navigate('/auth');
=======
        navigate("/auth");
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
        return;
      }

      // Upload banner if provided
<<<<<<< HEAD
      let bannerUrl = null;
      if (formData.banner) {
        const fileExt = formData.banner.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-banners')
          .upload(fileName, formData.banner);

        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-banners')
          .getPublicUrl(fileName);
          
        bannerUrl = publicUrl;
      }

      // Create event in database
      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          start_date: formData.startDate,
          end_date: formData.endDate || formData.startDate,
          location: formData.location,
          organizer_name: formData.organizerName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          registration_link: formData.registrationLink,
          ticket_price: parseFloat(formData.ticketPrice) || 0,
          max_participants: parseInt(formData.maxParticipants),
          banner_url: bannerUrl,
          created_by: user.id
        });

      if (error) {
        throw error;
      }
      
=======
      let banner_url = null;
      if (formData.banner) {
        const fileExt = formData.banner.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `event-banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-banners")
          .upload(filePath, formData.banner);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("event-banners")
          .getPublicUrl(filePath);

        banner_url = data.publicUrl;
      }

      // Insert event into database
      const { error } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        location: formData.location,
        organizer_name: formData.organizer_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        registration_link: formData.registration_link,
        ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        banner_url,
        created_by: user.id,
      });

      if (error) throw error;

>>>>>>> 0db5559 (Updated homepage with new sections and animations)
      toast({
        title: "Event Created Successfully!",
        description: "Your event has been created and is now live.",
      });

<<<<<<< HEAD
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
=======
      navigate("/events"); // redirect to events page
    } catch (error) {
      console.error("Error creating event:", error);
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
<<<<<<< HEAD
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
=======
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
<<<<<<< HEAD
      transition: { duration: 0.5 }
    }
=======
      transition: { duration: 0.5 },
    },
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
  };

  return (
    <div className="min-h-screen pt-6 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="outline"
            size="icon"
<<<<<<< HEAD
            onClick={() => navigate('/events')}
=======
            onClick={() => navigate("/events")}
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
            className="btn-outline-hero"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-glow">Create New Event</h1>
            <p className="text-muted-foreground">Fill in the details to create your event</p>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
<<<<<<< HEAD
          {/* Event Banner */}
=======
          {/* Banner Upload */}
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
<<<<<<< HEAD
                  <Upload className="h-5 w-5 text-primary" />
                  Event Banner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  {bannerPreview ? (
                    <div className="relative">
                      <img 
                        src={bannerPreview} 
                        alt="Banner preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
=======
                  <Upload className="h-5 w-5 text-primary" /> Event Banner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors relative">
                  {bannerPreview ? (
                    <div className="relative">
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-48 object-cover rounded-lg" />
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setBannerPreview(null);
<<<<<<< HEAD
                          setFormData(prev => ({ ...prev, banner: null }));
=======
                          setFormData((prev) => ({ ...prev, banner: null }));
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Upload event banner</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

<<<<<<< HEAD
          {/* Basic Information */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                    required
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your event..."
                    rows={4}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
=======
          {/* Title, Description, Category */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

<<<<<<< HEAD
          {/* Date & Time */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
=======
          {/* Dates */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Date & Time</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="datetime-local" value={formData.start_date} onChange={(e) => handleInputChange("start_date", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="datetime-local" value={formData.end_date} onChange={(e) => handleInputChange("end_date", e.target.value)} required />
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location & Contact */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
<<<<<<< HEAD
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Main Auditorium or Online"
                    required
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="contact@example.com"
                      required
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
=======
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Location & Contact</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={formData.contact_email} onChange={(e) => handleInputChange("contact_email", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" value={formData.contact_phone} onChange={(e) => handleInputChange("contact_phone", e.target.value)} />
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Registration & Pricing */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
<<<<<<< HEAD
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Registration & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="registrationLink">Registration Link</Label>
                  <Input
                    id="registrationLink"
                    type="url"
                    value={formData.registrationLink}
                    onChange={(e) => handleInputChange('registrationLink', e.target.value)}
                    placeholder="https://registration-link.com"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket Price (₹)</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange('ticketPrice', e.target.value)}
                      placeholder="0 for free events"
                      min="0"
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                      placeholder="e.g., 100"
                      required
                      min="1"
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
=======
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Registration & Pricing</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Registration Link</Label>
                  <Input type="url" value={formData.registration_link} onChange={(e) => handleInputChange("registration_link", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ticket Price (₹)</Label>
                  <Input type="number" value={formData.ticket_price} onChange={(e) => handleInputChange("ticket_price", e.target.value)} min="0" />
                </div>
                <div className="space-y-2">
                  <Label>Max Participants *</Label>
                  <Input type="number" value={formData.max_participants} onChange={(e) => handleInputChange("max_participants", e.target.value)} min="1" required />
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
                </div>
              </CardContent>
            </Card>
          </motion.div>

<<<<<<< HEAD
          {/* Submit Button */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/events')}
              className="btn-outline-hero"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-hero min-w-32"
            >
=======
          {/* Submit */}
          <motion.div variants={itemVariants} className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/events")}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
<<<<<<< HEAD
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Create Event
                </div>
=======
                <>
                  <Save className="h-4 w-4" /> Create Event
                </>
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default CreateEvent;
=======
export default CreateEvent;
>>>>>>> 0db5559 (Updated homepage with new sections and animations)
