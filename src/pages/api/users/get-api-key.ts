import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { geminiApiKey: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const apiKey = user.geminiApiKey || process.env.MASTER_API_KEY;

    console.log(`API key retrieved for user: ${email}`);
    return res.status(200).json({ success: true, apiKey });
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving API key' });
  }
}