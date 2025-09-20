import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

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

export const usePosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    setupRealtimeSubscription();
  }, [user]);

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
            comments: commentsData.data || []
          };
        })
      );

      setPosts(postsWithEngagement);
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('posts_realtime')
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

  const likePost = async (postId: string) => {
    if (!user) throw new Error('User not authenticated');

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

      // Update local state immediately
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
      throw error;
    }
  };

  const addComment = async (postId: string, commentText: string) => {
    if (!user) throw new Error('User not authenticated');
    if (!commentText.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          comment_text: commentText.trim()
        });

      if (error) throw error;

      // Refresh posts to get updated comments
      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  return {
    posts,
    loading,
    likePost,
    addComment,
    refetch: fetchPosts
  };
};