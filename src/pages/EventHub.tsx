import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Calendar, Users, MapPin, Clock, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  price: number;
  max_participants: number;
  image_url: string;
  created_by: string;
  profiles?: {
    name: string;
  } | null;
}

const EventHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationCounts, setRegistrationCounts] = useState<{ [key: string]: number }>({});

  const [stats, setStats] = useState([
    { label: "Total Events", value: "0", icon: Calendar },
    { label: "Active Participants", value: "0", icon: Users },
    { label: "Free Events", value: "0", icon: Tag },
    { label: "Categories", value: "0", icon: Filter }
  ]);

  const filters = [
    { id: "all", label: "All Events" },
    { id: "free", label: "Free" },
    { id: "paid", label: "Paid" },
    { id: "workshop", label: "Workshop" },
    { id: "tech-talk", label: "Tech Talk" }
  ];

  useEffect(() => {
    fetchEvents();
  }, [selectedFilter, searchQuery]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          profiles(name)
        `)
        .order('event_date', { ascending: true });

      // Apply filters
      if (selectedFilter === "free") {
        query = query.eq('price', 0);
      } else if (selectedFilter === "paid") {
        query = query.gt('price', 0);
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data: eventsData, error } = await query;

      if (error) {
        throw error;
      }

      setEvents((eventsData || []) as unknown as Event[]);

      // Fetch registration counts for each event
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(event => event.id);
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('event_id')
          .in('event_id', eventIds);

        const counts: { [key: string]: number } = {};
        registrations?.forEach(reg => {
          counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
        });
        setRegistrationCounts(counts);

        // Update stats
        const totalEvents = eventsData.length;
        const totalParticipants = Object.values(counts).reduce((sum, count) => sum + count, 0);
        const freeEvents = eventsData.filter(event => event.price === 0).length;
        const categories = new Set(eventsData.map(event => 'Workshop')).size; // Simplified for now

        setStats([
          { label: "Total Events", value: totalEvents.toString(), icon: Calendar },
          { label: "Active Participants", value: totalParticipants.toString(), icon: Users },
          { label: "Free Events", value: freeEvents.toString(), icon: Tag },
          { label: "Categories", value: categories.toString(), icon: Filter }
        ]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    }).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const registrationCount = registrationCounts[event.id] || 0;
    
    if (eventDate < now) {
      return { status: "Event Ended", color: "bg-muted/20 text-muted-foreground border-muted/30" };
    }
    
    if (event.max_participants && registrationCount >= event.max_participants) {
      return { status: "Full", color: "bg-warning/20 text-warning border-warning/30" };
    }
    
    if (event.max_participants && registrationCount > event.max_participants * 0.8) {
      return { status: "Few Spots Left", color: "bg-warning/20 text-warning border-warning/30" };
    }
    
    return { status: "Open", color: "bg-success/20 text-success border-success/30" };
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Workshop": "bg-primary/20 text-primary",
      "Tech Talk": "bg-success/20 text-success",
      "Hackathon": "bg-warning/20 text-warning",
      "Bootcamp": "bg-danger/20 text-danger"
    };
    return colors[category] || "bg-muted/20 text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      "Open": "bg-success/20 text-success border-success/30",
      "Few Spots Left": "bg-warning/20 text-warning border-warning/30",
      "Event Ended": "bg-muted/20 text-muted-foreground border-muted/30"
    };
    return colors[status] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  return (
    <div className="min-h-screen pt-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-glow mb-2">Optimus Events Hub</h1>
            <p className="text-muted-foreground text-lg">
              Discover, participate, and organize cutting-edge technical events. 
              Join the premier university tech club community.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="card-modern fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="flex flex-wrap gap-2 flex-1 lg:flex-initial">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.id)}
                    className={selectedFilter === filter.id ? "btn-hero" : "btn-outline-hero"}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-background/50 border-border/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="card-modern overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {events.map((event, index) => {
              const { status, color } = getEventStatus(event);
              const registrationCount = registrationCounts[event.id] || 0;
              
              return (
              <Card 
                key={event.id} 
                className="event-card fade-up overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Calendar className="h-16 w-16 text-primary/60" />
                    )}
                  </div>
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="text-sm font-bold text-primary">{formatDate(event.event_date)}</div>
                  </div>
                  
                  {/* Price Badge */}
                  {event.price > 0 && (
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="text-sm font-bold text-primary-foreground">₹{event.price}</div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-primary/20 text-primary">
                      Workshop
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold line-clamp-2">{event.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{registrationCount}{event.max_participants ? `/${event.max_participants}` : ''}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      by {event.profiles?.name || 'Optimus Team'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="btn-hero flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}`);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${color}`}
                      disabled={status === "Event Ended"}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {status}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
        
        {!loading && events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {selectedFilter === "all" ? "No events available at the moment." : `No ${selectedFilter} events found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHub;