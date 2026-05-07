
-- =========================================================
-- FIX 1: github_repositories — change public → authenticated
-- =========================================================

DROP POLICY IF EXISTS "Admins can manage repos" ON public.github_repositories;
CREATE POLICY "Admins can manage repos"
  ON public.github_repositories
  FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), organization_id, ARRAY['org_owner'::app_role, 'security_admin'::app_role, 'devops_engineer'::app_role]));

DROP POLICY IF EXISTS "Users can view repos in their orgs" ON public.github_repositories;
CREATE POLICY "Users can view repos in their orgs"
  ON public.github_repositories
  FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- =========================================================
-- FIX 2: github_sync_jobs — change public → authenticated
-- =========================================================

DROP POLICY IF EXISTS "Admins can manage sync jobs" ON public.github_sync_jobs;
CREATE POLICY "Admins can manage sync jobs"
  ON public.github_sync_jobs
  FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), organization_id, ARRAY['org_owner'::app_role, 'security_admin'::app_role, 'devops_engineer'::app_role]));

DROP POLICY IF EXISTS "Users can view sync jobs in their orgs" ON public.github_sync_jobs;
CREATE POLICY "Users can view sync jobs in their orgs"
  ON public.github_sync_jobs
  FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- =========================================================
-- FIX 3: organization_members — change public → authenticated
-- =========================================================

DROP POLICY IF EXISTS "Admins can view full membership data" ON public.organization_members;
CREATE POLICY "Admins can view full membership data"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), organization_id, ARRAY['org_owner'::app_role, 'security_admin'::app_role]));

DROP POLICY IF EXISTS "Users can view active members via function" ON public.organization_members;
CREATE POLICY "Users can view active members via function"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_any_role(auth.uid(), organization_id, ARRAY['org_owner'::app_role, 'security_admin'::app_role]));

-- =========================================================
-- FIX 4: integrations — change public → authenticated on SELECT
-- =========================================================

DROP POLICY IF EXISTS "Only admins can access integrations" ON public.integrations;
CREATE POLICY "Only admins can access integrations"
  ON public.integrations
  FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), organization_id, ARRAY['org_owner'::app_role, 'security_admin'::app_role]));

-- =========================================================
-- FIX 5: integrations — create a safe view excluding credentials
-- =========================================================

CREATE OR REPLACE VIEW public.integrations_safe
WITH (security_invoker = on) AS
  SELECT
    id,
    organization_id,
    type,
    name,
    status,
    config,
    scopes,
    last_sync_at,
    last_error,
    health_check_at,
    created_at,
    updated_at
  FROM public.integrations;
-- Note: credentials_encrypted is intentionally excluded.
-- Application code should query integrations_safe instead of integrations directly.
