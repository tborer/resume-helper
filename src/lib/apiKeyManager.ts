// Utility functions for API key management and usage tracking

// Interface for API key usage
interface ApiKeyUsage {
  count: number;
  lastReset: string; // ISO date string
}

// Get the master API key from localStorage
export const getMasterApiKey = (): string => {
  return localStorage.getItem('master_gemini_api_key') || '';
};

// Get the user's personal API key from localStorage
export const getUserApiKey = (userEmail: string): string => {
  return localStorage.getItem(`gemini_api_key_${userEmail}`) || '';
};

// Get the appropriate API key to use (user's key first, then master key)
export const getApiKeyToUse = (userEmail: string): { 
  key: string; 
  isMasterKey: boolean;
} => {
  const userKey = getUserApiKey(userEmail);
  
  // If user has their own key, use it
  if (userKey) {
    return { key: userKey, isMasterKey: false };
  }
  
  // Otherwise, use the master key
  const masterKey = getMasterApiKey();
  return { key: masterKey, isMasterKey: true };
};

// Track usage of the master API key
export const trackMasterKeyUsage = (userEmail: string): boolean => {
  try {
    // Get current usage data
    const usageKey = `master_key_usage_${userEmail}`;
    const usageData = localStorage.getItem(usageKey);
    let usage: ApiKeyUsage;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (usageData) {
      usage = JSON.parse(usageData);
      
      // Check if we need to reset the counter (new day)
      if (usage.lastReset !== today) {
        usage = { count: 0, lastReset: today };
      }
    } else {
      // Initialize usage data
      usage = { count: 0, lastReset: today };
    }
    
    // Check if user has reached the daily limit
    if (usage.count >= 10) {
      return false; // Limit reached
    }
    
    // Increment usage count
    usage.count += 1;
    
    // Save updated usage data
    localStorage.setItem(usageKey, JSON.stringify(usage));
    
    return true; // Usage tracked successfully
  } catch (error) {
    console.error('Error tracking master key usage:', error);
    return false; // Error occurred
  }
};

// Get remaining daily uses of the master API key
export const getRemainingMasterKeyUses = (userEmail: string): number => {
  try {
    // Get current usage data
    const usageKey = `master_key_usage_${userEmail}`;
    const usageData = localStorage.getItem(usageKey);
    let usage: ApiKeyUsage;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (usageData) {
      usage = JSON.parse(usageData);
      
      // Check if we need to reset the counter (new day)
      if (usage.lastReset !== today) {
        return 10; // New day, full limit available
      }
      
      return Math.max(0, 10 - usage.count);
    }
    
    return 10; // No usage data, full limit available
  } catch (error) {
    console.error('Error getting remaining master key uses:', error);
    return 0; // Error occurred, assume limit reached
  }
};