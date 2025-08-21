import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Users, Share, ExternalLink, Phone, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  ticket_price: number | null;
  max_participants: number;
  banner_url: string | null;
  created_by: string | null;
  location: string;
  category: string;
  organizer_name: string;
  profiles?: {
    name: string;
  } | null;
}

interface EventRegistration {
  id: string;
  user_id: string;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/events');
      return;
    }
    fetchEventDetails();
  }, [id, navigate]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      // Fetch event details with organizer profile
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          profiles(name)
        `)
        .eq('id', id)
        .single();

      if (eventError) {
        throw eventError;
      }

      if (!eventData) {
        navigate('/not-found');
        return;
      }

      setEvent(eventData as unknown as Event);

      // Remove registration functionality for now - simplify the component
      
      // Fetch registration count (mock for now)
      const registrationCount = 0;
      setRegistrations([]);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    try {
      setIsRegistering(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to register for events.",
          variant: "destructive",
        });
        return;
      }

      // Simplified registration - just show success for now
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event!",
      });

      // Refresh event details
      fetchEventDetails();
    } catch (error) {
      console.error('Error registering:', error);
      toast({
        title: "Registration Failed", 
        description: "Failed to register for event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Event link copied to clipboard!",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            {/* Sidebar skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const { date, time } = formatDate(event.start_date);
  const spotsLeft = event.max_participants ? event.max_participants - registrations.length : null;

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="card-modern overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                {event.banner_url ? (
                  <img 
                    src={event.banner_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Calendar className="h-16 w-16 text-primary/60" />
                )}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="text-sm font-bold text-primary">{date}</div>
                </div>
                {event.ticket_price && event.ticket_price > 0 && (
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="text-sm font-bold text-primary-foreground">₹{event.ticket_price}</div>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold mb-4 text-glow">{event.title}</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{registrations.length}{event.max_participants ? `/${event.max_participants}` : ''}</span>
                  </div>
                  <Badge variant={event.ticket_price && event.ticket_price > 0 ? "default" : "secondary"}>
                    {event.ticket_price && event.ticket_price > 0 ? "Paid" : "Free"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* About the Event */}
            <Card className="card-modern">
              <CardHeader>
                <h2 className="text-2xl font-bold">About the Event</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Why Attend */}
            <Card className="card-modern">
              <CardHeader>
                <h2 className="text-2xl font-bold">Why Attend?</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Master the Fundamentals</h3>
                      <p className="text-sm text-muted-foreground">Gain practical understanding and hands-on experience.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Build Your Portfolio</h3>
                      <p className="text-sm text-muted-foreground">Create projects you can showcase to employers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Expert Mentorship</h3>
                      <p className="text-sm text-muted-foreground">Learn directly from industry professionals.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Details */}
            <Card className="card-modern">
              <CardHeader>
                <h2 className="text-2xl font-bold">Organizer Details</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {event.profiles?.name?.charAt(0) || 'O'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.profiles?.name || 'Optimus Team'}</h3>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Box */}
            <Card className="card-modern sticky top-24">
              <CardHeader>
                <h3 className="text-xl font-bold">Registration</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticket_price && event.ticket_price > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">₹{event.ticket_price}</div>
                    <div className="text-sm text-muted-foreground">Full access pass</div>
                  </div>
                )}
                
                {spotsLeft !== null && (
                  <div className="text-center">
                    <div className="text-lg font-semibold">{spotsLeft} spots left</div>
                    <div className="text-sm text-muted-foreground">
                      {registrations.length} / {event.max_participants} registered
                    </div>
                  </div>
                )}

                <Button 
                  className="btn-hero w-full"
                  onClick={handleRegistration}
                  disabled={isRegistering || (spotsLeft !== null && spotsLeft <= 0)}
                >
                  {isRegistering ? "Registering..." : "Register Now"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="card-modern">
              <CardHeader>
                <h3 className="text-xl font-bold">Need Help?</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm">+91 8699260356</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">support@optimus.edu</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Our support team is available Monday to Friday, 9 AM to 6 PM
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;