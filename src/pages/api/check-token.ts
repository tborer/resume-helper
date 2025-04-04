import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token query parameter is required' });
    }

    try {
      const userAccess = await prisma.userAccess.findUnique({
        where: { magicToken: token },
      });

      if (userAccess) {
        return res.status(200).json({ valid: true });
      } else {
        return res.status(200).json({ valid: false });
      }
    } catch (error) {
      console.error('Error checking token:', error);
      return res.status(500).json({ error: 'Error checking token' });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}