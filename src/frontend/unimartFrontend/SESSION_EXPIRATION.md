// ============================================================================
// SESSION EXPIRATION TESTING GUIDE
// ============================================================================
// This document explains how the session expiration feature works and how
// to test it in the UNIMART application.
// ============================================================================

## How It Works

### 1. Authentication Error Detection
The `apiHandler.js` module now detects when backend requests fail due to:
- 401 Unauthorized status
- 403 Forbidden status
- Error messages containing: "verification key", "not authorized", "invalid key", "authentication"

### 2. Automatic Session Clearing
When an authentication error is detected:
- Local storage credentials are immediately cleared
- Session expired callback is triggered
- User is logged out automatically

### 3. Forced Re-Login
The `AuthProvider` component:
- Detects session expiration via callback
- Sets `sessionExpired` state to true
- Shows LoginPrompt with "Session Expired" message
- Prevents users from canceling the login (modal cannot be closed)

### 4. User Experience
- **Initial Login**: Shows "Login Required - Please log in to continue"
- **Session Expired**: Shows "Session Expired - Your session has expired or your credentials are no longer valid. Please log in again to continue."
- The expired session message has a warning background (yellow/orange)

## Testing the Feature

### Method 1: Manual Backend Simulation
1. Start the frontend: `npm run dev`
2. Log in with valid credentials
3. Stop the backend server
4. Try to perform any action (view products, create order, etc.)
5. The system should detect the connection failure and show login prompt

### Method 2: Invalid Key Simulation
1. Log in successfully
2. Open browser DevTools → Application → Local Storage
3. Manually change the `verificationKey` value to something invalid
4. Try to perform any action
5. Backend will return 401/403 error
6. System will automatically show "Session Expired" login prompt

### Method 3: Backend Session Timeout
If your backend has session timeout logic:
1. Log in successfully
2. Wait for the session timeout period
3. Try to perform any action
4. System will detect invalid session and force re-login

## Code Changes Summary

### apiHandler.js
- Added `setSessionExpiredCallback()` function
- Enhanced error detection in `apiRequest()` to identify auth failures
- Automatically clears invalid sessions
- Triggers callback when session expires

### AuthProvider.jsx
- Added `sessionExpired` state
- Registers callback with `setSessionExpiredCallback()`
- Passes `sessionExpired` flag to LoginPrompt
- Clears flag on successful re-login

### LoginPrompt.jsx
- Accepts `sessionExpired` prop
- Shows different message for session expiration
- Styled with warning colors for expired session message

## Error Messages That Trigger Session Expiration

The system will force re-login for these error patterns:
- "verification key is invalid"
- "not authorized"
- "invalid key"
- "authentication failed"
- HTTP 401 Unauthorized
- HTTP 403 Forbidden

## Notes for Developers

1. The login modal CANNOT be closed when session expires - user must re-authenticate
2. All localStorage credentials are cleared on session expiration
3. Session expiration is logged to console: "🔐 Session expired - forcing re-login"
4. After successful re-login, the user continues where they left off
5. The feature works across all user roles (buyer, seller, admin)
