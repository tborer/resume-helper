import React, { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call our API to check subscription status
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.hasSubscription) {
        // Redirect to dashboard if subscription is active
        window.location.href = `/dashboard?email=${encodeURIComponent(email)}`;
      } else {
        // Redirect to subscription required page if no subscription
        window.location.href = `/subscription-required?email=${encodeURIComponent(email)}`;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      alert('There was an error checking your subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>ResumeAI - ATS Resume Optimizer</title>
        <meta name="description" content="Optimize your resume for ATS systems and land more interviews" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-12 mt-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Get Past the ATS Bots
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Optimize your resume for each job application and increase your interview chances by up to 70%
            </p>
          </div>

          {/* Email Subscription Check */}
          <Card className="w-full max-w-md mb-16">
            <CardHeader>
              <CardTitle>Start Optimizing Your Resume</CardTitle>
              <CardDescription>Enter your email to check your subscription or get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = "https://buy.stripe.com/5kAcP0dXHgZTf3q6oy"}
                >
                  Get It Now
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or check your subscription</span>
                  </div>
                </div>
                <form onSubmit={handleEmailSubmit}>
                  <div className="flex flex-col space-y-4">
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Checking..." : "Continue"}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
            <FeatureCard 
              title="Job Posting Analysis" 
              description="Our AI analyzes job descriptions to identify key skills and requirements that employers are looking for."
            />
            <FeatureCard 
              title="Resume Comparison" 
              description="Compare your resume against the job posting to identify gaps and opportunities for improvement."
            />
            <FeatureCard 
              title="ATS Optimization" 
              description="Get a tailored version of your resume optimized for Applicant Tracking Systems to increase visibility."
            />
          </div>

          {/* How It Works Section */}
          <div className="w-full mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard 
                number="1" 
                title="Upload Your Resume" 
                description="Upload your current resume and paste the job description you're applying for."
              />
              <StepCard 
                number="2" 
                title="AI Analysis" 
                description="Our AI analyzes both documents to identify keyword matches and improvement opportunities."
              />
              <StepCard 
                number="3" 
                title="Get Optimized Resume" 
                description="Download your ATS-optimized resume tailored specifically for the job you're applying to."
              />
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="w-full mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TestimonialCard 
                quote="After using this tool, I got callbacks from 4 out of 5 jobs I applied to. Before, I was lucky to hear back from 1 in 20."
                author="Sarah K., Software Engineer"
              />
              <TestimonialCard 
                quote="The resume optimization helped me land interviews at companies that had rejected me before. The difference was night and day."
                author="Michael T., Marketing Manager"
              />
            </div>
          </div>

          {/* CTA Section */}
          <Card className="w-full max-w-3xl mb-16">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Land More Interviews?</h3>
                <p className="mb-6 text-muted-foreground">
                  Don't let your resume get lost in the ATS black hole. Optimize it now and stand out from the competition.
                </p>
                <div className="flex flex-col gap-4 max-w-md mx-auto">
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = "https://buy.stripe.com/5kAcP0dXHgZTf3q6oy"}
                    size="lg"
                  >
                    Get It Now
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or check your subscription</span>
                    </div>
                  </div>
                  <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 w-full">
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Checking..." : "Continue"}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-border">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

// Component for feature cards
const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{description}</p>
    </CardContent>
  </Card>
);

// Component for how it works steps
const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <Card className="relative">
    <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
      {number}
    </div>
    <CardHeader className="pt-8">
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{description}</p>
    </CardContent>
  </Card>
);

// Component for testimonials
const TestimonialCard = ({ quote, author }: { quote: string; author: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex gap-4">
        <div className="mt-1 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </div>
        <div>
          <p className="mb-2 italic">{quote}</p>
          <p className="text-sm font-semibold">{author}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);