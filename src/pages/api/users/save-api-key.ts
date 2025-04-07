import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, apiKey } = req.body;

  if (!email || !apiKey) {
    return res.status(400).json({ success: false, message: 'Email and API key are required' });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { geminiApiKey: apiKey },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'API key saved successfully' });
  } catch (error) {
    console.error('Error saving API key:', error);
    return res.status(500).json({ success: false, message: 'Error saving API key' });
  }
}