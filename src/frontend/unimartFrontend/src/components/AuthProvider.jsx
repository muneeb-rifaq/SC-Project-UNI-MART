// ============================================================================
// AuthProvider.jsx - Authentication Context Provider
// ============================================================================
// This component wraps the app and manages authentication state.
// It automatically shows the LoginPrompt if the user is not authenticated.
// ============================================================================

import { useState, useEffect, createContext, useContext } from "react";
import { isAuthenticated, getCurrentUser, logout, setSessionExpiredCallback } from "../utils/apiHandler";
import LoginPrompt from "./LoginPrompt";

// Create auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);

      if (isAuth) {
        setUser(getCurrentUser());
      }

      setLoading(false);
    };

    checkAuth();
    
    // Register session expiration callback
    setSessionExpiredCallback(() => {
      console.log("🔐 Session expired - forcing re-login");
      setAuthenticated(false);
      setUser(null);
      setSessionExpired(true);
    });
  }, []);

  const handleLoginSuccess = (loginData) => {
    setAuthenticated(true);
    setUser({
      email: loginData.email,
      role: loginData.role,
      userId: loginData.userId,
    });
    setSessionExpired(false); // Clear session expired flag
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, authenticated, logout: handleLogout }}>
      {!authenticated && (
        <LoginPrompt 
          onLoginSuccess={handleLoginSuccess} 
          sessionExpired={sessionExpired}
        />
      )}
      {authenticated && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
