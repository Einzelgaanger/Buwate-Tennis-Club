import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: 'booking_created' | 'booking_cancelled' | 'payment_submitted' | 'payment_verified' | 'new_member' | 'coach_application';
  data: Record<string, any>;
}

const CLUB_INFO = {
  name: "Buwate Tennis Club",
  email: "btc2023@gmail.com",
  phone: "+256 772 675 050",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.log("RESEND_API_KEY not configured, skipping email notification");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendKey);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, data }: NotificationPayload = await req.json();

    // Get admin emails that have notifications enabled for this type
    const notificationColumn = {
      'booking_created': 'notify_bookings',
      'booking_cancelled': 'notify_cancellations',
      'payment_submitted': 'notify_payments',
      'payment_verified': 'notify_payments',
      'new_member': 'notify_new_members',
      'coach_application': 'notify_coach_applications',
    }[type];

    const { data: admins } = await supabase
      .from('admin_notifications')
      .select('email')
      .eq(notificationColumn, true);

    if (!admins || admins.length === 0) {
      console.log("No admins to notify for type:", type);
      return new Response(JSON.stringify({ success: true, noRecipients: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminEmails = admins.map(a => a.email);

    // Build email content based on type
    let subject = "";
    let htmlContent = "";

    switch (type) {
      case 'booking_created':
        subject = `New Court Booking - ${data.memberName}`;
        htmlContent = `
          <h2>New Court Booking</h2>
          <p><strong>Member:</strong> ${data.memberName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Court:</strong> ${data.courtName}</p>
          <p><strong>Amount:</strong> UGX ${data.amount?.toLocaleString()}</p>
          <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from ${CLUB_INFO.name}</p>
        `;
        break;

      case 'booking_cancelled':
        subject = `Booking Cancelled - ${data.memberName}`;
        htmlContent = `
          <h2>Booking Cancelled</h2>
          <p><strong>Member:</strong> ${data.memberName}</p>
          <p><strong>Original Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Court:</strong> ${data.courtName}</p>
          <p><strong>Reason:</strong> ${data.reason || 'Not provided'}</p>
          <p><strong>Cancelled At:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from ${CLUB_INFO.name}</p>
        `;
        break;

      case 'payment_submitted':
        subject = `Payment Submitted - ${data.memberName}`;
        htmlContent = `
          <h2>Payment Pending Verification</h2>
          <p><strong>Member:</strong> ${data.memberName}</p>
          <p><strong>Amount:</strong> UGX ${data.amount?.toLocaleString()}</p>
          <p><strong>Transaction Reference:</strong> ${data.transactionRef}</p>
          <p><strong>Description:</strong> ${data.description}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #e67e22;"><strong>Action Required:</strong> Please verify this payment in the admin dashboard.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from ${CLUB_INFO.name}</p>
        `;
        break;

      case 'payment_verified':
        subject = `Payment Verified - ${data.memberName}`;
        htmlContent = `
          <h2>Payment Verified</h2>
          <p><strong>Member:</strong> ${data.memberName}</p>
          <p><strong>Amount:</strong> UGX ${data.amount?.toLocaleString()}</p>
          <p><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
          <p><strong>Verified By:</strong> ${data.verifiedBy}</p>
          <p><strong>Verified At:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from ${CLUB_INFO.name}</p>
        `;
        break;

      case 'new_member':
        subject = `New Member Registration - ${data.memberName}`;
        htmlContent = `
          <h2>New Member Registered</h2>
          <p><strong>Name:</strong> ${data.memberName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong>Membership Type:</strong> ${data.membershipType}</p>
          <p><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from ${CLUB_INFO.name}</p>
        `;
        break;

      case 'coach_application':
        subject = `New Coach Application - ${data.coachName}`;
        htmlContent = `
          <h2>New Coach Application</h2>
          <p><strong>Name:</strong> ${data.coachName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong>Experience:</strong> ${data.yearsExperience || 'Not specified'} years</p>
          <p><strong>Specialties:</strong> ${data.specialties?.join(', ') || 'Not specified'}</p>
          <p><strong>Bio:</strong> ${data.bio || 'Not provided'}</p>
          <p style="color: #e67e22;"><strong>Action Required:</strong> Please review and approve/reject this application in the admin dashboard.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from ${CLUB_INFO.name}</p>
        `;
        break;
    }

    // Send email to all admins
    // Note: Update the email domain after verifying your domain in Resend
    const emailResponse = await resend.emails.send({
      from: `${CLUB_INFO.name} <noreply@buwatetc.onrender.com>`,
      to: adminEmails,
      subject: `[BTC] ${subject}`,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
