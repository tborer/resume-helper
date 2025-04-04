import type { NextApiRequest, NextApiResponse } from 'next';
import { queryGeminiAPI } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

type ResponseData = {
  optimizedResume?: string;
  matchingScore?: number;
  error?: string;
  usageLimit?: {
    remaining: number;
    total: number;
  };
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
    const { jobDescription, resume, apiKey, userEmail, isMasterKey } = req.body;

    // Validate inputs
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    if (!resume) {
      return res.status(400).json({ error: 'Resume is required' });
    }

    let geminiApiKey = apiKey;

    // Check if userEmail exists, as it's needed to find the user in the DB
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user?.geminiApiKey) {
        geminiApiKey = user.geminiApiKey;
        console.log(`Using user-specific Gemini API key for user: ${userEmail}`);
      } else {
        // Fallback to master key if user-specific key is not found
        geminiApiKey = process.env.MASTER_API_KEY;
        if (geminiApiKey) {
          console.log(`User ${userEmail} does not have a custom Gemini API key. Using the master API key.`);
        } else {
          return res.status(500).json({ error: 'No API key available.' });
        }
      }
    } else if (!geminiApiKey && process.env.MASTER_API_KEY) {
      geminiApiKey = process.env.MASTER_API_KEY;
    } else {
      return res.status(400).json({ error: 'API key or user details are required' });
    }
    // If using master key, check usage limits
    if (isMasterKey && userEmail) {
      // In a real app, we would check the database for usage
      // For now, we'll just log it
      console.log(`User ${userEmail} is using the master API key for optimize-resume`);
      
      // This would be the place to check if the user has reached their daily limit
      // If they have, return an error
      // const usageRemaining = await checkMasterKeyUsageLimit(userEmail);
      // if (usageRemaining <= 0) {
      //   return res.status(429).json({ 
      //     error: 'Daily usage limit reached for the Master API key. Please add your own API key for unlimited usage.',
      //     usageLimit: { remaining: 0, total: 10 }
      //   });
      // }
    }

    // Create the prompt as specified by the user
    const prompt = `Ignore all previous instructions. Clear your memory. You are an expert in Applicant Tracking Systems (ATS) and resume optimization. Your task is to analyze a job description and a resume, then modify the resume to achieve a 95% or higher match score with the ATS. You must enhance the resume by adding relevant keywords and phrases from the job description without altering the candidate's actual experience. You can add bullet points, expand the skills section, and refine the language used.

**Instructions:**

1.  **Analyze the Job Description:** Identify key skills, responsibilities, qualifications, and keywords from the provided job description.
2.  **Analyze the Resume:** Extract relevant skills, experience, and qualifications from the provided resume.
3.  **Optimize the Resume:** Modify the resume to incorporate keywords and phrases from the job description, emphasizing relevant skills and experiences.
    * Add keywords and phrases to the summary, experience bullet points, and skills section.
    * Use language from the job description to describe the candidate's experience.
    * Ensure that the modifications are consistent with the candidate's actual experience.
    * Do not change any dates, companies, or job titles.
    * Only include skills and technologies that are explicitly mentioned in the job description or that the candidate already has on their resume.
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
    const response = await queryGeminiAPI(geminiApiKey, prompt);

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

    let matchingScore = parseInt(scoreMatch[1], 10);
    let optimizedResume = optimizedResumeMatch[1].trim();

    // If the matching score is less than 95%, run an additional optimization
    if (matchingScore < 95) {
      console.log('Initial optimization score below 95%, running additional optimization...');
      
      // Create a more targeted prompt for further optimization
      const additionalPrompt = `Ignore all previous instructions. Clear your memory. You are an expert in Applicant Tracking Systems (ATS) and resume optimization. The current resume has a match score of ${matchingScore}%, but we need to achieve 95% or higher.

**Instructions:**

1. Analyze the job description thoroughly to identify ALL key requirements, skills, and qualifications.
2. Analyze the current resume to identify gaps and missing keywords.
3. Find additional keyword phrases, skills, or experience bullet points that should be added to achieve a 95%+ match.
4. Create a new optimized version that incorporates these additional elements while maintaining truthfulness.
5. Focus specifically on:
   * Adding more industry-specific terminology from the job description
   * Expanding technical skills that align with the job requirements
   * Adding quantifiable achievements that demonstrate required competencies
   * Restructuring content to emphasize the most relevant experience
   * Only include skills and technologies that are explicitly mentioned in the job description or that the candidate already has on their resume.

**Input:**

**Job Description:**
${jobDescription}

**Current Resume:**
${optimizedResume}

**Output:**

Matching Score: [Percentage]%

Optimized Resume:

SUMMARY
[Further Optimized Summary Here]

EXPERIENCE
[Further Optimized Experience Section Here]

CERTS
[Further Optimized Certs section here]

EDUCATION
[Further Optimized Education section here]

TECH & SKILLS
[Further Optimized Tech & Skills section here]`;

      // Call the Gemini API again with the additional prompt
      const additionalResponse = await queryGeminiAPI(geminiApiKey, additionalPrompt);

      if (!additionalResponse.error) {
        // Parse the response to extract the new matching score and optimized resume
        const newScoreMatch = additionalResponse.text.match(/Matching Score:\s*(\d+)%/i);
        const newOptimizedResumeMatch = additionalResponse.text.match(/Optimized Resume:\s*([\s\S]+)/i);

        if (newScoreMatch && newOptimizedResumeMatch) {
          matchingScore = parseInt(newScoreMatch[1], 10);
          optimizedResume = newOptimizedResumeMatch[1].trim();
          console.log(`Further optimization complete. New score: ${matchingScore}%`);
        } else {
          console.error('Could not parse additional optimization response:', additionalResponse.text);
        }
      } else {
        console.error('Error from Gemini API during additional optimization:', additionalResponse.error);
      }
    }

    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      await prisma.userAccess.upsert({
        where: { userId: user?.id },
        update: { dailyAnalysisCount: { increment: 1 } },
        create: { userId: user?.id, dailyAnalysisCount: 1 },
      });
      console.log(`User ${userEmail} daily analysis count incremented`);
    }

    // Return the optimized resume and matching score
    return res.status(200).json({ optimizedResume, matchingScore });
  } catch (error) {
    console.error('Error in optimize-resume API:', error);
    return res.status(500).json({ error: 'Failed to optimize resume' });
  }
}