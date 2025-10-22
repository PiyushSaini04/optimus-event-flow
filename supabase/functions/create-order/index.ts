import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Supabase Edge Function: create-order
 * Creates a Razorpay order for event registration payments
 * 
 * Expected request body:
 * {
 *   amount: number,      // Amount in INR (will be converted to paise)
 *   currency?: string,   // Default: 'INR'
 *   receipt?: string     // Optional receipt ID
 * }
 */
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Razorpay credentials from environment variables
    const key_id = Deno.env.get("RAZORPAY_KEY_ID");
    const key_secret = Deno.env.get("RAZORPAY_SECRET");

    // Validate that credentials are available
    if (!key_id || !key_secret) {
      console.error("Missing Razorpay credentials");
      return new Response(
        JSON.stringify({ 
          error: "Payment gateway configuration error. Please contact support." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse request body
    const { amount, currency = 'INR', receipt } = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Amount must be greater than 0." }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount);

    // Generate a unique receipt ID if not provided
    const receiptId = receipt || `receipt_${Date.now()}`;

    console.log(`Creating Razorpay order: Amount=${amountInPaise} paise, Currency=${currency}, Receipt=${receiptId}`);

    // Prepare order data for Razorpay API
    const orderData = {
      amount: amountInPaise,
      currency: currency,
      receipt: receiptId,
    };

    // Create Basic Auth header for Razorpay API
    const authHeader = `Basic ${btoa(`${key_id}:${key_secret}`)}`;

    // Call Razorpay Orders API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(orderData),
    });

    // Parse Razorpay response
    const razorpayData = await razorpayResponse.json();

    // Check if order creation was successful
    if (!razorpayResponse.ok) {
      console.error("Razorpay API error:", razorpayData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create payment order",
          details: razorpayData.error?.description || "Unknown error"
        }),
        { 
          status: razorpayResponse.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Order created successfully:", razorpayData.id);

    // Return order details to frontend
    return new Response(
      JSON.stringify({
        order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        status: razorpayData.status,
        receipt: razorpayData.receipt,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in create-order function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
