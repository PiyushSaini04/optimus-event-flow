import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Activity, CheckCircle, FileText, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import OrganizationProfileCard from '@/components/organization/OrganizationProfileCard';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_name: string;
  max_participants: number;
  ticket_price: number;
  status: string;
  created_by: string;
}

interface Organisation {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  avatar_url?: string;
  owner_id: string;
}

const OrganisationDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalEvents: 0,
    approvedEvents: 0,
  });

  useEffect(() => {
    if (user) checkOrganisationAccess();
  }, [user]);

  const checkOrganisationAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (orgError || !orgData) {
        toast({
          title: "No Organisation Found",
          description: "You need to register an organisation first.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      if (orgData.status !== 'approved') {
        toast({
          title: "Organisation Not Approved",
          description: "Your organisation is still pending approval.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setOrganisation(orgData);
      await Promise.all([
        fetchOrganisationEvents(orgData.id),
        fetchStats(orgData.id)
      ]);
    } catch (error) {
      console.error('Error checking organisation access:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganisationEvents = async (organisationId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', organisationId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching organisation events:', error);
    }
  };

  const fetchStats = async (organisationId: string) => {
    try {
      const [eventsData] = await Promise.all([
        supabase.from('events').select('id, status').eq('organization_id', organisationId),
      ]);

      const totalEvents = eventsData.data?.length || 0;
      const approvedEvents = eventsData.data?.filter(e => e.status === 'approved').length || 0;

      setStats({ totalEvents, approvedEvents });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    };
    return colors[category] || "bg-muted/20 text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Organization Profile Card */}
          {organisation && (
            <OrganizationProfileCard organization={organisation} />
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-glow mb-2">
                Organisation Dashboard
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground">
                Manage {organisation?.name} events and posts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
              <Button onClick={() => navigate('/create-event')} className="btn-hero w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button
                onClick={() => navigate('/create-post', { state: { organisationId: organisation?.id } })}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-8">
            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6 flex justify-between items-center">
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Total Events</p>
                  <p className="text-xl lg:text-2xl font-bold">{stats.totalEvents}</p>
                </div>
                <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
              </CardContent>
            </Card>
            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6 flex justify-between items-center">
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Approved Events</p>
                  <p className="text-xl lg:text-2xl font-bold">{stats.approvedEvents}</p>
                </div>
                <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
              </CardContent>
            </Card>
          </div>

          {/* Events Section */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Organisation Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No events created yet.</p>
                  <Button onClick={() => navigate('/create-event')} className="mt-4 btn-hero">
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex-1 mb-2 md:mb-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm md:text-base">{event.title}</h4>
                          <Badge className={getCategoryColor(event.category || "Workshop")}>{event.category || "Workshop"}</Badge>
                          <Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>{event.status}</Badge>
                          {event.ticket_price && event.ticket_price > 0 && (
                            <Badge variant="outline">₹{event.ticket_price}</Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {formatDate(event.start_date)} • {event.location || "Online"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/edit-event/${event.id}`, { state: { eventData: event } })}>
                          <Plus className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/events/${event.id}/checkin`)}>
                          <Camera className="h-4 w-4 mr-1" /> Check-in
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrganisationDashboard;
