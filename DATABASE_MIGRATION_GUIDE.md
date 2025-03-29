# Database Migration Guide for AWS

This guide outlines all the locations in the codebase that need to be updated when migrating from the current setup to AWS with a proper database.

## Database Configuration Updates

### 1. Prisma Schema (`prisma/schema.prisma`)
- Update the database provider from `sqlite` to `postgresql` (or your preferred AWS database)
- Change the connection URL to use an environment variable:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Prisma Client Setup (`src/lib/prisma.ts`)
- Add connection pooling for production environments
- Add error handling for database connection failures
- Consider adding logging for database operations in production

## Temporary Access Removal

### 1. Dashboard Admin Access (`src/pages/dashboard.tsx`)
- Remove the client-side admin checks for hardcoded emails:
```javascript
// Remove these blocks:
if (email.toLowerCase() === "admin@example.com" || email.toLowerCase() === "tray14@hotmail.com") {
  console.log("Dashboard: Setting admin status to true for:", email);
  setIsAdmin(true);
}
```
- Replace with server-side verification using the database:
```javascript
// Add an API endpoint to check admin status
const checkAdminStatus = async (email) => {
  try {
    const response = await fetch('/api/users/check-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    setIsAdmin(data.isAdmin);
  } catch (error) {
    console.error('Error checking admin status:', error);
    setIsAdmin(false);
  }
};
```

### 2. API Hardcoded Access (`src/pages/api/check-subscription.ts` and `src/pages/api/send-magic-link.ts`)
- Remove the hardcoded access for specific emails:
```javascript
// Remove these blocks:
if (email === "tray14@hotmail.com") {
  console.log(`[${requestId}] Hard-coded access granted for email: ${email}`);
  return res.status(200).json({
    hasSubscription: true,
    requestId
  });
}
```
- Replace with database checks for subscription status

## API Key Storage

### 1. API Key Management (`src/pages/dashboard.tsx`)
- Update the `loadGeminiApiKey` function to fetch from the database instead of localStorage
- Update the `saveGeminiApiKey` function to save to the database instead of localStorage
- Create new API endpoints for these operations:
  - `/api/users/get-api-key`
  - `/api/users/save-api-key`

## Database Schema Updates

### 1. User Model Updates
- Consider adding a field for the Gemini API key:
```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  isActive      Boolean        @default(true)
  isAdmin       Boolean        @default(false)
  historyAccess Boolean        @default(true)
  accountAccess Boolean        @default(true)
  geminiApiKey  String?        // Add this field
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  featureRequests FeatureRequest[]
}
```

### 2. Additional Models to Consider
- Resume history storage
- Subscription tracking
- User sessions/authentication

## Environment Variables

Ensure these environment variables are set in your AWS environment:

1. `DATABASE_URL` - PostgreSQL connection string
2. `STRIPE_SECRET_KEY` - For Stripe integration
3. `STRIPE_PRODUCT_ID` - For subscription checks
4. `NEXTAUTH_SECRET` (if implementing NextAuth) - For authentication
5. `NEXTAUTH_URL` (if implementing NextAuth) - For authentication

## API Routes to Create/Update

1. User Management:
   - `/api/users/check-admin` - Check if a user has admin privileges
   - `/api/users/get-api-key` - Get a user's Gemini API key
   - `/api/users/save-api-key` - Save a user's Gemini API key

2. Authentication:
   - Consider implementing proper authentication with NextAuth.js or similar

3. Resume History:
   - Create endpoints for saving and retrieving resume optimization history

## Testing After Migration

1. Test user creation and management
2. Test subscription verification
3. Test API key storage and retrieval
4. Test admin access controls
5. Test feature request submission and retrieval