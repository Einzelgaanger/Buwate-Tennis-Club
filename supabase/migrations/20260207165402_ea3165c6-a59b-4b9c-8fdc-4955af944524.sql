-- Add partial payment tracking columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS balance_amount INTEGER DEFAULT 0;

-- Add partial payment columns to coaching_sessions
ALTER TABLE public.coaching_sessions ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0;
ALTER TABLE public.coaching_sessions ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0;
ALTER TABLE public.coaching_sessions ADD COLUMN IF NOT EXISTS balance_amount INTEGER DEFAULT 0;

-- Update payment status to include 'partial' option
-- First check if partial already exists in the enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partial' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_status')) THEN
    ALTER TYPE public.payment_status ADD VALUE 'partial';
  END IF;
END
$$;