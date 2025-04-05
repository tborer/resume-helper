import { NextApiRequest, NextApiResponse } from 'next';

// Ensure body parsing is enabled for this API route
export const config = {
  api: {
    bodyParser: true, // Changed from false to true
  },
};

async function createUser(email: string) {
  const createUserResponse = await fetch('/api/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!createUserResponse.ok) {
    const errorData = await createUserResponse.json();
    throw new Error(`Failed to create user: ${errorData.error}`);
  }

  return createUserResponse.json();
}

async function sendMagicLink(email: string) {
  const sendMagicLinkResponse = await fetch('/api/send-magic-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!sendMagicLinkResponse.ok) {
    const errorData = await sendMagicLinkResponse.json();
    throw new Error(`Failed to send magic link: ${errorData.error}`);
  }

  return sendMagicLinkResponse.json();
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

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const email = session.customer_details?.email;

        if (!email) {
          console.error('No email found in checkout session:', session);
          return res.status(400).json({ error: 'No email found in checkout session' });
        }

        console.log(`Checkout session completed for email: ${email}`);

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