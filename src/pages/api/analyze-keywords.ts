import type { NextApiRequest, NextApiResponse } from 'next';
import { queryGeminiAPI } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

type ResponseData = {
  keywords?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobDescription, userEmail } = req.body;

  // Validate inputs
  if (!jobDescription) {
    return res.status(400).json({ error: 'Job description is required' });
  }
  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required' });
  }

  let apiKey: string | null = null;
  let isMasterKey = false;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { geminiApiKey: true },
    });

    if (user) {
      apiKey = user.geminiApiKey;
    }

    if (!apiKey) {
      apiKey = process.env.MASTER_API_KEY || null;
      isMasterKey = true;
    }

    // If using master key, check usage limits
    if (isMasterKey && userEmail) {

      console.log(`User ${userEmail} is using the master API key for analyze-keywords`);
    }

    // Create the prompt as specified by the user
    const prompt = `Ignore all previous instructions. Clear your memory. Please analyze the following job description and identify the top 10 most relevant keywords and phrases. Consider both the frequency of terms and the contextual importance of concepts within the description. Prioritize terms that accurately reflect the core responsibilities, required skills, and overall focus of the role. Only extract keywords that are explicitly mentioned in the job description.

[JOB DESCRIPTION HERE]
${jobDescription}

Output the top 10 keywords/phrases in a clear, numbered list.`;

    // Call the Gemini API
    const response = await queryGeminiAPI(apiKey, prompt);

    if (!apiKey) {
         console.error('No API key found for user and MASTER_API_KEY not set.');
            return res.status(500).json({ error: 'Internal server error' });
        }

    if (response.error) {
      console.error('Error from Gemini API:', response.error);
      return res.status(500).json({ error: response.error });
    }

    // Parse the response to extract the keywords
    // The response should be a numbered list, so we'll extract each line
    const keywordsList = response.text
      .split('\n')
      .filter(line => /^\d+\./.test(line)) // Filter lines that start with a number and period
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove the numbering
      .filter(keyword => keyword.length > 0); // Filter out empty lines

    // If we couldn't parse any keywords, return the raw text
    if (keywordsList.length === 0) {
      // Try to extract keywords using a different approach
      const keywords = response.text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 10); // Take up to 10 lines

      return res.status(200).json({ keywords });
    }

    // Return the keywords
    return res.status(200).json({ keywords: keywordsList });
  } catch (error) {
    if (error instanceof Error) {
            console.error('Error querying the database:', error.message);
            return res.status(500).json({ error: 'Error querying the database' });
        }
    console.error('Error in analyze-keywords API:', error);
    return res.status(500).json({ error: 'Failed to analyze keywords' });
  }
}