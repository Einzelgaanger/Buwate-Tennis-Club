-- Create campaigns table for fundraising activities
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount INTEGER NOT NULL DEFAULT 0,
  raised_amount INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active campaigns
CREATE POLICY "Anyone can view active campaigns"
ON public.campaigns FOR SELECT
USING (true);

-- Only admins can manage campaigns
CREATE POLICY "Admins can manage campaigns"
ON public.campaigns FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add campaign_id to pledges table to link pledges to campaigns
ALTER TABLE public.pledges ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;