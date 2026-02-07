import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: 'booking_created' | 'booking_cancelled' | 'payment_submitted' | 'payment_verified' | 'payment_rejected' | 'new_member' | 'coach_application' | 'pledge_created' | 'session_request';
  data: Record<string, any>;
}

const CLUB_INFO = {
  name: "Buwate Tennis Club",
  shortName: "BTC",
  email: "btc2023@gmail.com",
  phone: "+256 772 675 050",
  logoUrl: "https://hzrhzwctroddoudjiusd.supabase.co/storage/v1/object/public/avatars/logo.png",
};

// Beautiful email template wrapper
const emailTemplate = (content: string, title: string, actionRequired: boolean = false) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #047857 0%, #065f46 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🎾 ${CLUB_INFO.name}
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                Admin Notification
              </p>
            </td>
          </tr>
          
          ${actionRequired ? `
          <!-- Action Required Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 12px 40px;">
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600; text-align: center;">
                ⚡ ACTION REQUIRED
              </p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Title -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <h2 style="margin: 0; color: #1e293b; font-size: 22px; font-weight: 700;">
                ${title}
              </h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="https://buwatetennis.lovable.app/admin" style="display: inline-block; background: linear-gradient(135deg, #047857 0%, #065f46 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Open Admin Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #e2e8f0;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                This is an automated notification from ${CLUB_INFO.name}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                ${CLUB_INFO.email} • ${CLUB_INFO.phone}
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Bottom text -->
        <p style="margin-top: 24px; color: #94a3b8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} ${CLUB_INFO.name}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Info row component for consistent styling
const infoRow = (label: string, value: string, highlight: boolean = false) => `
<tr>
  <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px; width: 140px;">
    ${label}
  </td>
  <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: ${highlight ? '#047857' : '#1e293b'}; font-size: 14px; font-weight: ${highlight ? '700' : '500'};">
    ${value}
  </td>
</tr>
`;

// Amount display with formatting
const formatAmount = (amount: number) => `UGX ${amount?.toLocaleString() || '0'}`;

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
    const notificationColumn: Record<string, string> = {
      'booking_created': 'notify_bookings',
      'booking_cancelled': 'notify_cancellations',
      'payment_submitted': 'notify_payments',
      'payment_verified': 'notify_payments',
      'payment_rejected': 'notify_payments',
      'new_member': 'notify_new_members',
      'coach_application': 'notify_coach_applications',
      'pledge_created': 'notify_payments',
      'session_request': 'notify_bookings',
    };

    const { data: admins } = await supabase
      .from('admin_notifications')
      .select('email')
      .eq(notificationColumn[type] || 'notify_bookings', true);

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
    let title = "";
    let contentHtml = "";
    let actionRequired = false;

    switch (type) {
      case 'booking_created':
        subject = `New Court Booking - ${data.memberName}`;
        title = "New Court Booking";
        contentHtml = `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Member', data.memberName)}
            ${infoRow('Date', data.date)}
            ${infoRow('Time', `${data.startTime} - ${data.endTime}`)}
            ${infoRow('Court', data.courtName)}
            ${infoRow('Amount', formatAmount(data.amount), true)}
            ${infoRow('Payment Status', data.paymentStatus === 'unpaid' ? '⏳ Unpaid' : '✅ Paid')}
            ${data.notes ? infoRow('Notes', data.notes) : ''}
          </table>
        `;
        break;

      case 'booking_cancelled':
        subject = `Booking Cancelled - ${data.memberName}`;
        title = "Booking Cancelled";
        contentHtml = `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #dc2626; font-weight: 600;">A booking has been cancelled</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Member', data.memberName)}
            ${infoRow('Original Date', data.date)}
            ${infoRow('Time', `${data.startTime} - ${data.endTime}`)}
            ${infoRow('Court', data.courtName)}
            ${infoRow('Reason', data.reason || 'Not provided')}
            ${infoRow('Cancelled At', new Date().toLocaleString())}
          </table>
        `;
        break;

      case 'payment_submitted':
        subject = `💰 Payment Submitted - ${data.memberName}`;
        title = "Payment Pending Verification";
        actionRequired = true;
        contentHtml = `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #b45309; font-weight: 600;">Please verify this payment in the admin dashboard</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Member', data.memberName)}
            ${infoRow('Amount Paid', formatAmount(data.amount), true)}
            ${infoRow('Transaction Ref', `<code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.transactionRef}</code>`)}
            ${infoRow('Description', data.description)}
            ${data.isPartialPayment ? infoRow('Payment Type', '⚡ Partial Payment') : ''}
            ${data.totalAmount && data.isPartialPayment ? infoRow('Total Due', formatAmount(data.totalAmount)) : ''}
            ${data.paidSoFar && data.isPartialPayment ? infoRow('Paid So Far', formatAmount(data.paidSoFar)) : ''}
            ${data.remainingAfter !== undefined && data.isPartialPayment ? infoRow('Remaining', formatAmount(data.remainingAfter)) : ''}
            ${infoRow('Submitted', new Date().toLocaleString())}
          </table>
        `;
        break;

      case 'payment_verified':
        subject = `✅ Payment Verified - ${data.memberName}`;
        title = "Payment Verified Successfully";
        contentHtml = `
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #059669; font-weight: 600;">Payment has been verified and recorded</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Member', data.memberName)}
            ${infoRow('Amount', formatAmount(data.amount), true)}
            ${infoRow('Receipt Number', `<code style="background: #d1fae5; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #059669;">${data.receiptNumber}</code>`)}
            ${infoRow('Verified By', data.verifiedBy)}
            ${infoRow('Verified At', new Date().toLocaleString())}
          </table>
        `;
        break;

      case 'payment_rejected':
        subject = `❌ Payment Rejected - ${data.memberName}`;
        title = "Payment Rejected";
        contentHtml = `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #dc2626; font-weight: 600;">Payment was rejected</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Member', data.memberName)}
            ${infoRow('Amount', formatAmount(data.amount))}
            ${infoRow('Transaction Ref', data.transactionRef)}
            ${infoRow('Reason', data.rejectionReason || 'Not specified')}
            ${infoRow('Rejected By', data.rejectedBy)}
          </table>
        `;
        break;

      case 'new_member':
        subject = `👋 New Member Registration - ${data.memberName}`;
        title = "New Member Registered";
        contentHtml = `
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #1d4ed8; font-weight: 600;">A new member has joined the club!</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Name', data.memberName)}
            ${infoRow('Email', data.email)}
            ${infoRow('Phone', data.phone || 'Not provided')}
            ${infoRow('Membership Type', data.membershipType?.replace('_', ' ') || 'Pay as you play')}
            ${infoRow('Registered', new Date().toLocaleString())}
          </table>
        `;
        break;

      case 'coach_application':
        subject = `🎓 New Coach Application - ${data.coachName}`;
        title = "New Coach Application";
        actionRequired = true;
        contentHtml = `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #b45309; font-weight: 600;">Please review and approve/reject this application</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Name', data.coachName)}
            ${infoRow('Email', data.email)}
            ${infoRow('Phone', data.phone || 'Not provided')}
            ${infoRow('Experience', `${data.yearsExperience || 0} years`)}
            ${infoRow('Specialties', data.specialties?.join(', ') || 'Not specified')}
          </table>
          ${data.bio ? `
          <div style="margin-top: 16px; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Bio</p>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${data.bio}</p>
          </div>
          ` : ''}
        `;
        break;

      case 'pledge_created':
        subject = `💝 New Pledge - ${data.memberName}`;
        title = "New Campaign Pledge";
        contentHtml = `
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Member', data.memberName)}
            ${infoRow('Campaign', data.campaignTitle)}
            ${infoRow('Pledge Amount', formatAmount(data.amount), true)}
            ${infoRow('Type', data.payNow ? '💵 Paying Now' : '📝 Pledge for Later')}
            ${infoRow('Pledged At', new Date().toLocaleString())}
          </table>
        `;
        break;

      case 'session_request':
        subject = `📅 New Coaching Session Request`;
        title = "Coaching Session Request";
        actionRequired = true;
        contentHtml = `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #b45309; font-weight: 600;">A member has requested a coaching session</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            ${infoRow('Student', data.studentName)}
            ${infoRow('Coach', data.coachName)}
            ${infoRow('Date', data.date)}
            ${infoRow('Time', `${data.startTime} - ${data.endTime}`)}
            ${infoRow('Session Type', data.sessionType || 'Private')}
            ${infoRow('Amount', formatAmount(data.amount), true)}
          </table>
        `;
        break;

      default:
        console.log("Unknown notification type:", type);
        return new Response(JSON.stringify({ success: false, error: "Unknown type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const htmlContent = emailTemplate(contentHtml, title, actionRequired);

    // Send email to all admins
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
