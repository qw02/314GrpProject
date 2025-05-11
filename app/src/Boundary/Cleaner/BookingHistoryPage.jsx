import React, { useState, useEffect, useCallback } from 'react';
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
 * Page for Cleaners to view their booking history.
 * Allows searching by date range and category, and viewing details of individual bookings.
 */
function BookingHistoryPage() {
  // --- State Variables ---
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'view'
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Search Tab State
  const [searchParams, setSearchParams] = useState({
    bookingDateStart: '',
    bookingDateEnd: '',
    categoryID: '',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);

  // View Tab State
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);

  // --- Helper Functions ---
  const showMessage = (text, type = 'error') => setMessage({ text, type });
  const clearMessages = () => setMessage({ text: '', type: '' });

  // --- Fetch Service Categories for Filter Dropdown ---
  const fetchCategories = useCallback(async () => {
    setIsFetchingCategories(true);
    clearMessages();
    try {
      // Using the existing endpoint for service categories
      const fetchedCategories = await apiCall('/api/platform/serviceCategories/search');
      setCategories(fetchedCategories || []);
    } catch (error) {
      showMessage('Failed to load service categories for filtering.');
    } finally {
      setIsFetchingCategories(false);
    }
  }, []);

  useEffect(() => {
    // Fetch categories when the component mounts or search tab is active
    if (activeTab === 'search') {
      fetchCategories();
    }
  }, [activeTab, fetchCategories]);

  // --- Handle Search Input Changes ---
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  // --- Handle Booking History Search ---
  const handleSearchBookings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    setSearchResults([]);

    // Get cleanerUsername from localStorage
    let cleanerUsername = '';
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        cleanerUsername = userData.username;
      } catch (error) {
        showMessage('Could not retrieve your username. Please log in again.');
        setIsLoading(false);
        return;
      }
    }

    if (!cleanerUsername) {
      showMessage('Cleaner username not found. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const query = new URLSearchParams();
      query.append('cleanerUsername', cleanerUsername);
      if (searchParams.bookingDateStart) query.append('bookingDateStart', searchParams.bookingDateStart);
      if (searchParams.bookingDateEnd) query.append('bookingDateEnd', searchParams.bookingDateEnd);
      if (searchParams.categoryID) query.append('categoryID', searchParams.categoryID);

      const results = await apiCall(`/api/cleaner/bookingHistory/search?${query.toString()}`);
      setSearchResults(results || []);
      if (!results || results.length === 0) {
        showMessage('No booking history found matching your criteria.', 'info');
      }
    } catch (error) {
      showMessage('Failed to search booking history.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch Full Details for a Selected Booking ---
  const fetchBookingDetails = async (bookingId) => {
    setIsFetchingDetails(true);
    clearMessages();
    setSelectedBookingDetails(null);
    try {
      const details = await apiCall(`/api/cleaner/bookingHistory/booking/${bookingId}`);
      setSelectedBookingDetails(details);
      setActiveTab('view'); // Switch to view tab
    } catch (error) {
      showMessage(`Failed to fetch details for booking ID ${bookingId}.`);
      setActiveTab('search'); // Revert to search tab on error
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // --- Render Logic ---
  return (
    <div>
      <Link to="/cleaner/dashboard">← Back to Dashboard</Link>
      <h2>My Booking History</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
        <button onClick={() => {
          setActiveTab('search');
          setSelectedBookingDetails(null);
          clearMessages();
        }} disabled={activeTab === 'search'}>Search History
        </button>
        <button onClick={() => setActiveTab('view')} disabled={activeTab === 'view' || !selectedBookingDetails}>View
          Booking Detail
        </button>
      </div>

      {/* Feedback Messages */}
      {message.text && (
        <p
          style={{ color: message.type === 'success' ? 'green' : (message.type === 'info' || message.type === 'warn' ? 'darkorange' : 'red') }}>
          {message.text}
        </p>
      )}

      {/* Loading Indicators */}
      {(isLoading || isFetchingDetails || isFetchingCategories) && <p>Loading...</p>}

      {/* --- Search Tab --- */}
      {activeTab === 'search' && !isLoading && !isFetchingCategories && (
        <div>
          <h3>Search Your Past Bookings</h3>
          <form onSubmit={handleSearchBookings}>
            <div>
              <label htmlFor="bookingDateStart">From Date: </label>
              <input type="date" id="bookingDateStart" name="bookingDateStart" value={searchParams.bookingDateStart}
                     onChange={handleSearchInputChange}/>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label htmlFor="bookingDateEnd">To Date: </label>
              <input type="date" id="bookingDateEnd" name="bookingDateEnd" value={searchParams.bookingDateEnd}
                     onChange={handleSearchInputChange}/>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label htmlFor="categoryID">Service Category: </label>
              <select id="categoryID" name="categoryID" value={searchParams.categoryID}
                      onChange={handleSearchInputChange}>
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && !isFetchingCategories &&
                <span style={{ marginLeft: '10px', color: 'orange' }}> (No categories loaded)</span>}
            </div>
            <button type="submit" style={{ marginTop: '15px' }} disabled={isLoading || isFetchingCategories}>Search
              Bookings
            </button>
          </form>

          <h4 style={{ marginTop: '20px' }}>Results:</h4>
          {searchResults.length > 0 ? (
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {searchResults.map(booking => (
                <li key={booking.bookingId} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                  <strong>ID:</strong> {booking.bookingId} <br/>
                  <strong>HomeOwner:</strong> {booking.homeOwnerUsername} <br/>
                  <strong>Date:</strong> {new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString()}
                  <br/>
                  <strong>Category:</strong> {booking.serviceCategoryName} <br/>
                  <button
                    onClick={() => fetchBookingDetails(booking.bookingId)}
                    style={{ marginTop: '5px' }}
                    disabled={isFetchingDetails}
                  >
                    {isFetchingDetails ? 'Loading...' : 'View Details'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !message.text && <p>No results to display. Please refine your search or check if you have past bookings.</p>
          )}
        </div>
      )}
      {activeTab === 'search' && isFetchingCategories && <p>Loading categories for filter...</p>}


      {/* --- View Tab --- */}
      {activeTab === 'view' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Booking Details</h3>
          {selectedBookingDetails ? (
            <div style={{ border: '1px solid #ddd', padding: '15px' }}>
              <p><strong>Booking ID:</strong> {selectedBookingDetails.bookingId}</p>
              <p><strong>HomeOwner:</strong> {selectedBookingDetails.homeOwnerUsername}</p>
              <p><strong>Booking
                Date:</strong> {new Date(selectedBookingDetails.bookingDate + 'T00:00:00').toLocaleDateString()}</p>
              <p><strong>Service Category:</strong> {selectedBookingDetails.serviceCategoryName}</p>
              <p><strong>Service Description Provided:</strong></p>
              <p style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f9f9f9',
                padding: '10px',
                border: '1px solid #eee'
              }}>
                {selectedBookingDetails.serviceDescription || 'No specific description was recorded for this service.'}
              </p>
              <button onClick={() => {
                setActiveTab('search');
                setSelectedBookingDetails(null);
                clearMessages();
              }} style={{ marginTop: '15px' }}>
                ← Back to Search Results
              </button>
            </div>
          ) : (
            <p>Select a booking from the search results to view its details.</p>
          )}
        </div>
      )}
      {activeTab === 'view' && isFetchingDetails && <p>Fetching booking details...</p>}
    </div>
  );
}

export default BookingHistoryPage;