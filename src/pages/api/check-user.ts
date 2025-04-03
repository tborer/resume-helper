import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

const checkUser = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data or success message
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ error: 'Error checking user' });
  }
};

export default checkUser;