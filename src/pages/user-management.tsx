import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock user data - in a real app, this would come from a database
const mockUsers = [
  { id: 1, email: "admin@example.com", isActive: true, isAdmin: true },
  { id: 2, email: "user1@example.com", isActive: true, isAdmin: false },
  { id: 3, email: "user2@example.com", isActive: false, isAdmin: false },
  { id: 4, email: "user3@example.com", isActive: true, isAdmin: false },
];

// Mock API logs - in a real app, these would be fetched from a database or log service
const mockApiLogs = [
  { 
    id: 1, 
    timestamp: "2025-03-28T21:45:12Z", 
    endpoint: "/api/check-subscription", 
    requestBody: JSON.stringify({ email: "user1@example.com" }, null, 2),
    responseBody: JSON.stringify({ hasSubscription: true }, null, 2),
    status: 200
  },
  { 
    id: 2, 
    timestamp: "2025-03-28T21:30:05Z", 
    endpoint: "/api/check-subscription", 
    requestBody: JSON.stringify({ email: "user2@example.com" }, null, 2),
    responseBody: JSON.stringify({ hasSubscription: false }, null, 2),
    status: 200
  },
  { 
    id: 3, 
    timestamp: "2025-03-28T20:15:33Z", 
    endpoint: "/api/check-subscription", 
    requestBody: JSON.stringify({ email: "nonexistent@example.com" }, null, 2),
    responseBody: JSON.stringify({ hasSubscription: false }, null, 2),
    status: 200
  },
];

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [apiLogs, setApiLogs] = useState(mockApiLogs);
  const [userEmail, setUserEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
      
      // Check if current user is admin (in a real app, this would be verified server-side)
      const currentUser = mockUsers.find(user => user.email === storedEmail);
      if (currentUser?.isAdmin) {
        setIsAdmin(true);
      } else {
        // Redirect non-admin users to dashboard
        router.push("/dashboard");
      }
    } else {
      // If no email is found, redirect to home page
      router.push("/");
    }
  }, [router]);

  // Toggle user active status
  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return null; // Don't render anything while checking admin status or redirecting
  }

  return (
    <>
      <Head>
        <title>User Management | ResumeAI - ATS Resume Optimizer</title>
        <meta name="description" content="Admin user management dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="px-3 py-1">
              Admin: {userEmail}
            </Badge>
          </div>
          
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="logs">API Logs</TabsTrigger>
              <TabsTrigger value="back" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user access and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Label htmlFor="search">Search Users</Label>
                    <Input 
                      id="search" 
                      placeholder="Search by email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>
                                {user.isAdmin ? (
                                  <Badge variant="secondary">Admin</Badge>
                                ) : (
                                  <Badge variant="outline">User</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={user.isActive ? "secondary" : "destructive"}
                                  className={user.isActive ? "bg-green-500 text-white" : "bg-red-500"}
                                >
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={user.isActive}
                                    onCheckedChange={() => toggleUserStatus(user.id)}
                                    disabled={user.isAdmin && user.email === userEmail} // Prevent admin from deactivating themselves
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {user.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>API Logs</CardTitle>
                  <CardDescription>Stripe API call logs for subscription verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {apiLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{log.endpoint}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Request</h4>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                              {log.requestBody}
                            </pre>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <h4 className="text-sm font-medium">Response</h4>
                              <Badge 
                                variant={log.status >= 200 && log.status < 300 ? "outline" : "destructive"}
                                className={log.status >= 200 && log.status < 300 ? "border-green-500 text-green-500" : ""}
                              >
                                Status: {log.status}
                              </Badge>
                            </div>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                              {log.responseBody}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {apiLogs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No API logs found
                      </div>
                    )}
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