import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  let username = 'Admin';
  const storedUser = localStorage.getItem('loggedInUser');
  if (storedUser) {
    try {
      username = JSON.parse(storedUser).username || username;
    } catch (e) { console.error("Couldn't parse user for dashboard"); }
  }

  return (
    <div>
      <h2>UserAdmin Dashboard</h2>
      <p>Welcome, {username}! ☆</p>
      <nav>
        <ul>
          <li><Link to="/admin/accounts">Manage User Accounts</Link></li>
          <li><Link to="/admin/profiles">Manage User Profiles</Link></li>
        </ul>
      </nav>
      <button onClick={handleLogoutClick} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default AdminDashboard;