import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock user data - in a real app, this would come from a database
//const mockUsers = [
  //{ id: 1, email: "admin@example.com", isActive: true, isAdmin: true, historyAccess: true, accountAccess: true },
  //{ id: 2, email: "tray14@hotmail.com", isActive: true, isAdmin: true, historyAccess: true, accountAccess: true },
  //{ id: 3, email: "user1@example.com", isActive: true, isAdmin: false, historyAccess: true, accountAccess: false },
  //{ id: 4, email: "user2@example.com", isActive: false, isAdmin: false, historyAccess: false, accountAccess: false },
  //{ id: 5, email: "user3@example.com", isActive: true, isAdmin: false, historyAccess: true, accountAccess: true },
//];

//Fetch users from real database
const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    } else {
      console.error('Error fetching users:', response.status);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

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
  
  // Stripe Testing states
  const [testEmail, setTestEmail] = useState("");
  const [isTestingSubscription, setIsTestingSubscription] = useState(false);
  const [isTestingPurchase, setIsTestingPurchase] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  // Master API Key states
  const [masterApiKey, setMasterApiKey] = useState("");
  const [isSavingMasterApiKey, setIsSavingMasterApiKey] = useState(false);
  const [masterApiKeySaveMessage, setMasterApiKeySaveMessage] = useState("");
  const [masterApiKeySaveSuccess, setMasterApiKeySaveSuccess] = useState(false);
  
  // Add User states
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserMessage, setAddUserMessage] = useState("");
  const [addUserSuccess, setAddUserSuccess] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  
  // Feature Requests states
  const [featureRequests, setFeatureRequests] = useState<any[]>([]);
  const [isLoadingFeatureRequests, setIsLoadingFeatureRequests] = useState(false);
  
  // Fetch users from the API
  const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    } else {
      console.error('Error fetching users:', response.status);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
  
  // Fetch feature requests from the API
  const fetchFeatureRequests = async () => {
    setIsLoadingFeatureRequests(true);
    try {
      const response = await fetch('/api/feature-requests');
      if (response.ok) {
        const data = await response.json();
        setFeatureRequests(data);
      }
    } catch (error) {
      console.error('Error fetching feature requests:', error);
    } finally {
      setIsLoadingFeatureRequests(false);
    }
  };
  
  // Add a new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail) {
      setAddUserMessage("Please enter an email address");
      setAddUserSuccess(false);
      return;
    }
    
    setIsAddingUser(true);
    setAddUserMessage("");
    
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          isAdmin: newUserIsAdmin,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAddUserSuccess(true);
        setAddUserMessage("User added successfully");
        setNewUserEmail("");
        setNewUserIsAdmin(false);
        setShowAddUserDialog(false);
        
        // Refresh the user list
        fetchUsers();
      } else {
        setAddUserSuccess(false);
        setAddUserMessage(data.message || "Error adding user");
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setAddUserSuccess(false);
      setAddUserMessage("Error adding user");
    } finally {
      setIsAddingUser(false);
    }
  };
  
  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
      
      // Check if current user is admin (in a real app, this would be verified server-side)
      const currentUser = mockUsers.find(user => user.email === storedEmail);
      if (currentUser?.isAdmin) {
        setIsAdmin(true);
        
        // Load master API key
        const savedMasterApiKey = localStorage.getItem('master_gemini_api_key');
        if (savedMasterApiKey) {
          setMasterApiKey(savedMasterApiKey);
        }
        
        // Fetch users and feature requests
        fetchUsers();
        fetchFeatureRequests();
      } else {
        // Redirect non-admin users to dashboard
        router.push("/dashboard");
      }
    } else {
      // If no email is found, redirect to home page
      router.push("/");
    }
  }, [router]);
  
  // Save the Master Gemini API key
  const saveMasterApiKey = async () => {
    if (!masterApiKey) {
      setMasterApiKeySaveMessage("Please enter an API key");
      setMasterApiKeySaveSuccess(false);
      return;
    }
    
    setIsSavingMasterApiKey(true);
    setMasterApiKeySaveMessage("");
    
    try {
      // In a real app, we would save this to a database via an API call
      // For now, we'll just save it to localStorage
      localStorage.setItem('master_gemini_api_key', masterApiKey);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Saved Master Gemini API key");
      setMasterApiKeySaveMessage("Master API key saved successfully");
      setMasterApiKeySaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMasterApiKeySaveMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving Master API key:", error);
      setMasterApiKeySaveMessage("Error saving Master API key");
      setMasterApiKeySaveSuccess(false);
    } finally {
      setIsSavingMasterApiKey(false);
    }
  };

  // Toggle user active status
  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  // Toggle user admin status
  const toggleUserAdminStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
    ));
  };

  // Toggle user history access
  const toggleUserHistoryAccess = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, historyAccess: !user.historyAccess } : user
    ));
  };

  // Toggle user account access
  const toggleUserAccountAccess = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, accountAccess: !user.accountAccess } : user
    ));
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
              <TabsTrigger value="feature-requests">Feature Requests</TabsTrigger>
              <TabsTrigger value="logs">API Logs</TabsTrigger>
              <TabsTrigger value="stripe-testing">Stripe Testing</TabsTrigger>
              <TabsTrigger value="master-api-key">Master API Key</TabsTrigger>
              <TabsTrigger value="back" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user access and permissions</CardDescription>
                  </div>
                  <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="ml-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the system. They will be granted access to the tool.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddUser}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="new-user-email">Email</Label>
                            <Input
                              id="new-user-email"
                              type="email"
                              placeholder="user@example.com"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="new-user-admin"
                              checked={newUserIsAdmin}
                              onCheckedChange={(checked) => setNewUserIsAdmin(checked === true)}
                            />
                            <Label htmlFor="new-user-admin">Grant admin privileges</Label>
                          </div>
                          {addUserMessage && (
                            <p className={`text-sm ${addUserSuccess ? "text-green-500" : "text-red-500"}`}>
                              {addUserMessage}
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setShowAddUserDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isAddingUser}>
                            {isAddingUser ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add User"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                          <TableHead>Admin</TableHead>
                          <TableHead>History Access</TableHead>
                          <TableHead>Account Access</TableHead>
                          <TableHead>Active Status</TableHead>
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
                                  <Checkbox 
                                    checked={user.isAdmin}
                                    onCheckedChange={() => toggleUserAdminStatus(user.id)}
                                    disabled={user.email === userEmail} // Prevent admin from changing their own admin status
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={user.historyAccess}
                                    onCheckedChange={() => toggleUserHistoryAccess(user.id)}
                                    disabled={user.isAdmin} // Admins always have access
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={user.accountAccess}
                                    onCheckedChange={() => toggleUserAccountAccess(user.id)}
                                    disabled={user.isAdmin} // Admins always have access
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={user.isActive}
                                    onCheckedChange={() => toggleUserStatus(user.id)}
                                    disabled={user.isAdmin && user.email === userEmail} // Prevent admin from deactivating themselves
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
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
            
            <TabsContent value="feature-requests">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Requests</CardTitle>
                  <CardDescription>View and manage user feature requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFeatureRequests ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : featureRequests.length > 0 ? (
                    <div className="space-y-6">
                      {featureRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{request.user.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(request.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="whitespace-pre-wrap">{request.content}</p>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <Badge variant={
                              request.status === 'approved' ? 'secondary' : 
                              request.status === 'rejected' ? 'destructive' : 
                              'outline'
                            }>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No feature requests found
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={fetchFeatureRequests}
                    disabled={isLoadingFeatureRequests}
                  >
                    {isLoadingFeatureRequests ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      "Refresh Feature Requests"
                    )}
                  </Button>
                </CardFooter>
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
            
            <TabsContent value="master-api-key">
              <Card>
                <CardHeader>
                  <CardTitle>Master API Key Management</CardTitle>
                  <CardDescription>Configure a shared Gemini API key for all users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">About Master API Key</h4>
                      <p className="text-sm text-muted-foreground">
                        The Master API Key is a shared Google Gemini API key that will be used by all users who don't have their own API key.
                        Users with the Master API key are limited to 10 resume analysis completions per day, while users with their own API key
                        have unlimited requests (subject only to Gemini's rate limits).
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="master-gemini-api-key">Google Gemini API Key</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="master-gemini-api-key" 
                          type="password" 
                          placeholder="Enter the Master Gemini API key" 
                          value={masterApiKey}
                          onChange={(e) => setMasterApiKey(e.target.value)}
                        />
                        <Button 
                          onClick={saveMasterApiKey} 
                          disabled={isSavingMasterApiKey}
                          size="sm"
                        >
                          {isSavingMasterApiKey ? "Saving..." : "Save"}
                        </Button>
                      </div>
                      {masterApiKeySaveMessage && (
                        <p className={`text-sm mt-1 ${masterApiKeySaveSuccess ? "text-green-500" : "text-red-500"}`}>
                          {masterApiKeySaveMessage}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Get a Gemini API key from{" "}
                        <a 
                          href="https://aistudio.google.com/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-primary"
                        >
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                    
                    <Alert>
                      <AlertTitle>Usage Policy</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">
                          When users utilize the Master API key, they are limited to 10 resume analysis completions per day.
                          This helps manage costs and prevents abuse of the shared API key.
                        </p>
                        <p>
                          Users can add their own Gemini API key in their account settings to get unlimited requests,
                          subject only to Google's rate limits for their personal API key.
                        </p>
                      </AlertDescription>
                    </Alert>
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
