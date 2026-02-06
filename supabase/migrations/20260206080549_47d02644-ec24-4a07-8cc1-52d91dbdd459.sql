
-- Add approval_status to profiles for coaches pending approval
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approved_at and approved_by columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Add hourly_rate and certifications for coaches
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 50000,
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;

-- Update the handle_new_user function to set pending approval for coaches
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role public.app_role;
  approval_stat TEXT;
BEGIN
  -- Get role from user metadata, default to 'member'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.app_role,
    'member'
  );
  
  -- Set approval status: coaches need approval, others are approved
  IF user_role = 'coach' THEN
    approval_stat := 'pending';
  ELSE
    approval_stat := 'approved';
  END IF;
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, full_name, email, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    approval_stat
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add function to check if coach is approved
CREATE OR REPLACE FUNCTION public.is_coach_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND approval_status = 'approved'
  )
$$;

-- Create function to get pending coaches for admin
CREATE OR REPLACE FUNCTION public.get_pending_coaches()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  specialties TEXT[],
  certifications TEXT[],
  years_experience INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.email,
    p.phone,
    p.bio,
    p.specialties,
    p.certifications,
    p.years_experience,
    p.created_at
  FROM public.profiles p
  INNER JOIN public.user_roles r ON r.user_id = p.user_id
  WHERE r.role = 'coach'
    AND p.approval_status = 'pending'
  ORDER BY p.created_at DESC
$$;
