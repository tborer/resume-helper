import type { NextApiRequest, NextApiResponse } from 'next';
import { queryGeminiAPI } from '@/lib/gemini';

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

  try {
    const { jobDescription, apiKey, userEmail, isMasterKey } = req.body;

    // Validate inputs
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // If using master key, check usage limits
    if (isMasterKey && userEmail) {
      // In a real app, we would check the database for usage
      // For now, we'll just log it
      console.log(`User ${userEmail} is using the master API key for analyze-keywords`);
    }

    // Create the prompt as specified by the user
    const prompt = `Please analyze the following job description and identify the top 10 most relevant keywords and phrases. Consider both the frequency of terms and the contextual importance of concepts within the description. Prioritize terms that accurately reflect the core responsibilities, required skills, and overall focus of the role.

[JOB DESCRIPTION HERE]
${jobDescription}

Output the top 10 keywords/phrases in a clear, numbered list.`;

    // Call the Gemini API
    const response = await queryGeminiAPI(apiKey, prompt);

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
    console.error('Error in analyze-keywords API:', error);
    return res.status(500).json({ error: 'Failed to analyze keywords' });
  }
}