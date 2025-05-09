import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Dashboard component for users with the 'HomeOwner' role.
 * Provides navigation to service management and other cleaner-specific features.
 */
function HomeOwnerDashboard({ onLogout }) {
  const navigate = useNavigate();

  // --- Logout Handler ---
  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login', { replace: true });
  };

  let username = '';
  const storedUser = localStorage.getItem('loggedInUser');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      username = userData.username || username;
    } catch (e) {
      console.error("Couldn't parse user data for dashboard:", e);
    }
  }

  // --- Render Logic ---
  return (
    <div>
      <h2>HomeOwner Dashboard</h2>
      <p>Welcome back, {username}!</p>
      <nav>
        <ul>
          <li>
            <Link to="/homeowner/services">Find a Cleaner Service</Link>
          </li>
          <li>
            <Link to="/homeowner/shortlist">View Shortlist</Link>
          </li>
          <li>
            <Link to="/homeowner/history">View Usage history</Link>
          </li>
        </ul>
      </nav>
      <button onClick={handleLogoutClick} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
}

export default HomeOwnerDashboard;