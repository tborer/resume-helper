import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

const generateToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const requestId = req.headers['x-request-id'];
  //const prisma = new PrismaClient();

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a unique magic link token
    const magicLinkToken = uuidv4();
    console.log(`[${requestId}] Generated magic link token: ${magicLinkToken}`);

    // Construct the complete magic link URL
    const magicLinkUrl = `https://resume-rocket-match-ai.vercel.app/dashboard?token=${magicLinkToken}`;
    console.log(`[${requestId}] Constructed magic link URL: ${magicLinkUrl}`);

    // Store token in UserAccess table
    await prisma.userAccess.upsert({
      where: { userId: user.id },
      update: { magicLinkToken },
      create: { userId: user.id, magicLinkToken },
    });

    // Return generated token and URL
    res.json({ token: magicLinkToken, url: magicLinkUrl });
  } catch (error) {
    console.error(`[${requestId}] Error generating token: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

export default generateToken;