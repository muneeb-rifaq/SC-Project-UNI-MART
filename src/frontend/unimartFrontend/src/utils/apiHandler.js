// ============================================================================
// apiHandler.js - Centralized API Communication Handler
// ============================================================================
// This module manages all communication between the React app and Express API.
// It handles:
// - Authentication state (email, verificationKey, role in localStorage)
// - Automatic login prompt if credentials are missing
// - All API requests with automatic auth header injection
// ============================================================================

const API_BASE_URL = "http://localhost:3000/api";

// Session expiration callback - will be set by AuthProvider
let onSessionExpired = null;

/**
 * Register callback for session expiration
 * @param {Function} callback - Function to call when session expires
 */
export const setSessionExpiredCallback = (callback) => {
  onSessionExpired = callback;
};

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Check if user is authenticated (has valid session in localStorage)
 */
export const isAuthenticated = () => {
  const email = localStorage.getItem("userEmail");
  const key = localStorage.getItem("verificationKey");
  const role = localStorage.getItem("userRole");

  return !!(email && key && role);
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    "x-user-email": localStorage.getItem("userEmail") || "",
    "x-user-key": localStorage.getItem("verificationKey") || "",
    "x-user-role": localStorage.getItem("userRole") || "",
  };
};

/**
 * Save login session to localStorage
 */
export const saveSession = (loginResponse) => {
  const { email, verificationKey, role, userId } = loginResponse;

  localStorage.setItem("userEmail", email);
  localStorage.setItem("verificationKey", verificationKey);
  localStorage.setItem("userRole", role);
  localStorage.setItem("userId", userId);

  console.log("✅ Session saved:", { email, role, userId });
};

/**
 * Clear login session from localStorage
 */
export const clearSession = () => {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("verificationKey");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");

  console.log("🔒 Session cleared");
};

/**
 * Get current user info from localStorage
 */
export const getCurrentUser = () => {
  return {
    email: localStorage.getItem("userEmail"),
    role: localStorage.getItem("userRole"),
    userId: localStorage.getItem("userId"),
  };
};

// ============================================================================
// API REQUEST HANDLER
// ============================================================================

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., "/buyer/products")
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {object} body - Request body (optional)
 * @returns {Promise<object>} - Response data
 */
export const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    // Check authentication before making request
    if (!isAuthenticated()) {
      throw new Error("NOT_AUTHENTICATED");
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: getAuthHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`📡 API Request: ${method} ${endpoint}`);

    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, data);
      
      // Check for authentication/authorization errors
      const errorMessage = data?.error || '';
      const isAuthError = 
        response.status === 401 || 
        response.status === 403 || 
        errorMessage.toLowerCase().includes('verification key') ||
        errorMessage.toLowerCase().includes('not authorized') ||
        errorMessage.toLowerCase().includes('invalid key') ||
        errorMessage.toLowerCase().includes('authentication');
      
      if (isAuthError) {
        console.warn("🔐 Session expired or invalid - triggering re-login");
        // Clear invalid session
        clearSession();
        // Trigger session expired callback
        if (onSessionExpired) {
          onSessionExpired();
        }
      }
      
      throw new Error(
        data?.error || `Request failed with status ${response.status}`
      );
    }

    console.log(`✅ API Response: ${method} ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error("💥 API Request failed:", error);
    throw error;
  }
};

// ============================================================================
// LOGIN API
// ============================================================================

/**
 * Login user and save session
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - Login response with user details
 */
export const login = async (email, password) => {
  try {
    const url = `${API_BASE_URL.replace("/api", "")}/api/login`;

    console.log("🔐 Attempting login for:", email);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Login failed:", data);
      throw new Error(data?.error || "Login failed");
    }

    // Extract login details
    const loginDetails = data.loginOnlyDetails;

    if (!loginDetails || !loginDetails.verificationKey) {
      throw new Error("Invalid login response");
    }

    // Save session to localStorage
    saveSession(loginDetails);

    console.log("✅ Login successful:", loginDetails.email);
    return loginDetails;
  } catch (error) {
    console.error("💥 Login error:", error);
    throw error;
  }
};

/**
 * Logout user and clear session
 */
export const logout = () => {
  clearSession();
  console.log("👋 User logged out");
};

// ============================================================================
// CONVENIENCE METHODS FOR COMMON OPERATIONS
// ============================================================================

export const api = {
  // GET request
  get: (endpoint) => apiRequest(endpoint, "GET"),

  // POST request
  post: (endpoint, body) => apiRequest(endpoint, "POST", body),

  // PATCH request
  patch: (endpoint, body) => apiRequest(endpoint, "PATCH", body),

  // DELETE request
  delete: (endpoint) => apiRequest(endpoint, "DELETE"),
};
