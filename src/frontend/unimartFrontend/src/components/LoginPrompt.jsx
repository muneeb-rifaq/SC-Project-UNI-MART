// ============================================================================
// LoginPrompt.jsx - Hovering Login Modal
// ============================================================================
// This component displays a centered modal prompting users to log in.
// It appears when the user is not authenticated.
// Shows different messages for initial login vs session expiration.
// ============================================================================

import { useState } from "react";
import { login } from "../utils/apiHandler";
import "./LoginPrompt.css";

const LoginPrompt = ({ onLoginSuccess, sessionExpired = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = await login(email, password);
      console.log("✅ Login successful:", loginData);

      // Notify parent component of successful login
      if (onLoginSuccess) {
        onLoginSuccess(loginData);
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        {sessionExpired ? (
          <>
            <h2>🔐 Session Expired</h2>
            <p className="login-subtitle session-expired">
              Your session has expired or your credentials are no longer valid.
              <br />
              Please log in again to continue.
            </p>
          </>
        ) : (
          <>
            <h2>🔐 Login Required</h2>
            <p className="login-subtitle">Please log in to continue</p>
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPrompt;
