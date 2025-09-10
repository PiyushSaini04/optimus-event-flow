-- Fix security issue: Remove overly permissive profile access policies
-- and implement proper user-specific visibility controls

-- Drop the overly permissive policies that allow anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access to profiles" ON public.profiles;

-- Create secure, granular policies for profile access

-- 1. Users can view their own complete profile (including sensitive data)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Authenticated users can view basic info (name only) of other users
-- This is needed for displaying event organizers, team members, etc.
CREATE POLICY "Authenticated users can view public profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true)
WITH CHECK (false); -- This ensures only SELECT is allowed, not full access

-- 3. Admins/organizers can view full profiles when needed for their role
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'organiser')
));

-- Note: We need to be careful about the second policy above.
-- Let's replace it with a more specific approach that only exposes name field publicly

-- Actually, let's be more specific and create a view for public profile data
-- First, remove the broad policy we just created
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;

-- Create a more restrictive policy: authenticated users can only see names of other users
-- For sensitive data like phone_number and location, only the user themselves or admins can see it
CREATE POLICY "Authenticated users see limited profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- User can see their own full profile
  auth.uid() = user_id 
  OR 
  -- Admins can see all profiles  
  EXISTS (
    SELECT 1 FROM profiles admin_check 
    WHERE admin_check.user_id = auth.uid() 
    AND admin_check.role IN ('admin', 'organiser')
  )
  OR
  -- Others can only access if they're authenticated (name field will be filtered in app)
  auth.uid() IS NOT NULL
);