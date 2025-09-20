import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Users, 
  Activity, 
  CheckCircle, 
  Eye, 
  Camera, 
  FileText,
  Building2,
  Image,
  Send,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  organisation_id: string;
  likes_count?: number;
  comments_count?: number;
}

interface Organisation {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

const OrganisationDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalEvents: 0,
    approvedEvents: 0,
    totalPosts: 0,
    totalEngagement: 0
  });

  useEffect(() => {
    if (user) {
      checkOrganisationAccess();
    }
  }, [user]);

  const checkOrganisationAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Check if user has an approved organisation
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
        fetchOrganisationPosts(orgData.id),
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

  const fetchOrganisationPosts = async (organisationId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('organisation_id', organisationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch engagement counts for each post
      const postsWithEngagement = await Promise.all(
        (data || []).map(async (post) => {
          const { data: engagement } = await supabase
            .rpc('get_post_engagement', { post_id_param: post.id });
          
          return {
            ...post,
            likes_count: engagement?.[0]?.likes_count || 0,
            comments_count: engagement?.[0]?.comments_count || 0
          };
        })
      );

      setPosts(postsWithEngagement);
    } catch (error) {
      console.error('Error fetching organisation posts:', error);
    }
  };

  const fetchStats = async (organisationId: string) => {
    try {
      const [eventsData, postsData] = await Promise.all([
        supabase
          .from('events')
          .select('id, status')
          .eq('organization_id', organisationId),
        supabase
          .from('posts')
          .select('id')
          .eq('organisation_id', organisationId)
      ]);

      const totalEvents = eventsData.data?.length || 0;
      const approvedEvents = eventsData.data?.filter(e => e.status === 'approved').length || 0;
      const totalPosts = postsData.data?.length || 0;

      // Calculate total engagement (likes + comments)
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('id, posts!inner(organisation_id)')
        .eq('posts.organisation_id', organisationId);

      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('id, posts!inner(organisation_id)')
        .eq('posts.organisation_id', organisationId);

      const totalEngagement = (likesData?.length || 0) + (commentsData?.length || 0);

      setStats({
        totalEvents,
        approvedEvents,
        totalPosts,
        totalEngagement
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setPostForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadPostImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organisation?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organisation) return;

    setCreatingPost(true);
    try {
      let imageUrl = null;
      
      if (postForm.image) {
        imageUrl = await uploadPostImage(postForm.image);
        if (!imageUrl) {
          toast({
            title: "Image upload failed",
            description: "Failed to upload image. Post will be created without image.",
            variant: "destructive",
          });
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          organisation_id: organisation.id,
          title: postForm.title,
          description: postForm.description,
          image_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      });

      setShowCreatePostModal(false);
      setPostForm({ title: '', description: '', image: null });
      setImagePreview(null);
      
      // Refresh posts
      fetchOrganisationPosts(organisation.id);
      fetchStats(organisation.id);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingPost(false);
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
              <Button 
                onClick={() => setShowCreatePostModal(true)} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Post
              </Button>
              <Button 
                onClick={() => navigate('/create-event')} 
                className="btn-hero w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Total Events</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.totalEvents}</p>
                  </div>
                  <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Approved Events</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.approvedEvents}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.totalPosts}</p>
                  </div>
                  <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Total Engagement</p>
                    <p className="text-xl lg:text-2xl font-bold">{stats.totalEngagement}</p>
                  </div>
                  <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organisation Events Section */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Organisation Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No events created yet.
                  </p>
                  <Button onClick={() => navigate('/create-event')} className="mt-4 btn-hero">
                    Create Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1 mb-2 md:mb-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm md:text-base">
                            {event.title}
                          </h4>
                          <Badge className={getCategoryColor(event.category || "Workshop")}>
                            {event.category || "Workshop"}
                          </Badge>
                          <Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          {event.ticket_price && event.ticket_price > 0 && (
                            <Badge variant="outline">₹{event.ticket_price}</Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {formatDate(event.start_date)} • {event.location || "Online"}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/edit-event/${event.id}`, {
                              state: { eventData: event },
                            })
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/events/${event.id}/checkin`)}
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          Check-in
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organisation Posts Section */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Organisation Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No posts created yet.
                  </p>
                  <Button onClick={() => setShowCreatePostModal(true)} className="mt-4 btn-hero">
                    Create Your First Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-sm md:text-base">{post.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.description}
                      </p>

                      {post.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create Post Modal */}
      <Dialog open={showCreatePostModal} onOpenChange={setShowCreatePostModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title *</Label>
              <Input
                id="post-title"
                value={postForm.title}
                onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-description">Description *</Label>
              <Textarea
                id="post-description"
                value={postForm.description}
                onChange={(e) => setPostForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Write your post content..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-image">Image (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null);
                        setPostForm(prev => ({ ...prev, image: null }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload an image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreatePostModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={creatingPost}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {creatingPost ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganisationDashboard;