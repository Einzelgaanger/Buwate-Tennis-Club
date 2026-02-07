-- remaining_amount is a GENERATED ALWAYS column, so we must not write to it.
-- Remove the previously added trigger/function that attempted to set it.

DROP TRIGGER IF EXISTS calculate_pledge_remaining_trigger ON public.pledges;
DROP FUNCTION IF EXISTS public.calculate_pledge_remaining();