
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DetectionAlertRequest {
  location: string;
  time: string;
  action_taken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, time, action_taken }: DetectionAlertRequest = await req.json();
    
    // Format time to be more readable
    const detectionTime = new Date(time).toLocaleString();
    
    console.log("Sending detection alert email for location:", location);
    
    const emailResponse = await resend.emails.send({
      from: "Honey Badger Detection System <onboarding@resend.dev>",
      to: ["aaron.isserow@gmail.com"], // Set the recipient email
      subject: `🚨 ALERT: Honey Badger Detected at ${location}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #d32f2f; margin-bottom: 20px;">🚨 Honey Badger Detection Alert!</h1>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">A honey badger has been detected in your protected area:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Time:</strong> ${detectionTime}</p>
            <p><strong>Action Taken:</strong> ${action_taken}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Please check your Honey Badger Detection System dashboard for more information and to acknowledge this alert.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>This is an automated alert from your Honey Badger Detection System. Do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-detection-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
