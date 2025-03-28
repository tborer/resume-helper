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
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      } else {
        // If no email is found, redirect to home page
        console.log("Dashboard: No email found, redirecting to home");
        router.push("/");
      }
    }
  }, [router.query, router]);

  const handleAnalyze = () => {
    if (!jobDescription || !resumeText) {
      alert("Please enter both job description and resume");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      // This would be replaced with actual AI analysis
      const score = Math.floor(Math.random() * 40) + 40; // Random score between 40-80
      setAtsScore(score);
      
      // Generate "optimized" resume (just a placeholder)
      const optimized = resumeText + "\n\n/* Optimized with keywords from job description */";
      setOptimizedResume(optimized);
      
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
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
        <title>Dashboard | ResumeAI - ATS Resume Optimizer</title>
        <meta name="description" content="Optimize your resume for ATS systems" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-6">Resume ATS Optimizer</h1>
          
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="analyze">Analyze & Optimize</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="admin" onClick={() => router.push("/user-management")}>
                    Admin Panel
                  </TabsTrigger>
                  <TabsTrigger value="stripe-testing">
                    Stripe Testing
                  </TabsTrigger>
                </>
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
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <CardTitle>Optimized Resume</CardTitle>
                      <CardDescription>Your ATS-optimized resume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        value={optimizedResume}
                        className="min-h-[200px] mb-4"
                        readOnly
                      />
                      <Button className="w-full">Download Optimized Resume</Button>
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
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Subscription Status</h4>
                      <p className="text-green-500 font-medium">Active</p>
                      <p className="text-sm text-muted-foreground mt-1">Your subscription renews on April 28, 2025</p>
                    </div>
                    
                    <Button variant="outline" className="w-full">Manage Subscription</Button>
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
            <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}