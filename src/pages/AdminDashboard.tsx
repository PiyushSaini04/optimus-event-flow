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
  User,
  MessageSquare,
  Edit,
  Trash,
  ImagePlus,
  ImageMinus,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  organiser_name: string;
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("organizations");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<EventRegistration[]>([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [showAddTeamMemberModal, setShowAddTeamMemberModal] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({ name: "", email: "", role: "member" });
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showAddGalleryItemModal, setShowAddGalleryItemModal] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: "", image_url: "" });

  useEffect(() => {
    console.log("AdminDashboard: authLoading changed:", authLoading);
    if (!authLoading) {
      console.log("AdminDashboard: user and userRole available. User:", user, "Role:", userRole);
      checkAdminAccess();
    }
  }, [user, userRole, authLoading]);

  const checkAdminAccess = async () => {
    console.log("AdminDashboard: checkAdminAccess called. Current userRole:", userRole);
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole !== "organiser") {
      toast({
        title: "Access Denied",
        description: "You don't have organiser privileges.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    try {
      await Promise.all([
        fetchUserProfiles(),
        fetchOrganizations(),
        fetchEvents(),
        fetchTeamMembers(),
        fetchPosts(),
        fetchGalleryItems(),
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role, user_id, created_at, email:auth.users(email)")
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

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching team members:", error);
      return;
    }
    setTeamMembers(data || []);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return;
    }
    setPosts(data || []);
  };

  const fetchGalleryItems = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching gallery items:", error);
      return;
    }
    setGalleryItems(data || []);
  };

  const addPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("posts")
        .insert({ title: newPost.title, content: newPost.content, author_id: user.id });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully.",
      });
      setShowAddPostModal(false);
      setNewPost({ title: "", content: "" });
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
    }
  };

  const updatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      const { error } = await supabase
        .from("posts")
        .update({ title: newPost.title, content: newPost.content })
        .eq("id", editingPost.id);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated successfully.",
      });
      setShowAddPostModal(false);
      setNewPost({ title: "", content: "" });
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully.",
      });
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const addGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("gallery")
        .insert({ title: newGalleryItem.title, image_url: newGalleryItem.image_url });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Gallery item added successfully.",
      });
      setShowAddGalleryItemModal(false);
      setNewGalleryItem({ title: "", image_url: "" });
      fetchGalleryItems();
    } catch (error) {
      console.error("Error adding gallery item:", error);
      toast({
        title: "Error",
        description: "Failed to add gallery item.",
        variant: "destructive",
      });
    }
  };

  const removeGalleryItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Gallery item removed successfully.",
      });
      fetchGalleryItems();
    } catch (error) {
      console.error("Error removing gallery item:", error);
      toast({
        title: "Error",
        description: "Failed to remove gallery item.",
        variant: "destructive",
      });
    }
  };

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("team")
        .insert({ name: newTeamMember.name, email: newTeamMember.email, role: newTeamMember.role });
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member added successfully.",
      });
      setShowAddTeamMemberModal(false);
      setNewTeamMember({ name: "", email: "", role: "member" });
      fetchTeamMembers();
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive",
      });
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully.",
      });
      fetchTeamMembers();
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member.",
        variant: "destructive",
      });
    }
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
        case "team":
          data = teamMembers;
          break;
        case "posts":
          data = posts;
          break;
        case "gallery":
          data = galleryItems;
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
    { id: "team", label: "Team", icon: User },
    { id: "posts", label: "Posts", icon: MessageSquare },
    { id: "gallery", label: "Gallery", icon: Image },
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
              <h1 className="text-4xl font-bold text-glow">Organiser Dashboard</h1>
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
                      <TableHead>Organiser</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.organiser_name}</TableCell>
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
                          <Badge variant={profile.role === "organiser" ? "default" : "secondary"}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {profile.role === "user" ? (
                              <Button
                                size="sm"
                                onClick={() => updateUserRole(profile.user_id, "organiser")}x
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

          {/* Team Tab */}
          {activeTab === "team" && (
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="mb-4" onClick={() => setShowAddTeamMemberModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Add Team Member
                </Button>
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
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge>{member.role}</Badge>
                        </TableCell>
                        <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeTeamMember(member.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <Card>
              <CardHeader>
                <CardTitle>Posts Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="mb-4" onClick={() => { setShowAddPostModal(true); setEditingPost(null); setNewPost({ title: "", content: "" }); }}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Create New Post
                </Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>Author ID: {post.author_id.slice(0, 8)}...</TableCell>
                        <TableCell>{post.content.substring(0, 50)}...</TableCell>
                        <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPost(post);
                                setNewPost({ title: post.title, content: post.content });
                                setShowAddPostModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash className="h-4 w-4" />
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

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="mb-4" onClick={() => { setShowAddGalleryItemModal(true); setNewGalleryItem({ title: "", image_url: "" }); }}>
                  <ImagePlus className="h-4 w-4 mr-2" /> Add Gallery Item
                </Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Image URL</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {galleryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.image_url.substring(0, 50)}...</TableCell>
                        <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeGalleryItem(item.id)}
                          >
                            <ImageMinus className="h-4 w-4" />
                          </Button>
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
                { name: "team", label: "Team Members" },
                { name: "posts", label: "Posts" },
                { name: "gallery", label: "Gallery Items" },
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

        {/* Add Team Member Modal */}
        <Dialog open={showAddTeamMemberModal} onOpenChange={setShowAddTeamMemberModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Fill in the details for the new team member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addTeamMember} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={newTeamMember.name}
                  onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTeamMember.email}
                  onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Input
                  id="role"
                  value={newTeamMember.role}
                  onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., member, manager, etc."
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add Member</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Post Modal */}
        <Dialog open={showAddPostModal} onOpenChange={setShowAddPostModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
              <DialogDescription>
                {editingPost ? "Edit the details of the post." : "Fill in the details for the new post."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingPost ? updatePost : addPost} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="post-title" className="text-right">Title</Label>
                <Input
                  id="post-title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="post-content" className="text-right">Content</Label>
                <Textarea
                  id="post-content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="col-span-3 min-h-[100px]"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingPost ? "Save Changes" : "Create Post"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Gallery Item Modal */}
        <Dialog open={showAddGalleryItemModal} onOpenChange={setShowAddGalleryItemModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Gallery Item</DialogTitle>
              <DialogDescription>
                Add a new image to the gallery.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addGalleryItem} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gallery-title" className="text-right">Title</Label>
                <Input
                  id="gallery-title"
                  value={newGalleryItem.title}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-url" className="text-right">Image URL</Label>
                <Input
                  id="image-url"
                  value={newGalleryItem.image_url}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, image_url: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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