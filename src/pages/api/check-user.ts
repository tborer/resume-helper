import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // Assuming you have a prisma instance in lib/prisma.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user && user.isActive) {
        return res.status(200).json({ isActive: true });
      } else {
        return res.status(200).json({ isActive: false });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      return res.status(500).json({ error: 'Error checking user' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}