import React from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/router";

export default function SubscriptionRequired() {
  const router = useRouter();
  const { email } = router.query;

  return (
    <>
      <Head>
        <title>Subscription Required | Resume Rocket Match AI - ATS Resume Optimizer</title>
        <meta name="description" content="Subscription required to access the ATS Resume Optimizer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Subscription Required</CardTitle>
              <CardDescription>
                You need an active subscription to access the ATS Resume Optimizer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {email && (
                <p className="text-muted-foreground">
                  No active subscription was found for <strong>{email}</strong>.
                </p>
              )}
              <p>
                Get access to our powerful ATS optimization tools to improve your resume and land more interviews.
              </p>
              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  onClick={() => window.location.href = "https://buy.stripe.com/5kAcP0dXHgZTf3q6oy"}
                  className="w-full"
                >
                  Subscribe Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <footer className="py-6 border-t border-border">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Resume Rocket Match AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}