import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Building,
  Calendar,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

interface UserProfile {
  id: string;
  name: string;
  role: string;
  user_id: string;
  created_at: string;
  email?: string;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  status: string;
  owner_id: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  status: string;
  created_by: string;
  created_at: string;
  start_date: string;
  organizer_name: string;
  organization_id: string;
}

interface EventRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  event_id: string;
  event?: { title: string };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("organizations");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<EventRegistration[]>([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      await Promise.all([
        fetchUserProfiles(),
        fetchOrganizations(),
        fetchEvents(),
      ]);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user profiles:", error);
      return;
    }

    // Get user emails from auth.users (if available)
    const profilesWithEmail = await Promise.all(
      (data || []).map(async (profile) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
          return { ...profile, email: userData?.user?.email };
        } catch {
          return profile;
        }
      })
    );

    setUserProfiles(profilesWithEmail);
  };

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching organizations:", error);
      return;
    }

    setOrganizations(data || []);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data || []);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      fetchUserProfiles();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const updateOrganizationStatus = async (orgId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ status })
        .eq("id", orgId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Organization ${status}`,
      });

      fetchOrganizations();
    } catch (error) {
      console.error("Error updating organization status:", error);
      toast({
        title: "Error",
        description: "Failed to update organization status",
        variant: "destructive",
      });
    }
  };

  const updateEventStatus = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event ${status}`,
      });

      fetchEvents();
    } catch (error) {
      console.error("Error updating event status:", error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    }
  };

  const viewEventRegistrations = async (eventId: string, eventTitle: string) => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSelectedEventRegistrations(data || []);
      setSelectedEventTitle(eventTitle);
      setShowRegistrations(true);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    }
  };

  const downloadTable = async (tableName: string) => {
    try {
      let data;
      let fileName = tableName;

      switch (tableName) {
        case "profiles":
          data = userProfiles;
          break;
        case "organizations":
          data = organizations;
          break;
        case "events":
          data = events;
          break;
        case "event_registrations":
          const { data: registrations, error } = await supabase
            .from("event_registrations")
            .select("*");
          if (error) throw error;
          data = registrations;
          break;
        default:
          return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
      XLSX.writeFile(workbook, `${fileName}.xlsx`);

      toast({
        title: "Download Complete",
        description: `${fileName}.xlsx has been downloaded`,
      });
    } catch (error) {
      console.error("Error downloading data:", error);
      toast({
        title: "Error",
        description: "Failed to download data",
        variant: "destructive",
      });
    }
  };

  const downloadEventRegistrations = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(selectedEventRegistrations);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "registrations");
      XLSX.writeFile(workbook, `${selectedEventTitle}_registrations.xlsx`);

      toast({
        title: "Download Complete",
        description: "Event registrations downloaded",
      });
    } catch (error) {
      console.error("Error downloading registrations:", error);
      toast({
        title: "Error",
        description: "Failed to download registrations",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  const tabs = [
    { id: "organizations", label: "Organizations", icon: Building },
    { id: "events", label: "Events", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
    { id: "data", label: "Download Data", icon: Download },
  ];

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-glow">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, organizations, and events</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Organizations Tab */}
          {activeTab === "organizations" && (
            <Card>
              <CardHeader>
                <CardTitle>Organizations Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>Owner ID: {org.owner_id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              org.status === "approved"
                                ? "default"
                                : org.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {org.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {org.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateOrganizationStatus(org.id, "approved")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateOrganizationStatus(org.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <Card>
              <CardHeader>
                <CardTitle>Events Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.organizer_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.status === "approved"
                                ? "default"
                                : event.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(event.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {event.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateEventStatus(event.id, "approved")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateEventStatus(event.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewEventRegistrations(event.id, event.title)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell>{profile.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {profile.role === "user" ? (
                              <Button
                                size="sm"
                                onClick={() => updateUserRole(profile.user_id, "admin")}
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(profile.user_id, "user")}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Download Data Tab */}
          {activeTab === "data" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "profiles", label: "User Profiles" },
                { name: "organizations", label: "Organizations" },
                { name: "events", label: "Events" },
                { name: "event_registrations", label: "Event Registrations" },
              ].map((table) => (
                <Card key={table.name}>
                  <CardHeader>
                    <CardTitle>{table.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => downloadTable(table.name)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download {table.label} Excel
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Event Registrations Modal */}
        <Dialog open={showRegistrations} onOpenChange={setShowRegistrations}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrations for {selectedEventTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Button onClick={downloadEventRegistrations} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Registrations Excel
              </Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEventRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration.name}</TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>{registration.phone || "N/A"}</TableCell>
                      <TableCell>{new Date(registration.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;