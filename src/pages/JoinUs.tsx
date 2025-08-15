import { useState } from "react";
import { User, Phone, Mail, Calendar, MapPin, GraduationCap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const JoinUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    whatsapp: "",
    email: "",
    phone: "",
    branch: "",
    dob: "",
    gender: "",
    residence: "",
    courseYear: "",
    domains: [] as string[],
    lpuParticipation: "",
    motivation: ""
  });

  const domains = [
    "Web Development",
    "Mobile App Development", 
    "Data Science & Analytics",
    "Artificial Intelligence",
    "Machine Learning",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Blockchain",
    "IoT",
    "Game Development",
    "UI/UX Design"
  ];

  const branches = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDomainChange = (domain: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      domains: checked 
        ? [...prev.domains, domain]
        : prev.domains.filter(d => d !== domain)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest in joining Optimus. We'll review your application and get back to you soon.",
    });
    
    // Reset form
    setFormData({
      name: "",
      regNo: "",
      whatsapp: "",
      email: "",
      phone: "",
      branch: "",
      dob: "",
      gender: "",
      residence: "",
      courseYear: "",
      domains: [],
      lpuParticipation: "",
      motivation: ""
    });
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-glow mb-6">
            Join <span className="text-primary">Optimus</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to be part of something extraordinary? Join our community of passionate 
            tech enthusiasts and start your journey toward innovation and excellence.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: GraduationCap,
              title: "Skill Development",
              description: "Access to cutting-edge workshops and hands-on learning experiences"
            },
            {
              icon: User,
              title: "Networking",
              description: "Connect with like-minded peers and industry professionals"
            },
            {
              icon: Heart,
              title: "Innovation",
              description: "Work on real projects and contribute to meaningful solutions"
            }
          ].map((benefit, index) => (
            <Card 
              key={benefit.title} 
              className="card-modern text-center fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Application Form */}
        <Card className="card-modern fade-up">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Membership Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regNo">Registration Number *</Label>
                    <Input
                      id="regNo"
                      placeholder="Enter registration number"
                      className="bg-muted/20 border-border/50 focus:border-primary"
                      value={formData.regNo}
                      onChange={(e) => handleInputChange("regNo", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="Enter WhatsApp number"
                      className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dob"
                        type="date"
                        className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                        value={formData.dob}
                        onChange={(e) => handleInputChange("dob", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <RadioGroup 
                      value={formData.gender} 
                      onValueChange={(value) => handleInputChange("gender", value)}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="residence">Residence *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="residence"
                        placeholder="City, State"
                        className="pl-10 bg-muted/20 border-border/50 focus:border-primary"
                        value={formData.residence}
                        onChange={(e) => handleInputChange("residence", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Academic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch/Department *</Label>
                    <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value)}>
                      <SelectTrigger className="bg-muted/20 border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select your branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="courseYear">Course Year *</Label>
                    <Select value={formData.courseYear} onValueChange={(value) => handleInputChange("courseYear", value)}>
                      <SelectTrigger className="bg-muted/20 border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Year</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
                        <SelectItem value="masters">Masters</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Areas of Interest</h3>
                <p className="text-sm text-muted-foreground">Select all domains that interest you (minimum 3):</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {domains.map((domain) => (
                    <div key={domain} className="flex items-center space-x-2">
                      <Checkbox
                        id={domain}
                        checked={formData.domains.includes(domain)}
                        onCheckedChange={(checked) => handleDomainChange(domain, checked as boolean)}
                      />
                      <Label htmlFor={domain} className="text-sm font-normal">{domain}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Experience & Motivation</h3>
                
                <div className="space-y-2">
                  <Label>Have you participated in LPU technical events before? *</Label>
                  <RadioGroup 
                    value={formData.lpuParticipation} 
                    onValueChange={(value) => handleInputChange("lpuParticipation", value)}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="lpu-yes" />
                      <Label htmlFor="lpu-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="lpu-no" />
                      <Label htmlFor="lpu-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to join Optimus? *</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Tell us about your motivation, goals, and what you hope to achieve..."
                    className="min-h-[120px] bg-muted/20 border-border/50 focus:border-primary resize-none"
                    value={formData.motivation}
                    onChange={(e) => handleInputChange("motivation", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="text-center pt-6">
                <Button 
                  type="submit" 
                  className="btn-hero text-lg px-12 py-3"
                  disabled={formData.domains.length < 3}
                >
                  Submit Application
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  By submitting this form, you agree to our terms and conditions.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinUs;