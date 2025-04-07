import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request to thisUser API');
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);

  if (req.method !== 'GET') {
    console.log('Method not allowed');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;
  console.log('email:', email);

  if (!email || typeof email !== 'string') {
    console.log('Email is required');
    return res.status(400).json({ message: 'Email is required' });
  }

  const decodedEmail = decodeURIComponent(email);
  console.log('Decoded email:', decodedEmail);

  try {
    console.log('Searching for user with email:', decodedEmail);
    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
    });
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Retrieved user with email ${decodedEmail}`);
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user', error });
  }
}