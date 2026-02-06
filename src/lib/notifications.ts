import { supabase } from '@/integrations/supabase/client';

interface NotificationData {
  type: 'booking_created' | 'booking_cancelled' | 'payment_submitted' | 'payment_verified' | 'new_member' | 'coach_application';
  data: Record<string, any>;
}

export async function sendAdminNotification(notification: NotificationData): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(notification),
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    // Don't throw - notifications are non-critical
  }
}
