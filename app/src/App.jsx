import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './LoginPage'; // Assumes LoginPage.js is in ./src
import AdminDashboard from './AdminDashboard'; // Assumes AdminDashboard.js is in ./src
import AccountManagementPage from './AccountManagementPage'; // Assumes AccountManagementPage.js is in ./src
import ProfileManagementPage from './ProfileManagementPage'; // Assumes ProfileManagementPage.js is in ./src

// ProtectedAdminRoute component remains the same...
function ProtectedAdminRoute() {
  // ... (implementation from previous step)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData && userData.role === 'UserAdmin') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        localStorage.removeItem('loggedInUser');
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}


function App() {
  // ... (state and handlers remain the same as previous step)
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        setLoggedInUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user data", e);
        localStorage.removeItem('loggedInUser');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    setLoggedInUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setLoggedInUser(null);
    console.log("User logged out from App level.");
  };

  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>Cleaner Matching Platform - UserAdmin</h1>
        <Routes>
          {/* Login Page */}
          <Route
            path="/login"
            element={loggedInUser ? <Navigate to={loggedInUser.role === 'UserAdmin' ? "/admin/dashboard" : "/"} replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard onLogout={handleLogout} />} />
            <Route path="/admin/accounts" element={<AccountManagementPage />} />
            <Route path="/admin/profiles" element={<ProfileManagementPage />} />
          </Route>

          {/* Redirect root */}
          <Route
            path="/"
            element={
              loggedInUser
                ? (loggedInUser.role === 'UserAdmin' ? <Navigate to="/admin/dashboard" replace /> : <div>Welcome {loggedInUser.role}! (Non-admin area)</div>)
                : <Navigate to="/login" replace />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;