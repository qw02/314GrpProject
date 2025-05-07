import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './LoginPage';
import AdminDashboard from './UserAdmin/AdminDashboard.jsx';
import AccountManagementPage from './UserAdmin/AccountManagementPage.jsx';
import ProfileManagementPage from './UserAdmin/ProfileManagementPage.jsx';
import CleanerDashboard from './Cleaner/CleanerDashboard.jsx';
import ServiceManagementPage from './Cleaner/ServiceManagementPage.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx';
import ProtectedCleanerRoute from './components/ProtectedCleanerRoute.jsx';
import CleanerStatsPage from './Cleaner/CleanerStatsPage.jsx';
import BookingHistoryPage from './Cleaner/BookingHistoryPage.jsx'

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Load user data from localStorage on initial mount
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
    if (userData && userData.username && userData.role) {
      localStorage.setItem('loggedInUser', JSON.stringify(userData));
      setLoggedInUser(userData);
      console.log(`User ${userData.username} (${userData.role}) logged in.`);
    } else {
      console.error("Invalid user data received on login success:", userData);
    }
  };

  const handleLogout = () => {
    const user = loggedInUser;
    localStorage.removeItem('loggedInUser');
    setLoggedInUser(null);
  };

  const getRedirectPath = (user) => {
    if (!user) return "/login";
    switch (user.role) {
      case 'UserAdmin':
        return "/admin/dashboard";
      case 'Cleaner':
        return "/cleaner/dashboard";
      case 'HomeOwner':
        return "/home/dashboard";
      case 'PlatformManager':
        return "/platform/dashboard";
      default:
        console.warn(`No specific dashboard route defined for role: ${user.role}. Redirecting to root.`);
        return "/";
    }
  };

  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>Cleaner Matching Platform {loggedInUser ? `(${loggedInUser.role} View)` : ''}</h1>

        <Routes>
          {/* --- Public Routes --- */}
          <Route
            path="/login"
            // If already logged in, redirect away from login page
            element={loggedInUser ? <Navigate to={getRedirectPath(loggedInUser)} replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
          />

          {/* --- Admin Protected Routes --- */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard onLogout={handleLogout} />} />
            <Route path="/admin/accounts" element={<AccountManagementPage />} />
            <Route path="/admin/profiles" element={<ProfileManagementPage />} />
          </Route>

          {/* --- Cleaner Protected Routes --- */}
          <Route element={<ProtectedCleanerRoute />}>
            <Route path="/cleaner/dashboard" element={<CleanerDashboard onLogout={handleLogout} />} />
            <Route path="/cleaner/services" element={<ServiceManagementPage />} />
            <Route path="/cleaner/stats" element={<CleanerStatsPage />} />
            <Route path="/cleaner/booking-history" element={<BookingHistoryPage />} />
          </Route>

          {/* --- Root Path Handling --- */}
          <Route
            path="/"
            element={
              loggedInUser
                // Redirect logged-in users to their respective dashboards
                ? <Navigate to={getRedirectPath(loggedInUser)} replace />
                // If not logged in, redirect to login
                : <Navigate to="/login" replace />
            }
          />

          {/* --- Fallback Route --- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;