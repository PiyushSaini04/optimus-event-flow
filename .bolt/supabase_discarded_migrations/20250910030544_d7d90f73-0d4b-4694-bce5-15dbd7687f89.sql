-- Create a security definer function to return only safe profile fields for non-admin users
CREATE OR REPLACE FUNCTION public.get_safe_profile_fields(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  role text,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.id, p.name, p.role, p.created_at
  FROM profiles p
  WHERE p.user_id = profile_user_id;
$$;

-- Create a view for public profile access that only exposes safe fields
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  name,
  role,
  created_at,
  user_id
FROM profiles
WHERE 
  -- Current user can see their own full profile
  auth.uid() = user_id
  OR
  -- Admins can see all profiles
  EXISTS (
    SELECT 1 FROM profiles admin_check 
    WHERE admin_check.user_id = auth.uid() 
    AND admin_check.role IN ('admin', 'organiser')
  );

-- Enable RLS on the view
ALTER VIEW public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for the view
CREATE POLICY "Public profiles view access" 
ON public.public_profiles 
FOR SELECT 
TO authenticated
USING (true);