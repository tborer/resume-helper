import React, { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";

export default function ResumeAnalysis() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // States for analysis results
  const [topKeywords, setTopKeywords] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchJustification, setMatchJustification] = useState("");
  
  // Get the API key from localStorage
  const getApiKey = () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return "";
    
    return localStorage.getItem(`gemini_api_key_${userEmail}`) || "";
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !resumeText) {
      alert("Please enter both job description and resume");
      return;
    }
    
    const apiKey = getApiKey();
    if (!apiKey) {
      alert("Please add your Google Gemini API key in the Account tab");
      return;
    }

    setIsAnalyzing(true);
    setTopKeywords([]);
    setMatchScore(null);
    setMatchJustification("");
    
    try {
      // Run analyses in parallel
      const [keywordsResponse, matchResponse] = await Promise.all([
        // Extract keywords from job description
        fetch('/api/analyze-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription, apiKey })
        }).then(res => res.json()),
          
        // Calculate match score
        fetch('/api/calculate-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription, resume: resumeText, apiKey })
        }).then(res => res.json())
      ]);
      
      // Handle keywords response
      if (keywordsResponse.error) {
        console.error("Error extracting keywords:", keywordsResponse.error);
      } else if (keywordsResponse.keywords) {
        setTopKeywords(keywordsResponse.keywords);
      }
      
      // Handle match score response
      if (matchResponse.error) {
        console.error("Error calculating match score:", matchResponse.error);
      } else {
        setMatchScore(matchResponse.score || 0);
        setMatchJustification(matchResponse.justification || "");
      }
      
      setAnalysisComplete(true);
    } catch (error) {
      console.error("Error during analysis:", error);
      alert("There was an error analyzing your resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Resume Analysis | ResumeAI - ATS Resume Optimizer</title>
        <meta name="description" content="Analyze and optimize your resume for ATS systems" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-6">Resume Analysis</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the job description you're applying for</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste job description here..." 
                  className="min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>Paste your current resume content</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste your resume here..." 
                  className="min-h-[200px]"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8 flex justify-center">
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !jobDescription || !resumeText}
              className="px-8"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : "Analyze & Optimize Resume"}
            </Button>
          </div>
          
          {isAnalyzing && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-center text-muted-foreground">
                    Analyzing your resume against the job description...
                    <br />
                    This may take a moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {analysisComplete && (
            <div className="space-y-6">
              {/* Top Keywords Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Keywords from Job Description</CardTitle>
                  <CardDescription>These are the most important terms to include in your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  {topKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {topKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No keywords could be extracted. Please try again with a more detailed job description.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Match Score Section */}
              {matchScore !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Match Score</CardTitle>
                    <CardDescription>How well your resume matches the job description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span>Match Score</span>
                        <span className="font-bold">{matchScore}%</span>
                      </div>
                      <Progress value={matchScore} className="h-2" />
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Justification</h4>
                      <p className="text-sm whitespace-pre-line">{matchJustification}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Improve your resume based on the analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Update your resume to include more of the top keywords</li>
                    <li>Focus on quantifiable achievements that demonstrate the required skills</li>
                    <li>Tailor your experience descriptions to match the job requirements</li>
                    <li>Consider the formatting and structure of your resume for better ATS readability</li>
                  </ul>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={() => router.push('/dashboard')} 
                      variant="outline" 
                      className="w-full"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        
        <footer className="py-6 border-t border-border">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}