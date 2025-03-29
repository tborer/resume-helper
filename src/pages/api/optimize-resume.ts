import type { NextApiRequest, NextApiResponse } from 'next';
import { queryGeminiAPI } from '@/lib/gemini';

type ResponseData = {
  optimizedResume?: string;
  matchingScore?: number;
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
    const { jobDescription, resume, apiKey } = req.body;

    // Validate inputs
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    if (!resume) {
      return res.status(400).json({ error: 'Resume is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Create the prompt as specified by the user
    const prompt = `You are an expert in Applicant Tracking Systems (ATS) and resume optimization. Your task is to analyze a job description and a resume, then modify the resume to achieve a 95% or higher match score with the ATS. You must enhance the resume by adding relevant keywords and phrases from the job description without altering the candidate's actual experience. You can add bullet points, expand the skills section, and refine the language used.

**Instructions:**

1.  Forgetting info from prior prompts. **Analyze the Job Description:** Identify key skills, responsibilities, qualifications, and keywords from the provided job description.
2.  **Analyze the Resume:** Extract relevant skills, experience, and qualifications from the provided resume.
3.  **Optimize the Resume:** Modify the resume to incorporate keywords and phrases from the job description, emphasizing relevant skills and experiences.
    * Add keywords and phrases to the summary, experience bullet points, and skills section.
    * Use language from the job description to describe the candidate's experience.
    * Ensure that the modifications are consistent with the candidate's actual experience.
    * Do not change any dates, companies, or job titles.
4.  **Calculate and Provide the Matching Score:** Calculate the percentage match between the optimized resume and the job description.
5.  **Output the Optimized Resume:** Output the optimized resume in the specified text format.

**Input:**

**Job Description:**

${jobDescription}

**Resume:**

${resume}

**Output:**

Matching Score: [Percentage]%

Optimized Resume:

SUMMARY
[Optimized Summary Here]

EXPERIENCE
[Optimized Experience Section Here]

CERTS
[Optimized Certs section here]

EDUCATION
[Optimized Education section here]

TECH & SKILLS
[Optimized Tech & Skills section here]`;

    // Call the Gemini API
    const response = await queryGeminiAPI(apiKey, prompt);

    if (response.error) {
      console.error('Error from Gemini API:', response.error);
      return res.status(500).json({ error: response.error });
    }

    // Parse the response to extract the matching score and optimized resume
    const scoreMatch = response.text.match(/Matching Score:\s*(\d+)%/i);
    const optimizedResumeMatch = response.text.match(/Optimized Resume:\s*([\s\S]+)/i);

    if (!scoreMatch || !optimizedResumeMatch) {
      console.error('Could not parse response:', response.text);
      return res.status(500).json({ 
        error: 'Failed to parse optimized resume from response',
        optimizedResume: response.text // Return the raw response as a fallback
      });
    }

    const matchingScore = parseInt(scoreMatch[1], 10);
    const optimizedResume = optimizedResumeMatch[1].trim();

    // Return the optimized resume and matching score
    return res.status(200).json({ optimizedResume, matchingScore });
  } catch (error) {
    console.error('Error in optimize-resume API:', error);
    return res.status(500).json({ error: 'Failed to optimize resume' });
  }
}