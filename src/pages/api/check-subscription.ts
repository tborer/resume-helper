import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', // Use the latest API version
});

type ResponseData = {
  hasSubscription: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ hasSubscription: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ hasSubscription: false, message: 'Email is required' });
    }

    console.log(`Checking subscription for email: ${email}`);

    // Get the product ID from environment variable
    const productId = process.env.STRIPE_PRODUCT_ID;
    
    if (!productId) {
      console.error('STRIPE_PRODUCT_ID environment variable is not set');
      return res.status(500).json({ hasSubscription: false, message: 'Server configuration error' });
    }

    // 1. List all subscriptions
    const subscriptions = await stripe.subscriptions.list({
      limit: 100, // Adjust limit as needed
      status: 'active',
    });

    console.log(`Found ${subscriptions.data.length} active subscriptions`);

    // 2. Filter subscriptions by customer email and product ID
    for (const subscription of subscriptions.data) {
      if (subscription.customer) {
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        // Check if this is the customer we're looking for
        if ('email' in customer && customer.email === email) {
          console.log(`Found customer with matching email: ${email}`);
          
          // Check if any of the subscription items match our product
          const items = await stripe.subscriptionItems.list({
            subscription: subscription.id,
          });
          
          for (const item of items.data) {
            // Get the price to check its product
            const price = await stripe.prices.retrieve(item.price.id);
            
            if (price.product === productId) {
              console.log(`Found matching product subscription for email: ${email}`);
              return res.status(200).json({ hasSubscription: true });
            }
          }
        }
      }
    }

    // No matching subscription found
    console.log(`No matching subscription found for email: ${email}`);
    return res.status(200).json({ hasSubscription: false });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return res.status(500).json({ 
      hasSubscription: false, 
      message: 'Error checking subscription status' 
    });
  }
}