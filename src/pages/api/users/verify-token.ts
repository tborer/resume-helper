import { NextApiRequest, NextApiResponse } from 'next';
// Assuming Prisma (adapt for your ORM)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    try {
      const userAccess = await prisma.userAccess.findFirst({
        where: { user: { email } }, // Assuming a relation between UserAccess and User
        select: { token: true },
      });

      if (userAccess && userAccess.token === token) {
        return res.status(200).json({ isValid: true });
      } else {
        return res.status(200).json({ isValid: false });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(500).json({ error: 'Error verifying token' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}