import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content, email } = req.body;

    if (!content || !email) {
      return res.status(400).json({ message: 'Content and email are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create feature request
    const featureRequest = await prisma.featureRequest.create({
      data: {
        content,
        userId: user.id,
      },
    });

    console.log(`Feature request created by ${email}: ${content.substring(0, 50)}...`);
    return res.status(201).json(featureRequest);
  } catch (error) {
    console.error('Error creating feature request:', error);
    return res.status(500).json({ message: 'Error creating feature request', error });
  }
}