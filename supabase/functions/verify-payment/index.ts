import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Supabase Edge Function: verify-payment
 * Verifies Razorpay payment signature and updates registration in database
 * 
 * Expected request body:
 * {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   formData: {
 *     name: string,
 *     email: string,
 *     phone: string,
 *     customAnswers?: Record<string, string>
 *   }
 * }
 */
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Razorpay secret key for signature verification
    const key_secret = Deno.env.get("RAZORPAY_SECRET");

    if (!key_secret) {
      console.error("Missing Razorpay secret key");
      return new Response(
        JSON.stringify({ error: "Payment verification configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse request body
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing payment verification details" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Verifying payment: Order=${razorpay_order_id}, Payment=${razorpay_payment_id}`);

    // Create the signature verification string
    // Format: order_id|payment_id
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Generate HMAC SHA256 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key_secret);
    const messageData = encoder.encode(signaturePayload);

    // Import the key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Generate signature
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageData
    );

    // Convert signature to hex string
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare signatures (case-insensitive)
    const isValid = generatedSignature.toLowerCase() === razorpay_signature.toLowerCase();

    console.log(`Signature verification result: ${isValid ? 'SUCCESS' : 'FAILED'}`);

    if (!isValid) {
      console.error("Invalid payment signature");
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: "Payment signature verification failed" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update event_registrations table with payment details
    // Note: The registration should already exist, so we update it with payment info
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({
        payment_status: 'success',
        payment_provider: 'razorpay',
        payment_order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        payment_signature: razorpay_signature,
      })
      .eq('payment_order_id', razorpay_order_id);

    if (updateError) {
      console.error("Database update error:", updateError);
      // Payment is verified but database update failed
      // This should be logged for manual reconciliation
      return new Response(
        JSON.stringify({ 
          verified: true, 
          warning: "Payment verified but registration update failed",
          razorpay_order_id,
          razorpay_payment_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Payment verification and database update successful");

    // Return success response
    return new Response(
      JSON.stringify({ 
        verified: true,
        razorpay_order_id,
        razorpay_payment_id,
        message: "Payment verified successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in verify-payment function:", error);
    return new Response(
      JSON.stringify({ 
        verified: false,
        error: "Internal server error during payment verification",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
