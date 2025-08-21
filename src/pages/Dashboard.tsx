import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Users, 
  Tag, 
  Filter, 
  Plus, 
  Settings, 
  Bell,
  Edit3,
  Trash2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  location: string;
  ticket_price: number;
  max_participants: number | null;
  category: string;
  banner_url: string | null;
  created_at: string;
  created_by: string;
  contact_email: string;
  contact_phone: string | null;
  organizer_name: string;
  end_date: string | null;
  registration_link: string | null;
}

interface UserProfile {
  id: string;
  name: string;
  role: string;
  user_id: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    activeEvents: 0,
    completedEvents: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEvents((eventsData || []) as Event[]);
      
      // Calculate stats
      const now = new Date();
      const activeEvents = eventsData?.filter(event => new Date(event.start_date) > now).length || 0;
      const completedEvents = eventsData?.filter(event => new Date(event.start_date) < now).length || 0;
      
      setStats({
        totalEvents: eventsData?.length || 0,
        totalParticipants: 0, // This would need to be calculated from registrations
        activeEvents,
        completedEvents
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load your events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted.",
      });

      fetchUserEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Workshop": "bg-primary/20 text-primary",
      "Tech Talk": "bg-success/20 text-success",
      "Hackathon": "bg-warning/20 text-warning",
      "Bootcamp": "bg-danger/20 text-danger",
      "Free": "bg-success/20 text-success",
      "Paid": "bg-warning/20 text-warning"
    };
    return colors[category] || "bg-muted/20 text-muted-foreground";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold text-glow mb-2">
                Welcome back, {profile?.name || user?.user_metadata?.name || 'User'}!
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your events and track your impact on the community.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button onClick={() => navigate('/create-event')} className="btn-hero">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={profile?.name || user?.email} />
                    <AvatarFallback className="text-lg">
                      {(profile?.name || user?.user_metadata?.name || user?.email || '').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{profile?.name || user?.user_metadata?.name || 'User'}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-2">{profile?.role || 'Member'}</Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="card-modern">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stats.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </CardContent>
            </Card>
            
            <Card className="card-modern">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-success/20 rounded-full mb-3">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div className="text-2xl font-bold text-success mb-1">{stats.totalParticipants}</div>
                <div className="text-sm text-muted-foreground">Total Participants</div>
              </CardContent>
            </Card>
            
            <Card className="card-modern">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-warning/20 rounded-full mb-3">
                  <Tag className="h-6 w-6 text-warning" />
                </div>
                <div className="text-2xl font-bold text-warning mb-1">{stats.activeEvents}</div>
                <div className="text-sm text-muted-foreground">Active Events</div>
              </CardContent>
            </Card>
            
            <Card className="card-modern">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/20 rounded-full mb-3">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-muted-foreground mb-1">{stats.completedEvents}</div>
                <div className="text-sm text-muted-foreground">Completed Events</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* My Events */}
          <motion.div variants={itemVariants}>
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Events</span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/create-event')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first event to get started!
                    </p>
                    <Button onClick={() => navigate('/create-event')} className="btn-hero">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold">{event.title}</h4>
                            <Badge className={getCategoryColor(event.category || 'Workshop')}>
                              {event.category || 'Workshop'}
                            </Badge>
                            {event.ticket_price > 0 && (
                              <Badge variant="outline">₹{event.ticket_price}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(event.start_date)} • {event.location || 'Online'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/events/${event.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/create-event?edit=${event.id}`)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;