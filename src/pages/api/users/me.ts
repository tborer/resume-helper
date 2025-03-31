import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // In a real application, you'd use a more secure way to identify the user (e.g., session management, JWT)
      // For this example, we'll extract the email from a query parameter, simulating what would be
      // available from the client-side localStorage.  **THIS IS NOT SECURE FOR PRODUCTION**
      const email = req.query.email as string;  // Assuming email is passed as a query parameter

      if (!email) {
        return res.status(400).json({ error: 'Email not provided' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ isAdmin: user.isAdmin });
    } catch (error) {
      console.error('Error verifying admin status:', error);
      return res.status(500).json({ error: 'Error verifying admin status' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
