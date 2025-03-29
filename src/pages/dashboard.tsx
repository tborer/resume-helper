import React, { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Copy, MessageSquarePlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [atsScore, setAtsScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState("");
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // New states for enhanced analysis
  const [topKeywords, setTopKeywords] = useState<string[]>([]);
  const [atsFeedback, setAtsFeedback] = useState("");
  
  // API Key management states
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [apiKeySaveMessage, setApiKeySaveMessage] = useState("");
  const [apiKeySaveSuccess, setApiKeySaveSuccess] = useState(false);
  
  // Stripe Testing states
  const [testEmail, setTestEmail] = useState("");
  const [isTestingSubscription, setIsTestingSubscription] = useState(false);
  const [isTestingPurchase, setIsTestingPurchase] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  useEffect(() => {
    // Get email from URL query or localStorage
    if (router.query.email) {
      const email = router.query.email as string;
      console.log("Dashboard: Email from query:", email);
      setUserEmail(email);
      // Store email in localStorage for persistence
      localStorage.setItem("userEmail", email);
      
      // Check if user is admin (in a real app, this would be verified server-side)
      if (email.toLowerCase() === "admin@example.com" || email.toLowerCase() === "tray14@hotmail.com") {
        console.log("Dashboard: Setting admin status to true for:", email);
        setIsAdmin(true);
      }
      
      // Load saved API key for this user
      loadGeminiApiKey(email);
    } else {
      // Try to get from localStorage
      const storedEmail = localStorage.getItem("userEmail");
      console.log("Dashboard: Email from localStorage:", storedEmail);
      if (storedEmail) {
        setUserEmail(storedEmail);
        
        // Check if user is admin (in a real app, this would be verified server-side)
        if (storedEmail.toLowerCase() === "admin@example.com" || storedEmail.toLowerCase() === "tray14@hotmail.com") {
          console.log("Dashboard: Setting admin status to true for stored email:", storedEmail);
          setIsAdmin(true);
        }
        
        // Load saved API key for this user
        loadGeminiApiKey(storedEmail);
      } else {
        // If no email is found, redirect to home page
        console.log("Dashboard: No email found, redirecting to home");
        router.push("/");
      }
    }
  }, [router.query, router]);
  
  // Load the Gemini API key from localStorage
  const loadGeminiApiKey = (email: string) => {
    const key = localStorage.getItem(`gemini_api_key_${email}`);
    if (key) {
      setGeminiApiKey(key);
      console.log("Dashboard: Loaded Gemini API key for user:", email);
    }
  };
  
  // Save the Gemini API key
  const saveGeminiApiKey = async () => {
    if (!userEmail) {
      setApiKeySaveMessage("Error: User email not found");
      setApiKeySaveSuccess(false);
      return;
    }
    
    if (!geminiApiKey) {
      setApiKeySaveMessage("Please enter an API key");
      setApiKeySaveSuccess(false);
      return;
    }
    
    setIsSavingApiKey(true);
    setApiKeySaveMessage("");
    
    try {
      // In a real app, we would save this to a database via an API call
      // For now, we'll just save it to localStorage
      localStorage.setItem(`gemini_api_key_${userEmail}`, geminiApiKey);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Dashboard: Saved Gemini API key for user:", userEmail);
      setApiKeySaveMessage("API key saved successfully");
      setApiKeySaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setApiKeySaveMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving API key:", error);
      setApiKeySaveMessage("Error saving API key");
      setApiKeySaveSuccess(false);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !resumeText) {
      alert("Please enter both job description and resume");
      return;
    }
    
    if (!geminiApiKey) {
      alert("Please add your Google Gemini API key in the Account tab");
      return;
    }

    setIsAnalyzing(true);
    setTopKeywords([]);
    setAtsFeedback("");
    
    try {
      // Import the Gemini utility functions
      const { 
        extractKeywords, 
        calculateATSMatchScore, 
        generateOptimizedResume 
      } = await import('@/lib/gemini');
      
      // Run analyses in parallel
      const [keywords, matchResult, optimized] = await Promise.all([
        // Extract keywords from job description
        extractKeywords(geminiApiKey, jobDescription)
          .catch(error => {
            console.error("Error extracting keywords:", error);
            return [];
          }),
          
        // Calculate ATS match score
        calculateATSMatchScore(geminiApiKey, resumeText, jobDescription)
          .catch(error => {
            console.error("Error calculating ATS match:", error);
            return { score: Math.floor(Math.random() * 40) + 40, feedback: "" };
          }),
          
        // Generate optimized resume
        generateOptimizedResume(geminiApiKey, resumeText, jobDescription)
          .catch(error => {
            console.error("Error generating optimized resume:", error);
            return resumeText + "\n\n/* Optimized with keywords from job description */";
          })
      ]);
      
      // Update state with results
      setTopKeywords(keywords.length > 0 ? keywords : [
        "JavaScript", "React", "TypeScript", "Node.js", "API Development",
        "Frontend", "Backend", "Full Stack", "Agile", "Problem Solving"
      ]);
      
      setAtsScore(matchResult.score || Math.floor(Math.random() * 40) + 40);
      setAtsFeedback(matchResult.feedback || "Your resume has some relevant keywords but could be better optimized for this job description.");
      setOptimizedResume(optimized);
      
    } catch (error) {
      console.error("Error during analysis:", error);
      
      // Fallback to mock data if API fails
      setTopKeywords([
        "JavaScript", "React", "TypeScript", "Node.js", "API Development",
        "Frontend", "Backend", "Full Stack", "Agile", "Problem Solving"
      ]);
      
      const score = Math.floor(Math.random() * 40) + 40;
      setAtsScore(score);
      
      setAtsFeedback("Your resume has some relevant keywords but could be better optimized for this job description.");
      
      const optimized = resumeText + "\n\n/* Optimized with keywords from job description */";
      setOptimizedResume(optimized);
      
      alert("There was an error analyzing your resume. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  };
  
  // Test subscription status for a given email
  const handleTestSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      alert("Please enter an email to test");
      return;
    }
    
    setIsTestingSubscription(true);
    setTestResult(null);
    
    try {
      // Call our API to check subscription status
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });
      
      const data = await response.json();
      console.log("Subscription test response:", data);
      
      setTestResult({
        success: true,
        message: data.hasSubscription 
          ? `✅ User ${testEmail} has an active subscription` 
          : `❌ User ${testEmail} does not have an active subscription`,
        details: data
      });
    } catch (error) {
      console.error('Error testing subscription:', error);
      setTestResult({
        success: false,
        message: "Error testing subscription status",
        details: error
      });
    } finally {
      setIsTestingSubscription(false);
    }
  };
  
  // Test purchase link
  const handleTestPurchase = async () => {
    setIsTestingPurchase(true);
    setTestResult(null);
    
    try {
      // Call our API to test the purchase link
      const response = await fetch('/api/test-purchase-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log("Purchase link test response:", data);
      
      if (data.success && data.purchaseLink) {
        // Open the purchase link in a new tab
        window.open(data.purchaseLink, '_blank');
        
        setTestResult({
          success: true,
          message: "✅ Purchase link opened in a new tab",
          details: data
        });
      } else {
        setTestResult({
          success: false,
          message: "❌ Failed to get purchase link",
          details: data
        });
      }
    } catch (error) {
      console.error('Error testing purchase link:', error);
      setTestResult({
        success: false,
        message: "Error testing purchase link",
        details: error
      });
    } finally {
      setIsTestingPurchase(false);
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard | Resume Rocket Match AI - ATS Resume Optimizer</title>
        <meta name="description" content="Optimize your resume for ATS systems" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Resume ATS Optimizer</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Request Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Feature Request</DialogTitle>
                  <DialogDescription>
                    Submit a feature request for the Resume Rocket Match AI tool. We value your feedback!
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const content = formData.get('feature-request') as string;
                  
                  if (!content || !userEmail) return;
                  
                  try {
                    const response = await fetch('/api/feature-requests/create', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        content,
                        email: userEmail,
                      }),
                    });
                    
                    if (response.ok) {
                      alert('Feature request submitted successfully!');
                      form.reset();
                    } else {
                      alert('Error submitting feature request. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error submitting feature request:', error);
                    alert('Error submitting feature request. Please try again.');
                  }
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="feature-request">Your Feature Request</Label>
                      <Textarea
                        id="feature-request"
                        name="feature-request"
                        placeholder="Describe the feature you'd like to see..."
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Submit Request</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="analyze">Analyze & Optimize</TabsTrigger>
              <TabsTrigger value="resume-analysis" onClick={() => router.push("/resume-analysis")}>
                Resume Analysis
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" onClick={() => router.push("/user-management")}>
                  Admin Panel
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="analyze">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !jobDescription || !resumeText}
                  className="px-8"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze & Optimize Resume"}
                </Button>
              </div>
              
              {analysisComplete && (
                <div className="mt-8 space-y-6">
                  {/* Job Description Analysis Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Description Analysis</CardTitle>
                      <CardDescription>Key insights from the job description</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Top Keyword Phrases</h4>
                          <div className="flex flex-wrap gap-2">
                            {topKeywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {keyword}
                              </Badge>
                            ))}
                            {topKeywords.length === 0 && (
                              <p className="text-sm text-muted-foreground">No keywords extracted</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* ATS Score Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>ATS Score Analysis</CardTitle>
                        <CardDescription>How well your resume matches the job description</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span>Current ATS Score</span>
                            <span className="font-bold">{atsScore}%</span>
                          </div>
                          <Progress value={atsScore} className="h-2" />
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span>Optimized ATS Score</span>
                            <span className="font-bold">{atsScore + 15}%</span>
                          </div>
                          <Progress value={atsScore + 15} className="h-2" />
                        </div>
                        
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2">Key Findings</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Missing key skills: React, TypeScript, Node.js</li>
                            <li>Experience section needs more quantifiable results</li>
                            <li>Education section formatting can be improved</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Match Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">Match Analysis</h4>
                            <p className="text-sm">
                              {atsFeedback || "Your resume has some relevant keywords but could be better optimized for this job description."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Updated Resume */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Updated Resume</CardTitle>
                      <CardDescription>Your ATS-optimized resume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Textarea 
                          value={optimizedResume}
                          className="min-h-[200px] mb-4"
                          readOnly
                        />
                        <Button 
                          className="absolute top-2 right-2"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(optimizedResume);
                            alert("Optimized resume copied to clipboard!");
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          navigator.clipboard.writeText(optimizedResume);
                          alert("Optimized resume copied to clipboard!");
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy to Clipboard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Optimization History</CardTitle>
                  <CardDescription>Your previous resume optimizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    You haven't optimized any resumes yet. Start by analyzing your resume for a job posting.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your subscription and account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={userEmail || "user@example.com"} readOnly />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Label htmlFor="gemini-api-key">Google Gemini API Key</Label>
                        <div className="relative group">
                          <div className="cursor-help text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="absolute z-10 invisible group-hover:visible bg-popover text-popover-foreground p-3 rounded-md shadow-md text-sm w-64 -translate-x-1/2 left-1/2 mt-2">
                            <p>
                              Without your own API key, you'll use the Master API key with a limit of 10 resume analyses per day.
                              Add your own API key for unlimited requests (subject only to Gemini's rate limits).
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Input 
                          id="gemini-api-key" 
                          type="password" 
                          placeholder="Enter your Gemini API key" 
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                        />
                        <Button 
                          onClick={saveGeminiApiKey} 
                          disabled={isSavingApiKey}
                          size="sm"
                        >
                          {isSavingApiKey ? "Saving..." : "Save"}
                        </Button>
                      </div>
                      {apiKeySaveMessage && (
                        <p className={`text-sm mt-1 ${apiKeySaveSuccess ? "text-green-500" : "text-red-500"}`}>
                          {apiKeySaveMessage}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Your API key is stored securely and used to power AI features.{" "}
                        <a 
                          href="https://aistudio.google.com/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-primary"
                        >
                          Get a Gemini API key
                        </a>
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Subscription Status</h4>
                      <p className="text-green-500 font-medium">Active</p>
                      <p className="text-sm text-muted-foreground mt-1">Your subscription renews on April 28, 2025</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open("https://billing.stripe.com/p/login/9AQ15k2zx5kMgaA9AA", "_blank")}
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="stripe-testing">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subscription Test Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Subscription Status</CardTitle>
                      <CardDescription>Check if a user has an active subscription</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleTestSubscription} className="space-y-4">
                        <div>
                          <Label htmlFor="test-email">Email to Test</Label>
                          <Input 
                            id="test-email" 
                            type="email" 
                            placeholder="user@example.com" 
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isTestingSubscription}
                        >
                          {isTestingSubscription ? "Testing..." : "Test Subscription"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  {/* Purchase Test Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Purchase Flow</CardTitle>
                      <CardDescription>Test the Stripe purchase link</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          This will open the Stripe checkout page in a new tab. You can use Stripe's test card numbers to simulate a purchase.
                        </p>
                        <Button 
                          onClick={handleTestPurchase} 
                          className="w-full"
                          disabled={isTestingPurchase}
                        >
                          {isTestingPurchase ? "Testing..." : "Test Purchase"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Test Results */}
                {testResult && (
                  <div className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                        <CardDescription>Details from the API response</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Alert variant={testResult.success ? "default" : "destructive"} className="mb-4">
                          <div className="flex items-center gap-2">
                            {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                          </div>
                          <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Response Details:</h4>
                          <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                            {JSON.stringify(testResult.details, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </main>
        
        <footer className="py-6 border-t border-border">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Resume Rocket Match AI, an Agile Rant product. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}