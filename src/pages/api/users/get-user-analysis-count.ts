// pages/api/users/get-user-analysis-count.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userAccess = await prisma.userAccess.findUnique({
      where: { userId: user.id },
    });
    
    if (!userAccess) {
      return res.status(404).json({ message: 'User access not found' });
    }
    
    return res.status(200).json({ dailyAnalysisCount: userAccess.dailyAnalysisCount });
  } catch (error) {
    console.error('Error getting dailyAnalysisCount:', error);
    return res.status(500).json({ message: 'Error getting dailyAnalysisCount' });
  }
}