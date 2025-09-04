import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share,
  Phone,
  Mail,
  Check,
  Info,
  User,
  Tag,
  Activity,
  ExternalLink,
  Building,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  registration_link: string | null;
  max_participants: number | null;
  ticket_price: number | null;
  banner_url: string | null;
  created_by: string | null;
  created_at: string;
  organization_id: string | null;
  status: string;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      const { data: eventData, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          category,
          start_date,
          end_date,
          location,
          organizer_name,
          contact_email,
          contact_phone,
          registration_link,
          max_participants,
          ticket_price,
          banner_url,
          created_by,
          created_at,
          organization_id,
          status
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!eventData) {
        navigate("/events");
        toast({
          title: "Event not found",
          description: "The event you're looking for doesn't exist.",
          variant: "destructive",
        });
        return;
      }

      // Check if event is accessible (approved or user's own event)
      if (eventData.status !== "approved") {
        toast({
          title: "Event not available",
          description: "This event is not currently available for public viewing.",
          variant: "destructive",
        });
        navigate("/events");
        return;
      }

      console.log("Fetched event details:", eventData);
      setEvent(eventData as Event);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      });
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Event link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Share failed",
        description: "Unable to share the event link.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch {
      return { date: "Invalid Date", time: "Invalid Time" };
    }
  };

  const getEventStatus = () => {
    if (!event) return { status: "Unknown", color: "gray" };
    
    const now = new Date();
    const eventDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (event.status !== "approved") {
      return { status: "Not Approved", color: "yellow" };
    }
    
    if (now > endDate) {
      return { status: "Event Ended", color: "gray" };
    } else if (now >= eventDate && now <= endDate) {
      return { status: "Live Now", color: "red" };
    } else {
      return { status: "Upcoming", color: "green" };
    }
  };

  const getDuration = () => {
    if (!event) return "";
    
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffHours / 24);
    
    if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="text-white text-xl mb-4">Event not found</div>
        <Button onClick={() => navigate("/events")} variant="outline">
          Back to Events
        </Button>
      </div>
    );
  }

  const { date, time } = formatDate(event.start_date);
  const endDate = formatDate(event.end_date);
  const eventStatus = getEventStatus();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-r from-red-600 to-red-700 overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-6"
            onClick={() => navigate("/events")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm">
                  {date}
                </div>
                <Badge 
                  className={`${eventStatus.color === 'green' ? 'bg-green-500/20 text-green-200' : 
                    eventStatus.color === 'red' ? 'bg-red-500/20 text-red-200' :
                    eventStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-200' :
                    'bg-gray-500/20 text-gray-200'} border-0`}
                >
                  {eventStatus.status}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {event.title}
              </h1>
              
              <div className="space-y-3 text-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>Organized by {event.organizer_name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>{time} - {endDate.time} ({getDuration()})</span>
                </div>
              </div>
            </div>
            
            {/* Registration Card */}
            <Card className="bg-white text-gray-900 w-full lg:w-80">
              <CardHeader className="text-center">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Registration</h3>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {eventStatus.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    {event.ticket_price && event.ticket_price > 0 ? "Ticket Price" : "Entry"}
                  </div>
                  <div className="text-3xl font-bold text-purple-600">
                    {event.ticket_price && event.ticket_price > 0 
                      ? `₹${event.ticket_price}` 
                      : "FREE"
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.max_participants 
                      ? `Limited to ${event.max_participants} participants` 
                      : "Full access pass"
                    }
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                  onClick={() => setShowRegistrationModal(true)}
                  disabled={eventStatus.status === "Event Ended"}
                >
                  Register for Event
                </Button>
                
                {event.registration_link && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(event.registration_link!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    External Registration
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Event Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-purple-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">Event Details</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-400">Venue</div>
                      <div className="text-white font-medium">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-400">Category</div>
                      <div className="text-white font-medium capitalize">{event.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-400">Organized by</div>
                      <div className="text-white font-medium">{event.organizer_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-400">Event Type</div>
                      <div className="text-white font-medium">
                        {event.ticket_price && event.ticket_price > 0 ? "PAID" : "FREE"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="text-white font-medium">{getDuration()}</div>
                    </div>
                  </div>
                  {event.max_participants && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-purple-400 mr-3 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-400">Max Participants</div>
                        <div className="text-white font-medium">{event.max_participants}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Event Timeline */}
                <div className="border-t border-gray-600 pt-4">
                  <div className="text-white font-medium mb-3">Event Timeline</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Start Date</span>
                      <span className="text-white">{date} at {time}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">End Date</span>
                      <span className="text-white">{endDate.date} at {endDate.time}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About the Event */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-purple-500">
                <h2 className="text-xl font-bold text-white">About the Event</h2>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event Benefits */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-green-500">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">Why Attend?</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-500 rounded p-1 mr-3 mt-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Expert Knowledge</div>
                    <div className="text-gray-400 text-sm">
                      Learn from industry experts and gain valuable insights in {event.category}.
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-500 rounded p-1 mr-3 mt-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Networking Opportunities</div>
                    <div className="text-gray-400 text-sm">
                      Connect with like-minded professionals and expand your network.
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-500 rounded p-1 mr-3 mt-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Hands-on Experience</div>
                    <div className="text-gray-400 text-sm">
                      Participate in practical sessions and apply what you learn.
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-500 rounded p-1 mr-3 mt-1 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {event.ticket_price && event.ticket_price > 0 ? "Great Value" : "Free Access"}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {event.ticket_price && event.ticket_price > 0 
                        ? `Premium content and experience for just ₹${event.ticket_price}.`
                        : "Access this valuable event completely free of charge."
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-blue-500">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">Important Information</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {event.max_participants && (
                  <div className="flex items-start">
                    <Users className="h-4 w-4 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">Limited Seats</div>
                      <div className="text-gray-400 text-sm">
                        This event is limited to {event.max_participants} participants. 
                        Register early to secure your spot.
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium">Event Schedule</div>
                    <div className="text-gray-400 text-sm">
                      Please arrive 15 minutes before the start time. The event will run for {getDuration()}.
                    </div>
                  </div>
                </div>

                {event.registration_link && (
                  <div className="flex items-start">
                    <ExternalLink className="h-4 w-4 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">Registration Required</div>
                      <div className="text-gray-400 text-sm">
                        Advance registration is required to attend this event. Please use the registration link provided.
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-600 pt-4">
                  <div className="text-white font-medium mb-2">Terms and Conditions</div>
                  <ul className="text-gray-400 text-sm space-y-1">
                    {event.ticket_price && event.ticket_price > 0 && (
                      <li>• Registration fees are non-refundable</li>
                    )}
                    <li>• Please bring a valid ID for verification</li>
                    <li>• Follow all venue guidelines and safety protocols</li>
                    <li>• Event schedule may be subject to change</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Organizer Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-orange-500">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-orange-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">Organizer Details</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">
                      {event.organizer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{event.organizer_name}</h3>
                    <p className="text-gray-400">Event Organizer</p>
                  </div>
                </div>
                
                {event.organization_id && (
                  <div className="text-sm text-gray-400 mb-2">
                    Organization ID: {event.organization_id}
                  </div>
                )}
                
                <div className="text-sm text-gray-400">
                  Event created on {new Date(event.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="border-b border-purple-500">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-purple-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">Need Help?</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {event.contact_phone && (
                    <div className="bg-purple-900/30 rounded-lg p-4 text-center">
                      <Phone className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Phone Support</div>
                      <div className="text-white font-bold">
                        <a href={`tel:${event.contact_phone}`} className="hover:text-purple-300">
                          {event.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {event.contact_email && (
                    <div className="bg-purple-900/30 rounded-lg p-4 text-center">
                      <Mail className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Email Support</div>
                      <div className="text-white font-bold text-sm">
                        <a href={`mailto:${event.contact_email}`} className="hover:text-purple-300">
                          {event.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {!event.contact_phone && !event.contact_email && (
                    <div className="text-center text-gray-400 py-4">
                      <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Contact information will be provided after registration.</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-gray-400 text-sm">
                  For general inquiries, please contact the event organizer
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-bold text-white">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.registration_link && eventStatus.status !== "Event Ended" && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    onClick={() => window.open(event.registration_link!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Registration
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700" 
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share This Event
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700" 
                  onClick={() => navigate("/events")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {event && (
        <EventRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          eventId={event.id}
          eventTitle={event.title}
        />
      )}
    </div>
  );
};

export default EventDetail;