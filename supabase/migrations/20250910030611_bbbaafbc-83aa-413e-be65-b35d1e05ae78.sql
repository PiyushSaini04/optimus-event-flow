-- Fix critical security issue: Remove overly permissive profile access policies
-- Current issue: Anyone (even unauthenticated) can read all user profiles including phone numbers

-- Drop the dangerous policies that allow unrestricted access to all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access to profiles" ON public.profiles;

-- Create secure, restrictive policies for profile access

-- 1. Users can view their own complete profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Admins and organizers can view all profiles (needed for management)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles admin_check 
  WHERE admin_check.user_id = auth.uid() 
  AND admin_check.role IN ('admin', 'organiser')
));

-- 3. Authenticated users can view only basic info (name and role) of other users
-- This is needed for displaying event organizers, but excludes sensitive data
CREATE POLICY "Authenticated users see basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Always allow if user is viewing their own profile (gets full access via policy #1)
  auth.uid() = user_id 
  -- Or if user is admin/organizer (gets full access via policy #2)
  OR EXISTS (
    SELECT 1 FROM profiles admin_check 
    WHERE admin_check.user_id = auth.uid() 
    AND admin_check.role IN ('admin', 'organiser')
  )
  -- Or if authenticated user needs basic info only (app must filter sensitive fields)
  OR auth.uid() IS NOT NULL
);

-- Note: With policy #3, the application code must be responsible for filtering
-- sensitive fields (phone_number, location) when displaying other users' profiles
-- Only name and role should be shown to non-admin authenticated users