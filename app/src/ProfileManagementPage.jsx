import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Helper Function for API Calls ---
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


function ProfileManagementPage() {
  const [activeTab, setActiveTab] = useState('search'); // 'create', 'search', 'details'
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false); // General loading
  const [isFetchingDetails, setIsFetchingDetails] = useState(false); // Specific loading for details

  // --- Create State ---
  const [createUsername, setCreateUsername] = useState(''); // Username is required
  // Role is removed from create state
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRoleFilter, setSearchRoleFilter] = useState(''); // Role filter still used for search query
  const [searchResults, setSearchResults] = useState([]); // Stores array of usernames (string[])

  // --- Details/Update/Delete State ---
  // Stores the full profile details fetched after selecting a username
  const [selectedProfile, setSelectedProfile] = useState(null); // { username, firstName, lastName, email, phoneNumber }
  // State for the update form fields, pre-filled from selectedProfile
  const [updateFirstName, setUpdateFirstName] = useState('');
  const [updateLastName, setUpdateLastName] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updatePhone, setUpdatePhone] = useState('');

  const clearMessages = () => setMessage({ text: '', type: '' });
  const showMessage = (text, type = 'error') => setMessage({ text, type });

  // Effect to pre-fill update form when selectedProfile changes
  useEffect(() => {
    if (selectedProfile) {
      setUpdateFirstName(selectedProfile.firstName || '');
      setUpdateLastName(selectedProfile.lastName || '');
      setUpdateEmail(selectedProfile.email || '');
      setUpdatePhone(selectedProfile.phoneNumber || '');
    } else {
      // Clear form if no profile is selected
      setUpdateFirstName('');
      setUpdateLastName('');
      setUpdateEmail('');
      setUpdatePhone('');
    }
  }, [selectedProfile]);

  // --- Handler Functions ---

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!createUsername) {
      showMessage('Username is required to create a profile.', 'warn');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      // Role is removed from the request body
      const result = await apiCall('/api/useradmin/profile', 'POST', {
        username: createUsername,
        firstName: createFirstName,
        lastName: createLastName,
        email: createEmail,
        phoneNumber: createPhone,
      });
      showMessage(result.message || 'Profile created successfully!', 'success');
      // Clear form
      setCreateUsername('');
      setCreateFirstName('');
      setCreateLastName('');
      setCreateEmail('');
      setCreatePhone('');
    } catch (error) {
      showMessage(error.message || 'Failed to create profile. Ensure the User Account exists.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchProfiles = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    setSearchResults([]);
    setSelectedProfile(null); // Clear selection on new search
    setActiveTab('search');

    let url = `/api/useradmin/profiles/search?q=${encodeURIComponent(searchTerm)}`;
    if (searchRoleFilter) {
      url += `&role=${encodeURIComponent(searchRoleFilter)}`;
    }
    try {
      // Expects an array of strings (usernames)
      const results = await apiCall(url);
      setSearchResults(results);
      if (results.length === 0) {
        showMessage('No profiles found matching criteria.', 'info');
      }
    } catch (error) {
      showMessage(error.message || 'Failed to search profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch profile details when a username is selected
  const fetchProfileDetails = async (username) => {
    if (!username) return;
    setIsFetchingDetails(true);
    setSelectedProfile(null); // Clear previous details
    clearMessages();
    try {
      // Use the new endpoint: GET /api/useradmin/profile/:username/
      const profileData = await apiCall(`/api/useradmin/profile/${username}/`, 'GET');
      setSelectedProfile(profileData); // Store fetched details { username, firstName, ... }
      setActiveTab('details'); // Switch to details tab
    } catch (error) {
      showMessage(error.message || `Failed to fetch profile details for ${username}.`, 'error');
      setActiveTab('search'); // Revert to search tab on error
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!selectedProfile) {
      showMessage('Please select a profile first.', 'warn');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      // Use username from selectedProfile for the URL
      // PUT /api/useradmin/profile/:username/
      const result = await apiCall(
        `/api/useradmin/profile/${selectedProfile.username}/`, // Use only username
        'PUT',
        {
          // Send only the profile fields
          firstName: updateFirstName,
          lastName: updateLastName,
          email: updateEmail,
          phoneNumber: updatePhone,
        }
      );
      showMessage(result.message || 'Profile updated successfully!', 'success');
      // Re-fetch details to show updated info
      fetchProfileDetails(selectedProfile.username);
    } catch (error) {
      showMessage(error.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile) return;
    if (!window.confirm(`ARE YOU SURE you want to permanently DELETE the profile for: ${selectedProfile.username}? This cannot be undone.`)) return;

    setIsLoading(true);
    clearMessages();
    try {
      // Use username from selectedProfile for the URL
      // DELETE /api/useradmin/profile/:username/
      const result = await apiCall(
        `/api/useradmin/profile/${selectedProfile.username}/`, // Use only username
        'DELETE'
      );
      showMessage(result.message || 'Profile deleted successfully!', 'success');
      // Clear selection and go back to search
      setSelectedProfile(null);
      setActiveTab('search');
      // Optionally refresh search results
      // handleSearchProfiles({ preventDefault: () => {} });
    } catch (error) {
      showMessage(error.message || 'Failed to delete profile.');
    } finally {
      setIsLoading(false);
    }
  };


  // --- Render Logic ---
  return (
    <div>
      <Link to="/admin/dashboard">← Back to Dashboard</Link>
      <h2>Manage User Profiles</h2>

      <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
        <button onClick={() => { setActiveTab('create'); setSelectedProfile(null); clearMessages(); }} disabled={activeTab === 'create'}>Create</button>
        <button onClick={() => { setActiveTab('search'); setSelectedProfile(null); clearMessages(); }} disabled={activeTab === 'search'}>Search</button>
        <button onClick={() => setActiveTab('details')} disabled={activeTab === 'details' || !selectedProfile}>View/Update/Delete</button>
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
          <h3>Create New User Profile</h3>
          <p style={{fontSize: '0.9em', color: 'gray'}}>Enter the username for an existing User Account.</p>
          <form onSubmit={handleCreateProfile}>
            <div>
              <label>Username: </label>
              <input type="text" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} required />
            </div>
            {/* Role field removed */}
            <div>
              <label>First Name: </label>
              <input type="text" value={createFirstName} onChange={(e) => setCreateFirstName(e.target.value)} />
            </div>
            <div>
              <label>Last Name: </label>
              <input type="text" value={createLastName} onChange={(e) => setCreateLastName(e.target.value)} />
            </div>
            <div>
              <label>Email: </label>
              <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
            </div>
            <div>
              <label>Phone Number: </label>
              <input type="tel" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} />
            </div>
            <button type="submit">Create Profile</button>
          </form>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && !isLoading && (
        <div>
          <h3>Search User Profiles</h3>
          <form onSubmit={handleSearchProfiles}>
            <input
              type="text"
              placeholder="Search name, username, email..." // Search term still used by backend
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={searchRoleFilter} onChange={(e) => setSearchRoleFilter(e.target.value)} style={{ marginLeft: '10px' }}>
              <option value="">Any Role</option>
              <option value="HomeOwner">Home Owner</option>
              <option value="Cleaner">Cleaner</option>
              <option value="UserAdmin">User Admin</option> {/* Updated Role */}
              <option value="PlatformManager">Platform Manager</option>
            </select>
            <button type="submit" style={{ marginLeft: '10px' }}>Search</button>
          </form>
          <h4>Results (Usernames):</h4>
          {searchResults.length > 0 ? (
            <ul>
              {/* Iterate over array of usernames */}
              {searchResults.map((username) => (
                <li key={username}>
                  {username}
                  {/* Button triggers fetching details for the username */}
                  <button onClick={() => fetchProfileDetails(username)} style={{ marginLeft: '10px' }} disabled={isFetchingDetails}>
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

      {/* Details/Update/Delete Tab */}
      {activeTab === 'details' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Profile Details & Management</h3>
          {selectedProfile ? (
            <div>
              {/* Display details from fetched selectedProfile */}
              <p><strong>Username:</strong> {selectedProfile.username}</p>
              {/* Role, isActive, profileId are removed based on new schema */}

              <hr />
              <h4>Update Profile Information</h4>
              <form onSubmit={handleUpdateProfile}>
                <div>
                  <label>First Name: </label>
                  <input type="text" value={updateFirstName} onChange={(e) => setUpdateFirstName(e.target.value)} />
                </div>
                <div>
                  <label>Last Name: </label>
                  <input type="text" value={updateLastName} onChange={(e) => setUpdateLastName(e.target.value)} />
                </div>
                <div>
                  <label>Email: </label>
                  <input type="email" value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} />
                </div>
                <div>
                  <label>Phone Number: </label>
                  <input type="tel" value={updatePhone} onChange={(e) => setUpdatePhone(e.target.value)} />
                </div>
                <button type="submit">Save Profile Changes</button>
              </form>

              <hr />
              <h4>Delete Profile</h4>
              <p style={{color: 'red'}}>Warning: Deleting the profile is permanent and cannot be undone.</p>
              <button onClick={handleDeleteProfile} style={{ backgroundColor: 'red', color: 'white' }}>Delete Profile Permanently</button>

            </div>
          ) : (
            // Message shown if details tab is active but no profile loaded
            <p>Select a profile username from the Search tab to view details.</p>
          )}
        </div>
      )}
      {/* Show loading indicator specifically when fetching details */}
      {activeTab === 'details' && isFetchingDetails && <p>Fetching profile details...</p>}

    </div>
  );
}

export default ProfileManagementPage;