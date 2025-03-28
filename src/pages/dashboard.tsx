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
  
  useEffect(() => {
    // Get email from URL query or localStorage
    if (router.query.email) {
      const email = router.query.email as string;
      setUserEmail(email);
      // Store email in localStorage for persistence
      localStorage.setItem("userEmail", email);
      
      // Check if user is admin (in a real app, this would be verified server-side)
      if (email === "admin@example.com") {
        setIsAdmin(true);
      }
    } else {
      // Try to get from localStorage
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        setUserEmail(storedEmail);
        
        // Check if user is admin (in a real app, this would be verified server-side)
        if (storedEmail === "admin@example.com") {
          setIsAdmin(true);
        }
      } else {
        // If no email is found, redirect to home page
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