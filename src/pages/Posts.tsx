import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, Calendar, Building2, FileText } from "lucide-react";

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

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  organisation: { name: string };
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  comments: Comment[];
  showComments: boolean;
}

const Posts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const { data: postsData, error } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          description,
          image_url,
          created_at,
          organizations ( name )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedPosts: Post[] = (postsData || []).map((p: any) => {
        return {
          id: p.id,
          title: p.description,
          description: p.content,
          image_url: p.image_url,
          created_at: p.created_at,
          organisation: { name: p.organisation?.name || "Unknown" },
          likes_count: p.post_likes?.length || 0,
          comments_count: p.post_comments?.length || 0,
          user_liked: p.post_likes?.some((l: any) => l.user_id === user?.id) || false,
          comments: p.post_comments?.map((c: any) => ({
            id: c.id,
            comment_text: c.comment_text,
            created_at: c.created_at,
            user_id: c.user_id,
            profiles: {
              name: c.profiles?.name || "Anonymous",
              photo: c.profiles?.photo || null,
            },
          })) || [],
          showComments: false,
        };
      });

      setPosts(mappedPosts);

    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ title: "Error", description: "Failed to load posts.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_liked: !p.user_liked,
              likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post || !user) return;

      if (post.user_liked) {
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, showComments: !p.showComments } : p
      )
    );
  };

  const addComment = async (postId: string) => {
    if (!user) return;
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      // Insert comment
      const { data: insertedComment, error } = await supabase
        .from("post_comments")
        .insert([{ post_id: postId, comment_text: commentText, user_id: user.id }])
        .select("*")
        .single();

      if (error || !insertedComment) throw error;

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, photo")
        .eq("id", user.id)
        .single();

      const newCommentObj: Comment = {
        id: insertedComment.id,
        comment_text: insertedComment.comment_text,
        created_at: insertedComment.created_at,
        user_id: insertedComment.user_id,
        profiles: {
          name: profileData?.name || "Anonymous",
          photo: profileData?.photo || null,
        },
      };

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...p.comments, newCommentObj],
                comments_count: p.comments_count + 1,
              }
            : p
        )
      );

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };



  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/posts#${postId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "Post link copied!" });
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (loading) return <p className="text-center py-12">Loading posts...</p>;

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Community Posts</h1>
          <p className="text-muted-foreground">Latest news, announcements, and discussions</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      <Building2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{post.organisation.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatTime(post.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">{post.title}</h4>
                  <p>{post.description}</p>
                </div>

                {post.image_url && <img src={post.image_url} alt={post.title} className="rounded-md" />}

                <div className="flex space-x-4 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                    <Heart className={`h-5 w-5 mr-1 ${post.user_liked ? "text-red-500 fill-current" : ""}`} />
                    {post.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleComments(post.id)}>
                    <MessageCircle className="h-5 w-5 mr-1" />
                    {post.comments_count}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                    <Share2 className="h-5 w-5 mr-1" /> Share
                  </Button>
                </div>

                {post.showComments && (
                  <div className="mt-4 space-y-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="flex space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{c.profiles?.name.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted/20 rounded p-2 flex-1">
                          <p className="text-sm font-medium">{c.profiles?.name}</p>
                          <p className="text-sm">{c.comment_text}</p>
                        </div>
                      </div>
                    ))}
                    {user && (
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          className="flex-1"
                        />
                        <Button onClick={() => addComment(post.id)}>Post</Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;
