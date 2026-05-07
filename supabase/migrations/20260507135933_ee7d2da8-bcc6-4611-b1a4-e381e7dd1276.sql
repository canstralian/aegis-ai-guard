
-- Fixed IDs for demo data so we can reference them
DO $$
DECLARE
  demo_org_id uuid := 'a0000000-0000-0000-0000-000000000001';
  demo_ws_id  uuid := 'b0000000-0000-0000-0000-000000000001';
  demo_proj_id uuid := 'c0000000-0000-0000-0000-000000000001';
BEGIN
  -- Demo Organization
  INSERT INTO public.organizations (id, name, slug, settings)
  VALUES (demo_org_id, 'Aegis Demo Org', 'aegis-demo', '{"demo": true}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- Demo Workspace
  INSERT INTO public.workspaces (id, organization_id, name, slug, description)
  VALUES (demo_ws_id, demo_org_id, 'Default Workspace', 'default', 'Primary workspace for the demo organization')
  ON CONFLICT (id) DO NOTHING;

  -- Demo Project
  INSERT INTO public.projects (id, workspace_id, name, slug, description, risk_score)
  VALUES (demo_proj_id, demo_ws_id, 'Aegis Platform', 'aegis-platform', 'Main application security project', 42)
  ON CONFLICT (id) DO NOTHING;

  -- Demo Environment
  INSERT INTO public.environments (id, project_id, name, slug, is_production)
  VALUES (
    'd0000000-0000-0000-0000-000000000001',
    demo_proj_id,
    'Production',
    'production',
    true
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.environments (id, project_id, name, slug, is_production)
  VALUES (
    'd0000000-0000-0000-0000-000000000002',
    demo_proj_id,
    'Staging',
    'staging',
    false
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- Function to auto-assign demo user on profile creation
CREATE OR REPLACE FUNCTION public.seed_demo_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  demo_org_id uuid := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  IF NEW.email = 'demo@aegis.dev' THEN
    -- Add as org member
    INSERT INTO public.organization_members (user_id, organization_id, accepted_at)
    VALUES (NEW.id, demo_org_id, now())
    ON CONFLICT DO NOTHING;

    -- Assign org_owner role
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, demo_org_id, 'org_owner')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on profiles insert
DROP TRIGGER IF EXISTS on_demo_user_created ON public.profiles;
CREATE TRIGGER on_demo_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_demo_user();
