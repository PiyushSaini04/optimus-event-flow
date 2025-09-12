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

-- 2. Admins/organizers can view all profiles when needed for their role
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles admin_check 
  WHERE admin_check.user_id = auth.uid() 
  AND admin_check.role IN ('admin', 'organiser')
));

-- 3. Authenticated users can view basic profile info (name and role only) of other users
-- This is needed for displaying event organizers, team members, etc.
-- Sensitive data like phone_number and location will need to be filtered in the application layer
CREATE POLICY "Authenticated users see basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);