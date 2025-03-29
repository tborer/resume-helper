import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  url?: string;
  requestId?: string;
};

// Helper function to generate a unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Generate a unique request ID for tracking
  const requestId = generateRequestId();
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`[${requestId}] Method not allowed: ${req.method}`);
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed',
      requestId 
    });
  }

  try {
    // Log the request for troubleshooting
    console.log(`[${requestId}] Create checkout session request received`);
    
    // Get the email from the request body
    const { email } = req.body;
    
    if (!email) {
      console.log(`[${requestId}] Missing email in request body`);
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        requestId
      });
    }
    
    console.log(`[${requestId}] Creating checkout session for email: ${email}`);
    
    // In a production environment, we would create a Stripe checkout session here
    // For now, we'll use the hardcoded Stripe checkout URL
    const checkoutUrl = "https://buy.stripe.com/5kAcP0dXHgZTf3q6oy";
    
    // Add success and cancel URL parameters
    const successUrl = `${req.headers.origin}/dashboard?email=${encodeURIComponent(email)}`;
    const cancelUrl = `${req.headers.origin}`;
    
    // In a real implementation with Stripe SDK, we would do:
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{ price: process.env.STRIPE_PRODUCT_ID, quantity: 1 }],
    //   mode: 'subscription',
    //   success_url: successUrl,
    //   cancel_url: cancelUrl,
    //   customer_email: email,
    // });
    // const checkoutUrl = session.url;
    
    // For now, we'll simulate this by appending parameters to our hardcoded URL
    const finalCheckoutUrl = `${checkoutUrl}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    
    console.log(`[${requestId}] Checkout URL: ${finalCheckoutUrl}`);
    
    // Return success response with checkout URL
    return res.status(200).json({ 
      success: true,
      url: finalCheckoutUrl,
      requestId
    });
  } catch (error) {
    console.error(`[${requestId}] Error creating checkout session:`, error);
    
    // Log the error details for troubleshooting
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error creating checkout session',
      requestId
    });
  }
}