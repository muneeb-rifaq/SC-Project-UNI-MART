// ============================================================================
// App.jsx - Main Application Component
// ============================================================================
// Wrapped with AuthProvider to manage authentication state.
// Shows LoginPrompt automatically when user is not authenticated.
// Routes users to appropriate dashboard based on role.
// ============================================================================

import { AuthProvider, useAuth } from "./components/AuthProvider";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function AppContent() {
  const { user, logout } = useAuth();

  // Route to appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case "buyer":
        return <BuyerDashboard />;
      case "seller":
        return <SellerDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return (
          <div className="app-container">
            <div className="error-container">
              <h2>⚠️ Unknown Role</h2>
              <p>Your user role "{user.role}" is not recognized.</p>
              <p>Please contact an administrator.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛒 UNIMART</h1>
        <div className="user-info">
          <span>👤 {user.email}</span>
          <span className="user-role">{user.role.toUpperCase()}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">{renderDashboard()}</main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
