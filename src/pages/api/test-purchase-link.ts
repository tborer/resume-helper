import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  purchaseLink?: string;
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
    console.log(`[${requestId}] Test purchase link request received`);
    
    // Get the purchase link from environment or use the hardcoded one
    const purchaseLink = "https://buy.stripe.com/5kAcP0dXHgZTf3q6oy";
    
    console.log(`[${requestId}] Purchase link: ${purchaseLink}`);
    
    // Return success response with request ID
    return res.status(200).json({ 
      success: true,
      purchaseLink,
      requestId
    });
  } catch (error) {
    console.error(`[${requestId}] Error testing purchase link:`, error);
    
    // Log the error details for troubleshooting
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    console.error(`[${requestId}] Error details:`, JSON.stringify(errorDetails, null, 2));
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error testing purchase link',
      requestId
    });
  }
}