import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  title: string;
  content: string;
  description: string;
  image_url: string | null;
  author_id: string;
  organisation_id: string;
  created_at: string;
  organizations?: { name: string };
  profiles?: { name: string };
  likes_count?: number;
  comments_count?: number;
}

export const postService = {
  async getAllPosts(): Promise<Post[]> {
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

    return postsWithEngagement;
  },

  async getOrganizationPosts(organizationId: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        organizations(name),
        profiles(name)
      `)
      .eq('organisation_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPost(postData: {
    title?: string;
    content: string;
    description: string;
    image_url?: string;
    author_id: string;
    organisation_id: string;
  }): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        title: postData.title || postData.description,
        created_by: postData.author_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePost(postId: string, updates: Partial<Post>): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId);

    if (error) throw error;
  },

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  async uploadImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
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
  }
};