import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Image as ImageIcon,
  Building2,
  Calendar,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface Post {
  id: string;
  title: string;
  content: string;
  description: string;
  image_url: string | null;
  created_at: string;
  author_id: string;
  organisation_id: string;
  organizations: { name: string };
  profiles: { name: string };
  likes_count?: number;
  comments_count?: number;
}

interface Organization {
  id: string;
  name: string;
}

const PostManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    organisation_id: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchOrganizations();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          organizations(name),
          profiles(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch engagement data for each post
      const postsWithEngagement = await Promise.all(
        (data || []).map(async (post) => {
          const [likesData, commentsData] = await Promise.all([
            supabase
              .from('post_interactions')
              .select('id')
              .eq('post_id', post.id)
              .eq('type', 'like'),
            supabase
              .from('post_interactions')
              .select('id')
              .eq('post_id', post.id)
              .eq('type', 'comment')
          ]);

          return {
            ...post,
            likes_count: likesData.data?.length || 0,
            comments_count: commentsData.data?.length || 0
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

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('status', 'approved')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file, { upsert: true });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let imageUrl = editingPost?.image_url || null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const postData = {
        title: formData.title || formData.description,
        content: formData.content,
        description: formData.description,
        image_url: imageUrl,
        author_id: user.id,
        organisation_id: formData.organisation_id,
        created_by: user.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: "Post updated",
          description: "Post has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert(postData);

        if (error) throw error;

        toast({
          title: "Post created",
          description: "Post has been created successfully.",
        });
      }

      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content,
      description: post.description || '',
      organisation_id: post.organisation_id,
    });
    setImagePreview(post.image_url);
    setShowCreateModal(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Post has been deleted successfully.",
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', description: '', organisation_id: '' });
    setImageFile(null);
    setImagePreview(null);
    setEditingPost(null);
    setShowCreateModal(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Post Management
          </CardTitle>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{post.title || post.description}</h4>
                        <Badge variant="outline">
                          <Building2 className="h-3 w-3 mr-1" />
                          {post.organizations?.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        By {post.profiles?.name} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments_count || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organisation">Organization *</Label>
              <select
                id="organisation"
                value={formData.organisation_id}
                onChange={(e) => setFormData(prev => ({ ...prev, organisation_id: e.target.value }))}
                className="w-full p-2 border border-border rounded-md bg-background"
                required
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Post Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's happening?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Detailed Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Add more details (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image (optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostManagement;