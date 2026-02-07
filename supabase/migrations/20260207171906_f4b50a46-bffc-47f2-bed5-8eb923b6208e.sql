-- Add trigger to auto-calculate remaining_amount when pledge is inserted or updated
CREATE OR REPLACE FUNCTION public.calculate_pledge_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate remaining_amount as amount - paid_amount
  NEW.remaining_amount := COALESCE(NEW.amount, 0) - COALESCE(NEW.paid_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS calculate_pledge_remaining_trigger ON public.pledges;

-- Create trigger for insert and update
CREATE TRIGGER calculate_pledge_remaining_trigger
BEFORE INSERT OR UPDATE ON public.pledges
FOR EACH ROW
EXECUTE FUNCTION public.calculate_pledge_remaining();