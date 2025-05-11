import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Helper Function for API Calls ---
async function apiCall(url, method = 'GET', body = null) {
  const apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;
  const options = { method, headers: {} };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(apiUrl, options);
  if (!response.ok) {
    throw new Error();
  }

  return await response.json();
}

/**
 * Page for Cleaners to view their performance statistics.
 * Initially shows a welcome message, then allows fetching profile views and service shortlist counts.
 */
function CleanerStatsPage() {
  // --- State Variables ---
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome', 'profileViews', 'serviceShortlists'
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // Feedback messages

  const [profileViewCount, setProfileViewCount] = useState(null);
  const [serviceShortlistCount, setServiceShortlistCount] = useState(null);
  const [username, setUsername] = useState(''); // To store the logged-in cleaner's username

  // --- Helper Functions ---
  const showMessage = (text, type = 'error') => setMessage({ text, type });
  const clearMessages = () => setMessage({ text: '', type: '' });

  // --- Get Username on Mount ---
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.username && userData.role === 'Cleaner') {
          setUsername(userData.username);
        } else {
          showMessage('Could not identify cleaner. Please log in again.', 'error');
          // Optionally navigate away or disable functionality
        }
      } catch (e) {
        console.error("Error parsing user data for stats page:", e);
        showMessage('Error loading user data. Please try again.', 'error');
      }
    } else {
      showMessage('User not logged in. Please log in to view stats.', 'error');
      // Optionally navigate to login
    }
  }, []); // Runs once on mount

  // --- API Call Functions ---

  // Fetch Profile View Count
  const fetchProfileViews = async () => {
    if (!username) {
      showMessage('Username not available. Cannot fetch profile views.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    setProfileViewCount(null); // Reset previous data
    try {
      const data = await apiCall(`/cleaner/profileView/${username}`);
      setProfileViewCount(data);
    } catch (error) {
      showMessage(error.message || 'Failed to load profile view statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Service Shortlist Count
  const fetchServiceShortlists = async () => {
    if (!username) {
      showMessage('Username not available. Cannot fetch service shortlist stats.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    setServiceShortlistCount(null); // Reset previous data
    try {
      const data = await apiCall(`/cleaner/serviceStats/${username}`);
      setServiceShortlistCount(data);
    } catch (error) {
      showMessage(error.message || 'Failed to load service shortlist statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Tab Change Handler ---
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    clearMessages(); // Clear messages when switching tabs
    // Reset data when switching away from a data tab to welcome
    if (tabName === 'welcome') {
      setProfileViewCount(null);
      setServiceShortlistCount(null);
    }
    // Trigger API call if switching to a data tab and data hasn't been fetched yet (or to refresh)
    if (tabName === 'profileViews') {
      fetchProfileViews();
    } else if (tabName === 'serviceShortlists') {
      fetchServiceShortlists();
    }
  };


  // --- Render Logic ---
  return (
    <div>
      <Link to="/cleaner/dashboard">← Back to Dashboard</Link>
      <h2>My Performance Statistics</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
        <button onClick={() => handleTabChange('welcome')} disabled={activeTab === 'welcome'}>Welcome</button>
        <button onClick={() => handleTabChange('profileViews')}
                disabled={activeTab === 'profileViews' || !username}>Profile Views
        </button>
        <button onClick={() => handleTabChange('serviceShortlists')}
                disabled={activeTab === 'serviceShortlists' || !username}>Service Shortlists
        </button>
      </div>

      {/* Feedback Messages */}
      {message.text && (
        <p
          style={{ color: message.type === 'success' ? 'green' : (message.type === 'info' || message.type === 'warn' ? 'darkorange' : 'red') }}>
          {message.text}
        </p>
      )}

      {/* Loading Indicator */}
      {isLoading && <p>Loading statistics...</p>}

      {/* --- Welcome Tab --- */}
      {activeTab === 'welcome' && !isLoading && (
        <div>
          <h3>Welcome to Your Stats Page!</h3>
          <p>
            Here you can track how many times your profile has been viewed and how often your services
            have been shortlisted by potential clients. Select a tab above to view specific statistics.
          </p>
        </div>
      )}

      {/* --- Profile Views Tab --- */}
      {activeTab === 'profileViews' && !isLoading && (
        <div>
          <h3>Profile View Statistics</h3>
          {profileViewCount !== null ? (
            <p>Total times your profile has been viewed: <strong>{profileViewCount}</strong></p>
          ) : (
            // Show only if no error message is present
            !message.text && <p>Click the "Profile Views" tab again or check messages if data isn't loading.</p>
          )}
        </div>
      )}

      {/* --- Service Shortlists Tab --- */}
      {activeTab === 'serviceShortlists' && !isLoading && (
        <div>
          <h3>Service Shortlist Statistics</h3>
          {serviceShortlistCount !== null ? (
            <p>Total times your services have been shortlisted: <strong>{serviceShortlistCount}</strong></p>
          ) : (
            !message.text && <p>Click the "Service Shortlists" tab again or check messages if data isn't loading.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CleanerStatsPage;