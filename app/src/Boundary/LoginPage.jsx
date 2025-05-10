import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Select ...');
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

        // Determine redirect path based on the role confirmed by the backend
        switch (data.role) {
          case 'UserAdmin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'Cleaner':
            navigate('/cleaner/dashboard', { replace: true });
            break;
          case 'HomeOwner':
            navigate('/home/dashboard', { replace: true });
            break;
          case 'PlatformManager':
            navigate('/platform/dashboard', { replace: true });
            break;
          default:
            console.warn(`Login successful, but no specific dashboard route for role: ${data.role}. Redirecting to root.`);
            navigate('/', { replace: true });
            break;
        }
      } else {
        console.error('Login failed:', data);
        setError(data.message || 'Login failed. Please check your credentials and selected role.');
      }
    } catch (err) {
      console.error('Login API call failed:', err);
      setError('An unexpected error occurred during login.');
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
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required/>
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        </div>
        <div>
          <label htmlFor="role">Login as:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Select ...</option>
            <option value="UserAdmin">UserAdmin</option>
            <option value="Cleaner">Cleaner</option>
            <option value="HomeOwner">HomeOwner</option>
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