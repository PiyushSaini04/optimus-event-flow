import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Calendar, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  organisation_id: string;
  organization: {
    name: string;
  };
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  comments: Comment[];
  showComments: boolean;
}

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    photo: string | null;
  };
}

const Posts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPosts();
    setupRealtimeSubscription();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          organisation_id,
          organizations!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch engagement data for each post
      const postsWithEngagement = await Promise.all(
        (data || []).map(async (post) => {
          const [likesData, commentsData, userLikeData] = await Promise.all([
            supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id),
            supabase
              .from('post_comments')
              .select(`
                id,
                comment_text,
                created_at,
                user_id,
                profiles!inner(name, photo)
              `)
              .eq('post_id', post.id)
              .order('created_at', { ascending: false }),
            user ? supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single() : { data: null }
          ]);

          return {
            ...post,
            organization: Array.isArray(post.organizations) ? post.organizations[0] : post.organizations,
            likes_count: likesData.data?.length || 0,
            comments_count: commentsData.data?.length || 0,
            user_liked: !!userLikeData.data,
            comments: commentsData.data || [],
            showComments: false
          };
        })
      );

      setPosts(postsWithEngagement);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('posts_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_likes' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'post_likes' },
        () => fetchPosts()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments' },
        () => fetchPosts()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Update local state immediately for better UX
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              user_liked: !p.user_liked, 
              likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1 
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    }
  };

  const toggleComments = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, showComments: !post.showComments }
        : post
    ));
  };

  const addComment = async (postId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to comment on posts.",
        variant: "destructive",
      });
      return;
    }

    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          comment_text: commentText
        });

      if (error) throw error;

      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      // Refresh posts to get updated comments
      fetchPosts();

      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (post: Post) => {
    try {
      const shareUrl = `${window.location.origin}/posts#${post.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl font-bold text-glow mb-4">Community Posts</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest news, announcements, and discussions from the Optimus community.
          </p>
        </div>

        {/* Posts Feed */}
        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Be the first to share something with the community!
              </p>
            </div>
          ) : (
            posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="card-modern fade-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
                id={post.id}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20">
                        <Building2 className="h-6 w-6 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{post.organization.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          Organisation
                        </Badge>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatTime(post.created_at)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Post Content */}
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
                    <p className="text-foreground leading-relaxed">{post.description}</p>
                  </div>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 transition-all duration-300 ${
                          post.user_liked 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-5 w-5 transition-all duration-300 ${
                          post.user_liked ? 'fill-current scale-110' : ''
                        }`} />
                        <span>{post.likes_count}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments_count}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post)}
                        className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                      >
                        <Share2 className="h-5 w-5" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {post.showComments && (
                    <div className="space-y-4 pt-4 border-t border-border/50 fade-up">
                      {/* Add Comment */}
                      {user && (
                        <div className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder="Write a comment..."
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ 
                                ...prev, 
                                [post.id]: e.target.value 
                              }))}
                              className="min-h-[80px] bg-muted/20 border-border/50 focus:border-primary resize-none"
                            />
                            <Button 
                              onClick={() => addComment(post.id)}
                              size="sm"
                              className="btn-hero"
                              disabled={!newComment[post.id]?.trim()}
                            >
                              Comment
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      <div className="space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex space-x-3 fade-up">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.profiles?.photo || undefined} />
                              <AvatarFallback>
                                {comment.profiles?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted/20 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{comment.profiles?.name || 'Anonymous'}</span>
                                <span className="text-xs text-muted-foreground">{formatTime(comment.created_at)}</span>
                              </div>
                              <p className="text-sm text-foreground">{comment.comment_text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;