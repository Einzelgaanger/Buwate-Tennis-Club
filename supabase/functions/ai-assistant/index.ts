import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLUB_KNOWLEDGE = `
You are the AI Assistant for Buwate Tennis Club (BTC), located in Buwate, Kampala, Uganda.

CLUB INFORMATION:
- Email: btc2023@gmail.com
- Phone: +256 772 675 050 or +256 772 367 7325
- Operating Hours: 8:00 AM - 10:00 PM daily
- Mobile Money (MoMo): 0790229161 (Brian Isubikalu)

PRICING (All in UGX):
Court Booking:
- Members: UGX 10,000/hour (standard & prime time)
- Member's Child: UGX 5,000/hour
- Member's Spouse: UGX 10,000/hour
- Non-Members: UGX 15,000/hour (standard), UGX 20,000/hour (prime time 8am-12pm & 3pm-6pm)
- Non-Member's Child: UGX 10,000-12,000/hour

Monthly Packages:
- Member Monthly: UGX 150,000
- Member Family: UGX 200,000
- Non-Member Monthly: UGX 200,000

Membership:
- Registration: UGX 100,000
- Monthly: UGX 20,000
- Annual: UGX 200,000

Coaching Rates (per session):
- Private: UGX 50,000
- Semi-Private (2): UGX 35,000
- Group (3-5): UGX 25,000
- Clinic: UGX 20,000

BOOKING RULES:
- Members can book 14 days in advance, non-members 7 days
- Minimum booking: 60 minutes, Maximum: 120 minutes
- Maximum 3 active bookings at a time
- Free cancellation up to 24 hours before
- Late cancellation: 50% fee, No-show: 100% fee

CLUB RULES:
1. No animals, pets, or toys inside the fenced court area
2. No smoking within the fenced court area
3. No vulgar language or aggressive behavior
4. Only racquets, tennis balls, and players on clay courts
5. Proper tennis attire required
6. Violations may result in suspension or ban

PAYMENT:
- All payments via Mobile Money to 0790229161 (Brian Isubikalu)
- Include transaction reference when submitting payment
- Payments are verified by admin before booking is confirmed
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userRole, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user context from auth header
    const authHeader = req.headers.get("Authorization");
    let userContext = "";
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Fetch user profile and bookings for context
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        const { data: bookings } = await supabase
          .from("bookings")
          .select("*, courts(*)")
          .eq("user_id", user.id)
          .gte("booking_date", new Date().toISOString().split("T")[0])
          .order("booking_date", { ascending: true })
          .limit(5);
          
        const { data: courts } = await supabase
          .from("courts")
          .select("*")
          .eq("status", "active");
          
        userContext = `
CURRENT USER CONTEXT:
- Name: ${profile?.full_name || "Unknown"}
- Membership: ${profile?.membership_type || "pay_as_you_play"}
- Role: ${userRole || "member"}

AVAILABLE COURTS:
${courts?.map(c => `- ${c.name} (${c.surface}, ${c.has_floodlights ? 'has floodlights' : 'no floodlights'})`).join("\n") || "No courts available"}

USER'S UPCOMING BOOKINGS:
${bookings?.length ? bookings.map(b => 
  `- ${b.booking_date} at ${b.start_time?.slice(0,5)} - ${b.end_time?.slice(0,5)} (${b.courts?.name || 'Court'}, Status: ${b.status})`
).join("\n") : "No upcoming bookings"}
`;

        // For booking actions, provide more context
        if (action === "book") {
          // Check available slots for today and next 7 days
          const { data: allBookings } = await supabase
            .from("bookings")
            .select("booking_date, start_time, end_time, court_id")
            .gte("booking_date", new Date().toISOString().split("T")[0])
            .neq("status", "cancelled");
            
          userContext += `
EXISTING BOOKINGS (for availability check):
${allBookings?.slice(0, 20).map(b => 
  `- ${b.booking_date}: ${b.start_time?.slice(0,5)}-${b.end_time?.slice(0,5)} on court ${b.court_id}`
).join("\n") || "No existing bookings"}
`;
        }
      }
    }

    let systemPrompt = `${CLUB_KNOWLEDGE}

${userContext}

You are a helpful, friendly AI assistant for BTC members. You can:
1. Answer questions about the club, pricing, rules, and policies
2. Help members understand their bookings and membership
3. Provide coaching information and recommendations
4. Assist with general tennis-related questions

When helping with bookings, suggest available times based on the user's preferences and the existing bookings shown above.

For role-specific guidance:
- Members: Help with bookings, payments, coaching requests
- Coaches: Help with session management, availability, earnings
- Admins: Help with member management, payment verification, reports

Always be polite, professional, and helpful. Use UGX for all currency amounts.
If you don't know something specific, direct them to contact the club directly.`;

    if (action === "book") {
      systemPrompt += `

BOOKING ASSISTANT MODE:
You are now helping the user book a court. Extract the following from their request:
- Preferred date (if not specified, ask)
- Preferred time (if not specified, suggest based on availability)
- Duration (default 60 minutes)
- Court preference (if any)

When you have all details, respond with a JSON block like this:
\`\`\`booking
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": 60,
  "court_preference": "any"
}
\`\`\`

Always confirm the booking details before providing the JSON block.
Check against EXISTING BOOKINGS to avoid conflicts.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
