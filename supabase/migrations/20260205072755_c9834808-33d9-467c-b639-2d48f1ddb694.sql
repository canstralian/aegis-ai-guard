-- Fix integrations_credentials_exposure: Restrict direct integrations table access to admins only
-- Regular org members will no longer see integrations (including credentials_encrypted field)

-- Drop the existing permissive SELECT policy for all members
DROP POLICY IF EXISTS "Users can view integrations in their orgs" ON public.integrations;

-- Add new restrictive policy: only org_owner and security_admin can access full integrations table
CREATE POLICY "Only admins can access integrations" 
  ON public.integrations 
  FOR SELECT 
  USING (has_any_role(auth.uid(), organization_id, ARRAY['org_owner'::app_role, 'security_admin'::app_role]));
