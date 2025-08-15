import { useState } from "react";
import { Search, Filter, Calendar, Users, MapPin, Clock, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EventHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const stats = [
    { label: "Total Events", value: "4", icon: Calendar },
    { label: "Active Participants", value: "294", icon: Users },
    { label: "Free Events", value: "1", icon: Tag },
    { label: "Categories", value: "4", icon: Filter }
  ];

  const filters = [
    { id: "all", label: "All Events" },
    { id: "free", label: "Free" },
    { id: "paid", label: "Paid" },
    { id: "workshop", label: "Workshop" },
    { id: "tech-talk", label: "Tech Talk" }
  ];

  const events = [
    {
      id: 1,
      title: "AI/ML Workshop 2024",
      description: "Hands-on AI/ML workshop with real-world applications and Machine Learning.",
      category: "Workshop",
      date: "SEP 15",
      time: "10:00 AM",
      location: "Computer Lab 1",
      participants: 50,
      maxParticipants: 50,
      organizer: "Dr. Sarah Chen",
      price: null,
      status: "Open",
      image: "/placeholder.svg",
      tags: ["AI", "Machine Learning", "Python"]
    },
    {
      id: 2,
      title: "Tech Talk: Future of Robotics",
      description: "Expert insights into robotics and autonomous systems development.",
      category: "Tech Talk",
      date: "SEP 28",
      time: "2:00 PM",
      location: "Main Auditorium",
      participants: 120,
      maxParticipants: 200,
      organizer: "Prof. Michael Chen",
      price: null,
      status: "Open",
      image: "/placeholder.svg",
      tags: ["Robotics", "Future Tech", "Innovation"]
    },
    {
      id: 3,
      title: "Hackathon 2024: Code for Change",
      description: "48-hour hackathon focused on developing solutions for social impact.",
      category: "Hackathon",
      date: "OCT 15",
      time: "9:00 AM",
      location: "Innovation Center",
      participants: 89,
      maxParticipants: 100,
      organizer: "Optimus Tech Club",
      price: "₹500",
      status: "Event Ended",
      image: "/placeholder.svg",
      tags: ["Social Impact", "Innovation", "Teamwork"]
    },
    {
      id: 4,
      title: "Cybersecurity Bootcamp",
      description: "Intensive bootcamp covering ethical hacking, penetration testing, and security.",
      category: "Bootcamp",
      date: "NOV 5",
      time: "10:00 AM",
      location: "Security Lab",
      participants: 35,
      maxParticipants: 40,
      organizer: "CyberSec Team",
      price: "₹1500",
      status: "Few Spots Left",
      image: "/placeholder.svg",
      tags: ["Cybersecurity", "Ethical Hacking", "Security"]
    }
  ];

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
          <Button 
            onClick={() => window.location.href = '/create-event'} 
            className="btn-hero"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {events.map((event, index) => (
            <Card 
              key={event.id} 
              className="event-card fade-up overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary/60" />
                </div>
                
                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="text-sm font-bold text-primary">{event.date}</div>
                </div>
                
                {/* Price Badge */}
                {event.price && (
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="text-sm font-bold text-primary-foreground">{event.price}</div>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
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
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.participants}/{event.maxParticipants}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    by {event.organizer}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button className="btn-hero flex-1">View Details</Button>
                  <Button 
                    variant="outline" 
                    className={`flex-1 ${getStatusColor(event.status)}`}
                    disabled={event.status === "Event Ended"}
                  >
                    {event.status}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventHub;