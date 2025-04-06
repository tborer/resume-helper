import { NextApiRequest, NextApiResponse } from 'next';

// Ensure body parsing is enabled for this API route
export const config = {
  api: {
    bodyParser: true, // Changed from false to true
  },
};

async function createUser(email: string) {
  console.log('createUser called with email:', email);
  
  const createUserResponse = await fetch('/api/users/create', {
    method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
  });
  console.log("request body for createUser: ",JSON.stringify({ email }));

    const responseText = await createUserResponse.text();
    console.log("createUser API response: ",responseText);

  if (!createUserResponse.ok) {
      throw new Error(`Failed to create user: ${responseText}`);
  }

  return JSON.parse(responseText);
}

async function sendMagicLink(email: string) {
  console.log('sendMagicLink called with email:', email);

  const sendMagicLinkResponse = await fetch('/api/send-magic-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({ email }),
  });
  console.log("request body for sendMagicLink: ",JSON.stringify({ email }));

  const responseText = await sendMagicLinkResponse.text();
  console.log("sendMagicLink API response: ",responseText);

  if (!sendMagicLinkResponse.ok) {
    const errorData = await sendMagicLinkResponse.json();
    throw new Error(`Failed to send magic link: ${errorData.error}`);
  }

  return sendMagicLinkResponse.json();
}

async function fetchCustomer(customerId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable not set");
  }

  const url = `${baseUrl}/api/get-customer?id=${customerId}`;
  const response = await fetch(url);


  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch customer: ${errorData.error}`);
  }

  return response.json();
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Ensure req.body is properly parsed
      const event = req.body;

      // Add a check to ensure event is not empty or undefined
      if (!event || Object.keys(event).length === 0) {
        console.error('Empty or undefined event object:', req.body);
        return res.status(400).json({ error: 'Invalid event object' });
      }

      if (event.type === 'customer.subscription.created') { // Changed event type
        const subscription = event.data.object;
        
        const customerId = subscription.customer;

        // Fetch the customer object to get the email
        const customer = await fetchCustomer(customerId);
       
        
        
        const email = customer.email; // Extract the email from the customer object

        if (!email) {
          console.error('No email found in subscription event:', subscription);
          return res.status(400).json({ error: 'No email found in subscription event' });
        }

        console.log(`New subscription received for: ${email}`);

      // Create user
      await createUser(email);
      console.log(`User created for email: ${email}`);

      // Send magic link
      await sendMagicLink(email);
      console.log(`Magic link sent to email: ${email}`);

        return res.status(200).json({ received: true });
      }

      // Ignore other event types
      console.log('Received event type:', event.type);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: 'Error processing webhook', details: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}