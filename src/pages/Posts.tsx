  const { organization } = useOrganization();
  const { posts, loading, likePost, sharePost, addComment, refetch } = usePosts();
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Community Posts</h1>
            <p className="text-muted-foreground">Latest news, announcements, and discussions</p>
          </div>
          {organization && (
            <Button onClick={() => setShowCreatePost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-lg">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              {organization ? "Be the first to share something!" : "Join an organization to see posts."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={likePost}
                onShare={sharePost}
                onComment={addComment}
              />
            ))}
          </div>
        )}

        {/* Create Post Modal */}
        {organization && (
          <CreatePostModal
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            organizationUuid={organization.uuid}
            onPostCreated={refetch}
          />
        )}
      </div>
    </div>
  );
};

export default Posts;
