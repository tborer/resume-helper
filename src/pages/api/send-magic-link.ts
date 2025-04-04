import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

type ResponseData = {
  success: boolean;
  message: string;
  requestId?: string;
};

// Helper function to generate a unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Generate a unique request ID for tracking
  const requestId = generateRequestId();
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`[${requestId}] Method not allowed: ${req.method}`);
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed',
      requestId 
    });
  }

  try {
    // Log the full request for troubleshooting
    console.log(`[${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
    
    const { email } = req.body;

    if (!email) {
      console.log(`[${requestId}] Missing email in request`);
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required',
        requestId 
      });
    }

    // Generate a unique magic link token
    const magicLinkToken = uuidv4(); // Using uuid for token generation
    console.log(`[${requestId}] Generated magic link token: ${magicLinkToken}`);
    
    // Construct the complete magic link URL using the production domain
    const magicLinkUrl = `https://resume-rocket-match-ai.vercel.app/dashboard?token=${magicLinkToken}`;
    console.log(`[${requestId}] Constructed magic link URL: ${magicLinkUrl}`);

    console.log(`[${requestId}] Creating Nodemailer transporter...`);
    const transporter = nodemailer.createTransport({
      host: 'mail.agilerant.info',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: '$Nov2022',
      },
      debug: true, // Enable debug mode
    }, {logger: true});

    console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
    
    // Verify Nodemailer authentication
    transporter.verify((error, success) => {
      if (error) {
        console.error(`[${requestId}] Nodemailer authentication error:`, error);
      } else {
        console.log(`[${requestId}] Nodemailer authentication successful`);
      }
    });

    // Add event listeners for more logging
    transporter.on('idle', () => {
      console.log(`[${requestId}] Nodemailer transporter idle`);
    });

    transporter.on('ready', () => {
      console.log(`[${requestId}] Nodemailer transporter ready`);
    });

    transporter.on('error', (err) => {
      console.error(`[${requestId}] Nodemailer transporter error:`, err);
    });

    // Construct mail options
    const mailOptions = {
      from: 'ar@agilerant.info',
      to: email,
      subject: 'Here is your ResumeRocketMatchAI magic link!',
      html: `<p>Hello,</p><p>Here is the magic link you have requested:</p><p><a href="${magicLinkUrl}">${magicLinkUrl}</a></p><p>Best regards,<br/>ResumeRocketMatchAI</p>`,
    };
    
    // Send email
    console.log(`[${requestId}] Sending email with options:`, mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`[${requestId}] Error sending email:`, error);
        const errorDetails = error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error;
        console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
        return res.status(500).json({
          success: false,
          message: 'Error sending magic link',
          requestId,
        });
      } else {
        console.log(`[${requestId}] Email sent successfully!`);
        console.log(`[${requestId}] Full info object:`, info);
        console.log(`[${requestId}] Email response:`, info.response);
        return res.status(200).json({
          success: true,
          message: 'Magic link email sent successfully',
          requestId,
        });
      }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Error sending magic link:`, error);
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending magic link',
      requestId
    });
  }
}