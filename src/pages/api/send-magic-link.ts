import type { NextApiRequest, NextApiResponse } from 'next';
// import Stripe from 'stripe';

/* // Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', // Use the latest API version
});
 */


type ResponseData = {
  success: boolean;
  message: string;
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
    // Log the full request for troubleshooting
    console.log(`[${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
    
    const { email } = req.body;

    if (!email) {
      console.log(`[${requestId}] Missing email in request`);
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required',
        requestId 
      });
    }

    // TEMPORARY ACCESS: Remove this block once database is connected
    // This provides temporary access for development/testing
    // DATABASE UPDATE REQUIRED: Replace with actual database check for user and subscription status
    if (email === "tray14@hotmail.com") {
      console.log(`[${requestId}] Hard-coded access granted for email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Magic link sent successfully',
        requestId
      });
    }

   /*  console.log(`[${requestId}] Checking subscription for email: ${email}`);

     // Get the product ID from environment variable
    const productId = process.env.STRIPE_PRODUCT_ID; 
    
    
    
    if (!productId) {
      console.error(`[${requestId}] STRIPE_PRODUCT_ID environment variable is not set`);
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error',
        requestId 
      });
    } */

    /* // 1. List all subscriptions
    const subscriptions = await stripe.subscriptions.list({
      limit: 100, // Adjust limit as needed
      status: 'active',
    }); */

   /*  console.log(`[${requestId}] Found ${subscriptions.data.length} active subscriptions`);
    
    // Log the Stripe API response for troubleshooting
    console.log(`[${requestId}] Stripe subscriptions response:`, JSON.stringify({

      
      count: subscriptions.data.length,
      has_more: subscriptions.has_more,
      subscription_ids: subscriptions.data.map(sub => sub.id)
    }, null, 2));

    // 2. Filter subscriptions by customer email and product ID
    let hasSubscription = false;
    
    for (const subscription of subscriptions.data) {
      if (subscription.customer) {
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        // Check if this is the customer we're looking for
        if ('email' in customer && customer.email === email) {
          console.log(`[${requestId}] Found customer with matching email: ${email}`);
          
          // Log customer details for troubleshooting (excluding sensitive data)
          console.log(`[${requestId}] Customer details:`, JSON.stringify({
            id: customer.id,
            email: customer.email,
            name: customer.name,
            created: customer.created,
            subscriptions: subscription.id
          }, null, 2));
          
          // Check if any of the subscription items match our product
          const items = await stripe.subscriptionItems.list({
            subscription: subscription.id,
          });
          
          console.log(`[${requestId}] Found ${items.data.length} subscription items for customer`);
          
          for (const item of items.data) {
            // Get the price to check its product
            const price = await stripe.prices.retrieve(item.price.id);
            
            // Log price details for troubleshooting
            console.log(`[${requestId}] Price details:`, JSON.stringify({
              price_id: item.price.id,
              product_id: price.product,
              matches_target_product: price.product === productId
            }, null, 2));
            
            if (price.product === productId) {
              console.log(`[${requestId}] Found matching product subscription for email: ${email}`);
              hasSubscription = true;
              break;
            }
          }
          
          if (hasSubscription) break;
        }
      } 
    }

    if (hasSubscription) {
      // In a real application, we would generate a secure token and send an email with a magic link
      // For this demo, we'll just simulate sending a magic link
      
      console.log(`[${requestId}] Sending magic link to: ${email}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return res.status(200).json({ 
        success: true,
        message: 'Magic link sent successfully',
        requestId
      });
    } else {
      // No matching subscription found
      console.log(`[${requestId}] No matching subscription found for email: ${email}`);
      
      return res.status(200).json({ 
        success: false,
        message: 'No active subscription found for this email',
        requestId
      });
    } */
  } catch (error) {
    console.error(`[${requestId}] Error sending magic link:`, error);
    
    // Log the error details for troubleshooting
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending magic link',
      requestId
    });
  }
}