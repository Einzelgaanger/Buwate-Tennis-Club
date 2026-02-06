-- Create ENUMS for the tennis club
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'coach');
CREATE TYPE public.membership_type AS ENUM ('monthly', 'annual', 'pay_as_you_play');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.court_status AS ENUM ('active', 'maintenance', 'closed');
CREATE TYPE public.booking_type AS ENUM ('member', 'non_member', 'coaching', 'tournament', 'maintenance');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE public.payment_verification_status AS ENUM ('pending', 'verified', 'rejected', 'refunded');
CREATE TYPE public.session_type AS ENUM ('private', 'semi_private', 'group', 'clinic');
CREATE TYPE public.session_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.availability_recurring AS ENUM ('none', 'weekly');
CREATE TYPE public.dependent_relationship AS ENUM ('spouse', 'child', 'parent', 'sibling', 'other');
CREATE TYPE public.pledge_status AS ENUM ('pending', 'partial', 'fulfilled', 'overdue', 'cancelled');
CREATE TYPE public.revenue_category AS ENUM ('pledges', 'membership_fees', 'playing_fees', 'coaching_fees', 'tournament_fees', 'other');
CREATE TYPE public.expense_category AS ENUM ('coach_payments', 'maintenance', 'utilities', 'equipment', 'supplies', 'salaries', 'other');

-- USER ROLES TABLE (Critical for security - separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  date_of_birth DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  membership_type membership_type DEFAULT 'pay_as_you_play',
  membership_start DATE,
  membership_end DATE,
  status user_status DEFAULT 'active',
  notes TEXT,
  bio TEXT,
  specialties TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COURTS TABLE
CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surface TEXT DEFAULT 'Clay',
  description TEXT,
  status court_status DEFAULT 'active',
  has_floodlights BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BOOKINGS TABLE
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  booking_type booking_type NOT NULL,
  status booking_status DEFAULT 'pending',
  is_prime_time BOOLEAN DEFAULT false,
  amount INTEGER DEFAULT 0,
  payment_status payment_status DEFAULT 'unpaid',
  opponent_name TEXT,
  notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COACHING SESSIONS TABLE
CREATE TABLE public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type session_type DEFAULT 'private',
  max_students INTEGER DEFAULT 1,
  current_students INTEGER DEFAULT 1,
  status session_status DEFAULT 'pending',
  amount INTEGER DEFAULT 0,
  payment_status payment_status DEFAULT 'unpaid',
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COACH AVAILABILITY TABLE
CREATE TABLE public.coach_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  recurring availability_recurring DEFAULT 'none',
  recurring_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DEPENDENTS TABLE
CREATE TABLE public.dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship dependent_relationship NOT NULL,
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.coaching_sessions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'momo',
  momo_number TEXT,
  transaction_reference TEXT,
  status payment_verification_status DEFAULT 'pending',
  payment_date TIMESTAMPTZ DEFAULT now(),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  description TEXT,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- REVENUE ENTRIES TABLE
CREATE TABLE public.revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category revenue_category NOT NULL,
  amount INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXPENSE ENTRIES TABLE
CREATE TABLE public.expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category expense_category NOT NULL,
  amount INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  vendor TEXT,
  description TEXT NOT NULL,
  receipt_url TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PLEDGES TABLE
CREATE TABLE public.pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  pledge_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_amount INTEGER DEFAULT 0,
  remaining_amount INTEGER GENERATED ALWAYS AS (amount - paid_amount) STORED,
  status pledge_status DEFAULT 'pending',
  purpose TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECURITY DEFINER FUNCTIONS FOR ROLE CHECKS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_coach(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'coach')
$$;

CREATE OR REPLACE FUNCTION public.is_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'member')
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- TRIGGER FOR AUTO-CREATING PROFILE AND ROLE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'member')
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON public.courts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coaching_sessions_updated_at BEFORE UPDATE ON public.coaching_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coach_availability_updated_at BEFORE UPDATE ON public.coach_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dependents_updated_at BEFORE UPDATE ON public.dependents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_revenue_entries_updated_at BEFORE UPDATE ON public.revenue_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expense_entries_updated_at BEFORE UPDATE ON public.expense_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pledges_updated_at BEFORE UPDATE ON public.pledges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Coaches can view member profiles" ON public.profiles FOR SELECT USING (public.is_coach(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR courts
CREATE POLICY "Anyone authenticated can view active courts" ON public.courts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage courts" ON public.courts FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Coaches can view assigned bookings" ON public.bookings FOR SELECT USING (auth.uid() = coach_id);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookings" ON public.bookings FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR coaching_sessions
CREATE POLICY "Coaches can view own sessions" ON public.coaching_sessions FOR SELECT USING (auth.uid() = coach_id);
CREATE POLICY "Students can view own sessions" ON public.coaching_sessions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all sessions" ON public.coaching_sessions FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Coaches can manage own sessions" ON public.coaching_sessions FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "Admins can manage all sessions" ON public.coaching_sessions FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Members can request sessions" ON public.coaching_sessions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS POLICIES FOR coach_availability
CREATE POLICY "Anyone authenticated can view availability" ON public.coach_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coaches can manage own availability" ON public.coach_availability FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "Admins can manage all availability" ON public.coach_availability FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR dependents
CREATE POLICY "Users can view own dependents" ON public.dependents FOR SELECT USING (auth.uid() = member_id);
CREATE POLICY "Users can manage own dependents" ON public.dependents FOR ALL USING (auth.uid() = member_id);
CREATE POLICY "Admins can manage all dependents" ON public.dependents FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can create own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR revenue_entries (Admin only)
CREATE POLICY "Admins can manage revenue entries" ON public.revenue_entries FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR expense_entries (Admin only)
CREATE POLICY "Admins can manage expense entries" ON public.expense_entries FOR ALL USING (public.is_admin(auth.uid()));

-- RLS POLICIES FOR pledges
CREATE POLICY "Users can view own pledges" ON public.pledges FOR SELECT USING (auth.uid() = member_id);
CREATE POLICY "Users can manage own pledges" ON public.pledges FOR ALL USING (auth.uid() = member_id);
CREATE POLICY "Admins can manage all pledges" ON public.pledges FOR ALL USING (public.is_admin(auth.uid()));

-- INSERT DEFAULT COURTS
INSERT INTO public.courts (name, surface, description, has_floodlights) VALUES
  ('Court 1', 'Clay', 'Professional clay court with full floodlight coverage', true),
  ('Court 2', 'Clay', 'Professional clay court with full floodlight coverage', true);