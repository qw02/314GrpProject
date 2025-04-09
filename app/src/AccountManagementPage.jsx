// client/src/AccountManagementPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Helper Function for API Calls (Assumes Vite Proxy setup) ---
// (Keep the proxy-compatible version from the previous step)
async function apiCall(url, method = 'GET', body = null) {
  const apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;
  const options = { method, headers: {} };
  if (body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
  try {
    const response = await fetch(apiUrl, options);
    const contentType = response.headers.get("content-type");
    let data;
    if (response.status === 204) { return { message: `Operation successful (Status: ${response.status})` }; }
    if (contentType && contentType.indexOf("application/json") !== -1) { data = await response.json(); }
    else { const textResponse = await response.text(); if (!response.ok) { throw new Error(textResponse || `HTTP error! status: ${response.status}`); } return { message: textResponse || `Operation successful (Status: ${response.status})` }; }
    if (!response.ok) { throw new Error(data.message || `HTTP error! status: ${response.status}`); }
    return data;
  } catch (error) { console.error(`API call failed: ${method} ${apiUrl}`, error); throw error; }
}


function AccountManagementPage() {
  const [activeTab, setActiveTab] = useState('search'); // 'create', 'search', 'details'
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [isFetchingDetails, setIsFetchingDetails] = useState(false); // Specific loading for fetching details

  // --- Create State ---
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('HomeOwner'); // Default role

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRoleFilter, setSearchRoleFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Now stores array of usernames (string[])

  // --- Details/Update/Suspend State ---
  // Stores the full account details fetched after selecting a username
  const [selectedAccount, setSelectedAccount] = useState(null); // { username, role, isActive, createdAt }
  const [updatePassword, setUpdatePassword] = useState('');


  const clearMessages = () => setMessage({ text: '', type: '' });
  const showMessage = (text, type = 'error') => setMessage({ text, type });

  // --- Handler Functions ---

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    try {
      // Assuming create endpoint still takes role in body, adjust if needed
      // Assuming endpoint is POST /api/useradmin/account
      const result = await apiCall('/api/useradmin/account', 'POST', {
        username: createUsername,
        password: createPassword,
        role: createRole,
      });
      showMessage(result.message || 'Account created successfully!', 'success');
      setCreateUsername('');
      setCreatePassword('');
      setCreateRole('HomeOwner');
    } catch (error) {
      showMessage(error.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAccounts = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    setSearchResults([]); // Clear previous results
    setSelectedAccount(null); // Clear selected account when starting new search
    setActiveTab('search'); // Ensure search tab is active

    let url = `/api/useradmin/accounts/search?q=${encodeURIComponent(searchTerm)}`;
    if (searchRoleFilter) {
      url += `&role=${encodeURIComponent(searchRoleFilter)}`;
    }
    try {
      // Expects an array of strings (usernames)
      const results = await apiCall(url);
      setSearchResults(results);
      if (results.length === 0) {
        showMessage('No accounts found matching criteria.', 'info');
      }
    } catch (error) {
      showMessage(error.message || 'Failed to search accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Function to fetch details when a username is selected
  const fetchAccountDetails = async (username) => {
    if (!username) return;
    setIsFetchingDetails(true); // Start details fetching indicator
    setSelectedAccount(null); // Clear previous selection details
    clearMessages();
    try {
      // Use the new endpoint: GET /api/useradmin/account/:username/
      const accountData = await apiCall(`/api/useradmin/account/${username}/`, 'GET');
      setSelectedAccount(accountData); // Store the fetched details
      setUpdatePassword(''); // Clear password field
      setActiveTab('details'); // Switch to details tab
    } catch (error) {
      showMessage(error.message || `Failed to fetch details for ${username}.`, 'error');
      setActiveTab('search'); // Stay on search tab or handle error appropriately
    } finally {
      setIsFetchingDetails(false); // Stop details fetching indicator
    }
  };


  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!selectedAccount || !updatePassword) {
      showMessage('Please select an account and enter a new password.', 'warn');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      // Use the username from selectedAccount for the URL
      // Assuming PUT /api/useradmin/account/:username/
      const result = await apiCall(
        `/api/useradmin/account/${selectedAccount.username}/`, // Use only username
        'PUT',
        { password: updatePassword }
      );
      showMessage(result.message || 'Password updated successfully!', 'success');
      setUpdatePassword('');
    } catch (error) {
      showMessage(error.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendAccount = async () => {
    if (!selectedAccount) return;
    if (!window.confirm(`Are you sure you want to suspend account: ${selectedAccount.username}?`)) return;

    setIsLoading(true);
    clearMessages();
    try {
      // Assuming PUT /api/useradmin/account/:username/suspend
      const result = await apiCall(
        `/api/useradmin/account/${selectedAccount.username}/suspend`, // Use only username
        'PUT'
      );
      showMessage(result.message || 'Account suspended successfully!', 'success');
      setSelectedAccount({ ...selectedAccount, isActive: false }); // Update local state
    } catch (error) {
      showMessage(error.message || 'Failed to suspend account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateAccount = async () => {
    if (!selectedAccount) return;
    if (!window.confirm(`Are you sure you want to reactivate account: ${selectedAccount.username}?`)) return;

    setIsLoading(true);
    clearMessages();
    try {
      // Assuming PUT /api/useradmin/account/:username/reactivate
      const result = await apiCall(
        `/api/useradmin/account/${selectedAccount.username}/reactivate`, // Use only username
        'PUT'
      );
      showMessage(result.message || 'Account reactivated successfully!', 'success');
      setSelectedAccount({ ...selectedAccount, isActive: true }); // Update local state
    } catch (error) {
      showMessage(error.message || 'Failed to reactivate account.');
    } finally {
      setIsLoading(false);
    }
  };


  // --- Render Logic ---
  return (
    <div>
      <Link to="/admin/dashboard">← Back to Dashboard</Link>
      <h2>Manage User Accounts</h2>

      <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
        <button onClick={() => { setActiveTab('create'); setSelectedAccount(null); clearMessages(); }} disabled={activeTab === 'create'}>Create</button>
        <button onClick={() => { setActiveTab('search'); setSelectedAccount(null); clearMessages(); }} disabled={activeTab === 'search'}>Search</button>
        <button onClick={() => setActiveTab('details')} disabled={activeTab === 'details' || !selectedAccount}>View/Update/Suspend</button>
      </div>

      {message.text && (
        <p style={{ color: message.type === 'success' ? 'green' : (message.type === 'info' || message.type === 'warn' ? 'orange' : 'red') }}>
          {message.text}
        </p>
      )}

      {(isLoading || isFetchingDetails) && <p>Loading...</p>}

      {/* Create Tab */}
      {activeTab === 'create' && !isLoading && (
        <div>
          <h3>Create New User Account</h3>
          <form onSubmit={handleCreateAccount}>
            <div>
              <label>Username: </label>
              <input type="text" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} required />
            </div>
            <div>
              <label>Password: </label>
              <input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} required />
            </div>
            <div>
              <label>Role: </label>
              <select value={createRole} onChange={(e) => setCreateRole(e.target.value)}>
                <option value="HomeOwner">Home Owner</option>
                <option value="Cleaner">Cleaner</option>
                <option value="UserAdmin">User Admin</option> {/* Updated Role Name */}
                <option value="PlatformManager">Platform Manager</option>
              </select>
            </div>
            <button type="submit">Create Account</button>
          </form>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && !isLoading && (
        <div>
          <h3>Search User Accounts</h3>
          <form onSubmit={handleSearchAccounts}>
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={searchRoleFilter} onChange={(e) => setSearchRoleFilter(e.target.value)} style={{ marginLeft: '10px' }}>
              <option value="">Any Role</option>
              <option value="HomeOwner">Home Owner</option>
              <option value="Cleaner">Cleaner</option>
              <option value="UserAdmin">User Admin</option> {/* Updated Role Name */}
              <option value="PlatformManager">Platform Manager</option>
            </select>
            <button type="submit" style={{ marginLeft: '10px' }}>Search</button>
          </form>
          <h4>Results:</h4>
          {searchResults.length > 0 ? (
            <ul>
              {/* Iterate over the array of usernames (strings) */}
              {searchResults.map((username) => (
                <li key={username}>
                  {username}
                  {/* Button now triggers fetching details for the clicked username */}
                  <button onClick={() => fetchAccountDetails(username)} style={{ marginLeft: '10px' }} disabled={isFetchingDetails}>
                    {isFetchingDetails ? 'Loading...' : 'View/Manage'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !message.text && <p>No results to display. Perform a search.</p>
          )}
        </div>
      )}

      {/* Details/Update/Suspend Tab */}
      {/* Show only when not generally loading AND details are not currently being fetched */}
      {activeTab === 'details' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Account Details & Management</h3>
          {selectedAccount ? (
            <div>
              {/* Display details from the fetched selectedAccount state */}
              <p><strong>Username:</strong> {selectedAccount.username}</p>
              <p><strong>Role:</strong> {selectedAccount.role}</p>
              <p><strong>Status:</strong> {selectedAccount.isActive ? 'Active' : 'Suspended'}</p>
              {selectedAccount.createdAt && <p><strong>Created At:</strong> {new Date(selectedAccount.createdAt).toLocaleString()}</p>}

              <hr />
              <h4>Update Password</h4>
              <form onSubmit={handleUpdatePassword}>
                <label>New Password: </label>
                <input type="password" value={updatePassword} onChange={(e) => setUpdatePassword(e.target.value)} required />
                <button type="submit">Update Password</button>
              </form>

              <hr />
              <h4>Suspend Account</h4>
              {selectedAccount.isActive ? (
                <button onClick={handleSuspendAccount} style={{ backgroundColor: 'orange' }}>Suspend Account</button>
              ) : null}
            </div>
          ) : (
            // Message shown if the details tab is active but no account is selected/loaded
            <p>Select an account from the Search tab to view details.</p>
          )}
        </div>
      )}
      {/* Show loading indicator specifically when fetching details */}
      {activeTab === 'details' && isFetchingDetails && <p>Fetching account details...</p>}
    </div>
  );
}

export default AccountManagementPage;