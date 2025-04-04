import { NextApiRequest, NextApiResponse } from 'next';
// Assuming you are using prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { isAdmin: true }, // only grab the isAdmin column
      });

      if (user) {
        return res.status(200).json({ isAdmin: user.isAdmin });
      } else {
        return res.status(200).json({ isAdmin: false }); // User not found, not an admin
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      return res.status(500).json({ error: 'Error checking admin status' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}