import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    try {
      const customer = await stripe.customers.retrieve(id);
      res.status(200).json(customer);
    } catch (error: any) {
      console.error('Error retrieving customer:', error);
      res.status(500).json({ error: 'Failed to retrieve customer' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}