import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLoginSuccess }) {
  // ... state variables ...
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HomeOwner');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        onLoginSuccess(data);

        if (data.role === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login API call failed:', err);
      // Check if the error message suggests a network issue vs. proxy issue
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error or backend server unreachable. (Check proxy/server status)');
      } else {
        setError('Failed to connect to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="role">Login as:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="HomeOwner">HomeOwner</option>
            <option value="Cleaner">Cleaner</option>
            <option value="UserAdmin">UserAdmin</option>
            <option value="PlatformManager">Platform Manager</option>
          </select>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
export default LoginPage;