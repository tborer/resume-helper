import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, isAdmin = false } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        isAdmin: Boolean(isAdmin),
        isActive: true,
        historyAccess: true,
        accountAccess: true,
      },
    });

    console.log(`User created: ${email}, isAdmin: ${isAdmin}`);
    return res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error creating user', error });
  }
}