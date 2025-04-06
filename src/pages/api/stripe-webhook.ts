import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// Ensure body parsing is enabled for this API route
export const config = {
  api: {
    bodyParser: true, 
  },
};

async function fetchCustomer(customerId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable not set");
  }

  const url = `${baseUrl}/api/get-customer?id=${customerId}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch customer: ${errorData.error}`);
  }

  return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Ensure req.body is properly parsed
      const event = req.body;

      // Add a check to ensure event is not empty or undefined
      if (!event || Object.keys(event).length === 0) {
        console.error('Empty or undefined event object:', req.body);
        return res.status(400).json({ error: 'Invalid event object' });
      }

      if (event.type === 'customer.subscription.created') { 
        const subscription = event.data.object;
        
        const customerId = subscription.customer;

        // Fetch the customer object to get the email
        const customer = await fetchCustomer(customerId);
       
        const email = customer.email; 

        if (!email) {
          console.error('No email found in subscription event:', subscription);
          return res.status(400).json({ error: 'No email found in subscription event' });
        }

        console.log(`New subscription received for: ${email}`);

        // Create user
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
        
        if (existingUser) {
          console.log('User with this email already exists');
        } else {
          const user = await prisma.user.create({
            data: {
              email,
              isAdmin: false,
              isActive: true,
              historyAccess: false,
              accountAccess: true,
            },
          });
        
          console.log(`User created from subscription: ${email}`);
        }

        // Send magic link
        const magicLinkToken = uuidv4();
        const magicLinkUrl = `https://resume-rocket-match-ai.vercel.app/dashboard?email=${encodeURIComponent(email)}&token=${magicLinkToken}`;

        //finds user and saves the magic link
        prisma.user.findUnique({
          where: {
            email: email,
          },
        })
          .then((user) => {
            if (user) {
              prisma.userAccess.upsert({
                where: {
                  userId: user.id,
                },
                create: {
                  userId: user.id,
                  magicLinkToken: magicLinkToken,
                },
                update: {
                  magicLinkToken: magicLinkToken,
                },
              })
                .then((result) => {
                  console.log('UserAccess record upserted:', result);
                })
                .catch((error) => {
                  console.error('Error upserting UserAccess record:', error);
                });
            } else {
              console.log('User not found with email:', email);
            }
          })
          .catch((error) => {
            console.error('Error finding user:', error);
          });

        const transporter = nodemailer.createTransport({
          host: 'mail.agilerant.info',
          port: 465,
          secure: true, 
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: 'ar@agilerant.info',
          to: email,
          subject: 'Here is your ResumeRocketMatchAI magic link!',
          html: `<p>Hello,</p><p>Here is the magic link you have requested:</p><p><a href="${magicLinkUrl}">${magicLinkUrl}</a></p><p>Best regards,<br/>ResumeRocketMatchAI</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent successfully!');
          }
        });
        console.log('Send magic link logic goes here');

        return res.status(200).json({ received: true });
      }

      // Ignore other event types
      console.log('Received event type:', event.type);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: 'Error processing webhook', details: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}