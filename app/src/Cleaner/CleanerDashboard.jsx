import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Dashboard component for users with the 'Cleaner' role.
 * Provides navigation to service management and other cleaner-specific features.
 */
function CleanerDashboard({ onLogout }) {
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
      <h2>Cleaner Dashboard</h2>
      <p>Welcome back, {username}!</p>
      <nav>
        <ul>
          <li>
            <Link to="/cleaner/services">Manage My Services</Link>
          </li>
          <li>
            <Link to="/cleaner/stats">View Stats</Link>
          </li>
          <li>
            <Link to="/cleaner/booking-history">View Booking History</Link>
          </li>
        </ul>
      </nav>
      <button onClick={handleLogoutClick} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
}

export default CleanerDashboard;