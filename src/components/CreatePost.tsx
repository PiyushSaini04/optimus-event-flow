import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';

interface LocationState {
  organisationId: string;
}

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const organisationId = state?.organisationId;

  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!organisationId) {
    return (
      <div className="p-4 text-red-500">
        Organisation ID not provided. Please go back and select your organisation.
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organisationId}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error("Upload error:", error.message);
        return null;
      }

      console.log("Upload success:", data);

      const { data: publicData } = supabase.storage.from('post-images').getPublicUrl(fileName);
      return publicData.publicUrl;
    } catch (err) {
      console.error("Image upload error:", err);
      return null;
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | null = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { error } = await supabase.from('posts').insert([
        {
          organisation_id: organisationId,
          content: description,        // main content
          description: description,    // short description / summary
          image_url: imageUrl,
          created_by: user.id,
          author_id: user.id
        }
      ]);

      if (error) {
        console.error('Insert post error:', error);
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Success', description: 'Post created successfully!', variant: 'default' });
      setDescription('');
      setImage(null);
      setImagePreview(null);

      navigate(-1); // go back to dashboard or previous page

    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto border border-border rounded-lg p-6 space-y-6 mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="post-description">Your Post</Label>
          <Textarea
            id="post-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write something..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Image (optional)</Label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center p-4 border-2 border-dashed rounded-lg">
              <Image className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload an image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full flex items-center justify-center">
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
