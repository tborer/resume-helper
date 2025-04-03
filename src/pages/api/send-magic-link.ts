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

    // TEMPORARY ACCESS: Remove this block once database is connected
    // This provides temporary access for development/testing
    // DATABASE UPDATE REQUIRED: Replace with actual database check for user and subscription status
    if (email === "tray14@hotmail.com") {
      console.log(`[${requestId}] Hard-coded access granted for email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Magic link sent successfully',
        requestId
      });
    }

    // Generate a unique magic link token
    const magicLinkToken = uuidv4(); // Using uuid for token generation
    console.log(`[${requestId}] Generated magic link token: ${magicLinkToken}`);
    
    // Construct the complete magic link URL using the production domain
    const magicLinkUrl = `https://resume-rocket-match-ai.vercel.app/dashboard?token=${magicLinkToken}`;
    console.log(`[${requestId}] Constructed magic link URL: ${magicLinkUrl}`);

    // Configure Nodemailer transporter
    console.log(`[${requestId}] Creating Nodemailer transporter...`);
    const transporter = nodemailer.createTransport({
      host: 'mail.agilerant.info',
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    }, {logger: true});

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
      } else {
        console.log(`[${requestId}] Email sent successfully!`);
        console.log(`[${requestId}] Full info object:`, info);
        console.log(`[${requestId}] Email response:`, info.response);
        }
    });

    /*
    // Construct mail options
      console.log(`[${requestId}] Sending magic link to: ${email}`);
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
*/

//moving this above
/*
    // Generate a unique magic link token
    const magicLinkToken = uuidv4(); // Using uuid for token generation
    console.log(`[${requestId}] Generated magic link token: ${magicLinkToken}`);

    // Construct the complete magic link URL using the production domain
    const magicLinkUrl = `https://resume-rocket-match-ai.vercel.app/dashboard?token=${magicLinkToken}`;
    console.log(`[${requestId}] Constructed magic link URL: ${magicLinkUrl}`);
    */  

    return res.status(200).json({
      success: true,
      message: 'Magic link email sent successfully',
      requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] Error sending magic link:`, error);
    
    // Log the error details for troubleshooting
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