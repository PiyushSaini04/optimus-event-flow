-- Fix critical security issue: Remove public access to sensitive student application data
-- and restrict to authorized administrators only

-- Drop the overly permissive policies that allow anyone to view all applications
DROP POLICY IF EXISTS "Anyone can view applications" ON public.optimus_applications;
DROP POLICY IF EXISTS "allow_select_recruitment_status" ON public.optimus_applications;

-- Create secure policy: Only admins/organisers can view applications
CREATE POLICY "Only admins can view applications" 
ON public.optimus_applications 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'organiser')
));

-- Keep the insert policy for public application submissions
-- (This allows the application form to work for unauthenticated users)
-- The existing "Anyone can insert applications" policy remains unchanged

-- Keep the update policy for admins
-- The existing "Admin can update any application" policy remains unchanged