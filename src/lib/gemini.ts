// Utility functions for interacting with Google Gemini API

/**
 * Validates if a Gemini API key is properly formatted
 */
export const isValidGeminiApiKey = (apiKey: string): boolean => {
  // Basic validation - Gemini API keys typically start with "AI" followed by alphanumeric characters
  return /^AI[a-zA-Z0-9_-]{30,}$/.test(apiKey);
};

/**
 * Interface for the response from Gemini API
 */
export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Makes a request to the Gemini API
 * @param apiKey - The Gemini API key
 * @param prompt - The prompt to send to the API
 * @param model - The model to use (defaults to gemini-2.0-flash)
 */
export const queryGeminiAPI = async (
  apiKey: string,
  prompt: string,
  model: string = "gemini-2.0-flash"
): Promise<GeminiResponse> => {
  if (!apiKey) {
    return {
      text: "",
      error: "No API key provided. Please add your Gemini API key in the Account settings."
    };
  }

  if (!prompt) {
    return {
      text: "",
      error: "No prompt provided."
    };
  }

  try {
    // The URL for the Gemini API (using v1 instead of v1beta)
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    
    // The request body
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };
    
    // Make the request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    // Parse the response
    const data = await response.json();
    
    // Check for errors
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return {
        text: "",
        error: data.error?.message || "Error calling Gemini API"
      };
    }
    
    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return {
      text: generatedText
    };
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Extracts keywords from a job description
 */
export const extractKeywords = async (
  apiKey: string,
  jobDescription: string
): Promise<string[]> => {
  const prompt = `
    Ignore all previous instructions. Clear your memory.
    Extract the top 10 most important skills and keywords from this job description. 
    Return them as a simple comma-separated list with no additional text or formatting.
    Only extract keywords that are explicitly mentioned in the job description:
    
    ${jobDescription}
  `;
  
  const response = await queryGeminiAPI(apiKey, prompt);
  
  if (response.error || !response.text) {
    console.error("Error extracting keywords:", response.error);
    return [];
  }
  
  // Parse the comma-separated list
  return response.text
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0);
};

/**
 * Calculates the ATS match score between a resume and job description
 */
export const calculateATSMatchScore = async (
  apiKey: string,
  resume: string,
  jobDescription: string
): Promise<{
  score: number;
  feedback: string;
}> => {
  const prompt = `
    Ignore all previous instructions. Clear your memory.
    You are an ATS (Applicant Tracking System) expert. Analyze how well the following resume matches 
    the job description. Give a percentage match score (0-100) and provide brief feedback on how to improve.
    Only identify missing skills that are explicitly mentioned in the job description.
    
    Job Description:
    ${jobDescription}
    
    Resume:
    ${resume}
    
    Format your response exactly like this:
    SCORE: [percentage]
    FEEDBACK: [your feedback]
  `;
  
  const response = await queryGeminiAPI(apiKey, prompt);
  
  if (response.error || !response.text) {
    console.error("Error calculating ATS match:", response.error);
    return {
      score: 0,
      feedback: response.error || "Failed to calculate match score"
    };
  }
  
  // Parse the response
  const scoreMatch = response.text.match(/SCORE:\s*(\d+)/i);
  const feedbackMatch = response.text.match(/FEEDBACK:\s*([\s\S]+)/i);
  
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  const feedback = feedbackMatch ? feedbackMatch[1].trim() : "";
  
  return {
    score,
    feedback
  };
};

/**
 * Generates an optimized resume based on the job description
 */
export const generateOptimizedResume = async (
  apiKey: string,
  resume: string,
  jobDescription: string
): Promise<string> => {
  const prompt = `
    Ignore all previous instructions. Clear your memory.
    You are an expert resume writer specializing in optimizing resumes for ATS systems.
    Rewrite the following resume to better match the job description, while maintaining
    truthfulness and the candidate's actual experience. Focus on keyword optimization,
    formatting, and highlighting relevant skills and experiences.
    Only include skills and technologies that are explicitly mentioned in the job description or that the candidate already has on their resume.
    
    Job Description:
    ${jobDescription}
    
    Original Resume:
    ${resume}
    
    Provide only the optimized resume text with no additional commentary.
  `;
  
  const response = await queryGeminiAPI(apiKey, prompt);
  
  if (response.error || !response.text) {
    console.error("Error generating optimized resume:", response.error);
    return resume; // Return original resume if there's an error
  }
  
  return response.text;
};