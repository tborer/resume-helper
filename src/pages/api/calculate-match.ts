import type { NextApiRequest, NextApiResponse } from 'next';
import { queryGeminiAPI } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';


type ResponseData = {
  score?: number;
  missingSkills?: string[];
  justification?: string;
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
    const { jobDescription, resume, userEmail } = req.body;

    // Validate inputs
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }
    if (!resume) {
      return res.status(400).json({ error: 'Resume is required' });
    }
    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Fetch user's API key from the database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    let apiKey = process.env.MASTER_API_KEY; // Default to master key
    if (user && user.geminiApiKey) {
      apiKey = user.geminiApiKey;
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    if(!user){
        console.log(`User ${userEmail} not found, using the master API key for calculate-match`);
    }else if (!user.geminiApiKey) {
        console.log(`User ${userEmail} has no API key stored, using the master API key for calculate-match`);
    }

    // Create the prompt as specified by the user
    const prompt = `Ignore all previous instructions. Clear your memory. You are an expert in Applicant Tracking Systems (ATS) and resume analysis. Your task is to analyze a job description and a resume, then provide a matching score indicating how well the resume aligns with the job description.

**Instructions:**

1.  **Analyze the Job Description:** Identify key skills, responsibilities, qualifications, and keywords from the provided job description.
2.  **Analyze the Resume:** Extract relevant skills, experience, and qualifications from the provided resume.
3.  **Calculate a Matching Score:** Based on the analysis, determine the percentage match between the resume and the job description. Consider factors such as:
    * Keyword matching (exact and related terms)
    * Skill alignment
    * Experience relevance
    * Qualification fulfillment
4.  **Provide the Output:** Output the matching score as a percentage number, followed by a brief justification of the score.
5.  **Important:** Only identify missing skills that are explicitly mentioned in the job description. Do not invent or assume skills that are not clearly stated in the job description. Including skills from the identified top skills, if they are not in the resume, include in the missing skills. 
    **Provide the Missing Skills:** Output the identified missing skills that are present in the job description and are not present in the resume. In a comma separated list. 

**Input:**

**Job Description:**

${jobDescription}

**Resume:**

${resume}

**Output:**

Matching Score: [Percentage]%
Justification: [Brief explanation of how the score was calculated, highlighting key matches and mismatches.]

Missing Skills: [Comma-separated list of missing skills]`;

    // Call the Gemini API
    const response = await queryGeminiAPI(apiKey, prompt);

    if (response.error) {
      console.error('Error from Gemini API:', response.error);
      return res.status(500).json({ error: response.error });
    }

    // Parse the response to extract the score and justification
    const scoreMatch = response.text.match(/Matching Score:\s*(\d+)%/i);
    const justificationMatch = response.text.match(/Justification:\s*([\s\S]+)/i);
    const missingSkillsMatch = response.text.match(/Missing Skills:\s*([^\n]+)/i);

    if (!scoreMatch) {
        console.error('Could not parse score from response:', response.text);
        return res.status(500).json({ error: 'Failed to parse matching score from response' });
    }

    const missingSkills = missingSkillsMatch
    ? missingSkillsMatch[1].split(',').map((skill) => skill.trim()) 
    : [];



    const score = parseInt(scoreMatch[1], 10);
    const justification = justificationMatch ? justificationMatch[1].trim() : '';

    // Return the score and justification
    return res.status(200).json({ score, justification });
  } catch (error) {
    console.error('Error in calculate-match API:', error);
    if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
    } else {
        return res.status(500).json({ error: 'Failed to calculate match score' });
    }
  }
}