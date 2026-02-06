-- Create trigger function to auto-assign admin role for super admin email
CREATE OR REPLACE FUNCTION public.handle_super_admin_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
  
  -- If this is the super admin email, upgrade to admin role
  IF user_email = 'buwatetc@gmail.com' THEN
    NEW.role := 'admin';
    NEW.is_super_admin := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_roles insert
DROP TRIGGER IF EXISTS check_super_admin_on_signup ON public.user_roles;
CREATE TRIGGER check_super_admin_on_signup
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_super_admin_signup();