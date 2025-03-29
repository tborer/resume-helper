import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const featureRequests = await prisma.featureRequest.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Retrieved ${featureRequests.length} feature requests`);
    return res.status(200).json(featureRequests);
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    return res.status(500).json({ message: 'Error fetching feature requests', error });
  }
}