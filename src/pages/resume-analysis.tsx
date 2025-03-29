import React, { useState, useRef } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ResumeAnalysis() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const optimizedResumeRef = useRef<HTMLTextAreaElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // States for analysis results
  const [topKeywords, setTopKeywords] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchJustification, setMatchJustification] = useState("");
  
  // States for optimization results
  const [optimizedResume, setOptimizedResume] = useState("");
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);
  
  // Get the API key to use (user's key or master key)
  const getApiKeyToUse = () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return { key: "", isMasterKey: false };
    
    // First try to get the user's personal API key
    const userKey = localStorage.getItem(`gemini_api_key_${userEmail}`);
    if (userKey) {
      return { key: userKey, isMasterKey: false };
    }
    
    // If no user key, try to get the master key
    const masterKey = localStorage.getItem('master_gemini_api_key');
    return { key: masterKey || "", isMasterKey: true };
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !resumeText) {
      alert("Please enter both job description and resume");
      return;
    }
    
    const { key: apiKey, isMasterKey } = getApiKeyToUse();
    if (!apiKey) {
      alert("No API key available. Please add your Google Gemini API key in the Account tab");
      return;
    }
    
    const userEmail = localStorage.getItem("userEmail");

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
          body: JSON.stringify({ 
            jobDescription, 
            apiKey, 
            userEmail, 
            isMasterKey 
          })
        }).then(res => res.json()),
          
        // Calculate match score
        fetch('/api/calculate-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            jobDescription, 
            resume: resumeText, 
            apiKey, 
            userEmail, 
            isMasterKey 
          })
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
  
  const handleOptimize = async () => {
    if (!jobDescription || !resumeText) {
      alert("Please enter both job description and resume");
      return;
    }
    
    const { key: apiKey, isMasterKey } = getApiKeyToUse();
    if (!apiKey) {
      alert("No API key available. Please add your Google Gemini API key in the Account tab");
      return;
    }
    
    const userEmail = localStorage.getItem("userEmail");

    setIsOptimizing(true);
    setOptimizedResume("");
    setOptimizedScore(null);
    
    try {
      // Call the optimize-resume API
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobDescription, 
          resume: resumeText, 
          apiKey,
          userEmail,
          isMasterKey
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Error optimizing resume:", data.error);
        alert("There was an error optimizing your resume. Please try again.");
      } else {
        setOptimizedResume(data.optimizedResume || "");
        setOptimizedScore(data.matchingScore || 95);
        setOptimizationComplete(true);
      }
    } catch (error) {
      console.error("Error during optimization:", error);
      alert("There was an error optimizing your resume. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const copyToClipboard = () => {
    if (optimizedResumeRef.current) {
      optimizedResumeRef.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
      
      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
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
          
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Get unlimited resume analyses by adding your own Gemini API key in your account settings.
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-1 hover:text-primary"
              >
                Get your free API key here
              </a>
            </AlertDescription>
          </Alert>
          
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
          
          {isOptimizing && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-center text-muted-foreground">
                    Optimizing your resume for this job description...
                    <br />
                    This may take a minute or two.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {analysisComplete && (
            <div className="space-y-6">
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
                  <TabsTrigger value="optimize">Optimize Resume</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis">
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
                </TabsContent>
                
                <TabsContent value="optimize">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI-Powered Resume Optimization</CardTitle>
                        <CardDescription>
                          Let our AI optimize your resume for this specific job description
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Our AI will analyze your resume and the job description, then create an optimized version 
                          that incorporates relevant keywords and phrases to achieve a higher ATS match score.
                        </p>
                        
                        {!optimizationComplete ? (
                          <Button 
                            onClick={handleOptimize} 
                            disabled={isOptimizing}
                            className="w-full"
                          >
                            {isOptimizing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Optimizing Resume...
                              </>
                            ) : "Generate Optimized Resume"}
                          </Button>
                        ) : (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">Optimized Match Score</h4>
                              <span className="font-bold text-green-500">{optimizedScore}%</span>
                            </div>
                            <Progress value={optimizedScore || 0} className="h-2 mb-4" />
                            <p className="text-sm text-muted-foreground">
                              Your optimized resume now has a significantly higher match score with this job description.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {optimizationComplete && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Your Optimized Resume</CardTitle>
                          <CardDescription>Copy and use this optimized version for your application</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <Textarea 
                              ref={optimizedResumeRef}
                              value={optimizedResume}
                              className="min-h-[400px] mb-4 font-mono text-sm"
                              readOnly
                            />
                            <Button 
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={copyToClipboard}
                            >
                              {copySuccess ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={copyToClipboard}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy to Clipboard
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            This optimized resume maintains your actual experience while incorporating keywords 
                            and phrases from the job description to improve your chances of passing ATS screening.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
        
        <footer className="py-6 border-t border-border">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ResumeAI, an Agile Rant product. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}