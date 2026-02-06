-- Add is_super_admin column to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Add created_by column to user_roles to track who added the admin
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create action_logs table to track all admin actions
CREATE TABLE IF NOT EXISTS public.action_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL,
    action_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on action_logs
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view action logs
CREATE POLICY "Admins can view all action logs"
    ON public.action_logs FOR SELECT
    USING (public.is_admin(auth.uid()));

-- Only admins can create action logs
CREATE POLICY "Admins can create action logs"
    ON public.action_logs FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND is_super_admin = true
  )
$$;

-- Update RLS for user_roles to allow super admins to manage other admins
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin(auth.uid()));

-- Create function to initialize super admin on first admin login
CREATE OR REPLACE FUNCTION public.initialize_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    super_admin_email text := 'buwatetc@gmail.com';
    profile_email text;
BEGIN
    -- Get the email from the profile
    SELECT email INTO profile_email FROM public.profiles WHERE user_id = NEW.user_id;
    
    -- If this is the super admin email, set is_super_admin to true
    IF profile_email = super_admin_email AND NEW.role = 'admin' THEN
        NEW.is_super_admin := true;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-set super admin
DROP TRIGGER IF EXISTS set_super_admin ON public.user_roles;
CREATE TRIGGER set_super_admin
    BEFORE INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_super_admin();

-- Update existing admin role for buwatetc@gmail.com if exists
UPDATE public.user_roles 
SET is_super_admin = true 
WHERE user_id IN (
    SELECT user_id FROM public.profiles WHERE email = 'buwatetc@gmail.com'
) AND role = 'admin';