import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- Reusable API Call Helper (assuming it's defined elsewhere or passed as prop) ---
// If not defined globally, you'd import it or define it here.
// For this example, we assume `apiCall` exists in the scope.
async function apiCall(url, method = 'GET', body = null) {
  const apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;
  const options = { method, headers: {} };
  // Add authorization header if needed, e.g., from localStorage
  // const token = localStorage.getItem('authToken');
  // if (token) { options.headers['Authorization'] = `Bearer ${token}`; }
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(apiUrl, options);
    const contentType = response.headers.get("content-type");
    let data;
    // Handle 204 No Content specifically for DELETE/PUT success without body
    if (response.status === 204) { return { message: `Operation successful (Status: ${response.status})` }; }
    if (contentType && contentType.indexOf("application/json") !== -1) { data = await response.json(); } else {
      const textResponse = await response.text();
      if (!response.ok) { throw new Error(textResponse || `HTTP error! status: ${response.status}`); }
      return { message: textResponse || `Operation successful (Status: ${response.status})` };
    }
    if (!response.ok) { throw new Error(data.message || `HTTP error! status: ${response.status}`); }
    return data;
  } catch (error) {
    console.error(`API call failed: ${method} ${apiUrl}`, error);
    throw error;
  }
}


/**
 * Page for Cleaners to manage their service offerings (CRUD).
 */
function ServiceManagementPage() {
  // --- State Variables ---
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'search', 'details'
  const [isLoading, setIsLoading] = useState(false); // General loading
  const [isFetchingDetails, setIsFetchingDetails] = useState(false); // Specific loading for details
  const [isFetchingCategories, setIsFetchingCategories] = useState(false); // Loading categories
  const [message, setMessage] = useState({ text: '', type: '' }); // Feedback messages ('success', 'error', 'info')
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const navigate = useNavigate();

  // Create Tab State
  const [categories, setCategories] = useState([]); // [{ id, name, description }]
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPricePerHour, setCreatePricePerHour] = useState('');

  // Search Tab State
  const [searchParams, setSearchParams] = useState({ categoryName: '', description: '', minPrice: '', maxPrice: '' });
  const [searchResults, setSearchResults] = useState([]); // Stores array of service IDs [{ serviceId, description (truncated), ... }]

  // Details Tab State
  const [selectedService, setSelectedService] = useState(null); // Full details of the selected service
  const [updateDescription, setUpdateDescription] = useState('');
  const [updatePricePerHour, setUpdatePricePerHour] = useState('');

  // --- Helper Functions ---
  const showMessage = (text, type = 'error') => setMessage({ text, type });
  const clearMessages = () => setMessage({ text: '', type: '' });

  // --- Effect to get logged-in username on mount ---
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.username) {
          setLoggedInUsername(userData.username);
        } else {
          console.error("Logged in user data in localStorage is missing username.");
          showMessage('Could not identify logged-in user.', 'error');
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
        localStorage.removeItem('loggedInUser');
        showMessage('Error reading user session. Please log in again.', 'error');
        navigate('/login', { replace: true });
      }
    } else {
      showMessage('No user session found. Please log in.', 'error');
      navigate('/login', { replace: true });

    }
  }, [navigate]);

  // --- API Call Functions ---
  // Fetch Categories (for Create tab dropdown)
  const fetchCategories = useCallback(async () => {
    setIsFetchingCategories(true);
    clearMessages();
    try {
      const fetchedCategories = await apiCall('/api/platform/serviceCategory/search'); // Uses GET by default
      console.log('Fetched categories:', fetchedCategories);
      setCategories(fetchedCategories || []);
      if (fetchedCategories && fetchedCategories.length > 0) {
        // Optionally pre-select the first category
        // setSelectedCategoryId(fetchedCategories[0].id);
      } else {
        showMessage('No service categories found. Please contact support.', 'info');
      }
    } catch (error) {
      showMessage(error.message || 'Failed to load service categories.');
    } finally {
      setIsFetchingCategories(false);
    }
  }, []); // Empty dependency array means this runs once on mount effectively if called in useEffect

  // Effect to fetch categories when component mounts or create tab is active
  useEffect(() => {
    if (activeTab === 'create') {
      fetchCategories();
    }
  }, [activeTab, fetchCategories]);


  // Handle Service Creation
  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      showMessage('Please select a service category.');
      return;
    }
    if (!loggedInUsername) {
      showMessage('User information not available. Cannot create service.', 'error');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const price = parseFloat(createPricePerHour);
      if (isNaN(price) || price < 0) {
        throw new Error('Please enter a valid, non-negative price per hour.');
      }
      const result = await apiCall('/api/cleaner/service', 'POST', {
        cleanerUsername: loggedInUsername,
        categoryId: parseInt(selectedCategoryId, 10),
        description: createDescription,
        pricePerHour: price,
      });
      showMessage(result.message || 'Service created successfully!', 'success');
      setSelectedCategoryId('');
      setCreateDescription('');
      setCreatePricePerHour('');
    } catch (error) {
      showMessage(error.message || 'Failed to create service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Service Search
  const handleSearchServices = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    setSearchResults([]); // Clear previous results
    try {
      // Construct query parameters, omitting empty ones
      const query = new URLSearchParams();
      query.append('username', loggedInUsername); // Only search for logged-in cleaner's services
      if (searchParams.categoryName) query.append('categoryName', searchParams.categoryName);
      if (searchParams.description) query.append('description', searchParams.description);
      if (searchParams.minPrice) query.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice) query.append('maxPrice', searchParams.maxPrice);

      const results = await apiCall(`/api/cleaner/service/search?${query.toString()}`);

      setSearchResults(results || []);
      if (!results || results.length === 0) {
        showMessage('No services found matching your criteria.', 'info');
      }
    } catch (error) {
      showMessage(error.message || 'Failed to search for services.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search Input Changes
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  // Fetch Full Details for a Selected Service
  const fetchServiceDetails = async (serviceId) => {
    console.log(`Fetching details for service ID: ${serviceId}`);
    setIsFetchingDetails(true);
    clearMessages();
    setSelectedService(null); // Clear previous selection
    try {
      const serviceDetails = await apiCall(`/api/cleaner/service/${serviceId}`); // GET by default
      setSelectedService(serviceDetails);
      // Pre-fill update form
      setUpdateDescription(serviceDetails.description);
      setUpdatePricePerHour(serviceDetails.pricePerHour.toString()); // Convert number to string for input value
      setActiveTab('details'); // Switch to details tab
    } catch (error) {
      showMessage(error.message || `Failed to fetch details for service ID ${serviceId}.`);
      setActiveTab('search'); // Stay on search tab if fetch fails
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Handle Service Update
  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsLoading(true);
    clearMessages();
    try {
      const price = parseFloat(updatePricePerHour);
      if (isNaN(price) || price < 0) {
        throw new Error('Please enter a valid, non-negative price per hour.');
      }

      const result = await apiCall(`/api/cleaner/service/${selectedService.serviceId}`, 'PUT', {
        description: updateDescription,
        pricePerHour: price,
      });
      showMessage(result.message || 'Service updated successfully!', 'success');
      await fetchServiceDetails(selectedService.serviceId);
    } catch (error) {
      showMessage(error.message || 'Failed to update service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Service Deletion (Soft Delete)
  const handleDeleteService = async () => {
    if (!selectedService || !window.confirm(`Are you sure you want to deactivate service ID ${selectedService.serviceId}? This cannot be undone easily.`)) {
      return;
    }

    setIsLoading(true);
    clearMessages();
    try {
      const result = await apiCall(`/api/cleaner/service/${selectedService.serviceId}`, 'DELETE');
      showMessage(result.message || `Service ${selectedService.serviceId} deactivated successfully!`, 'success');
      // Clear selection and go back to search tab
      setSelectedService(null);
      setUpdateDescription('');
      setUpdatePricePerHour('');
      setActiveTab('search');
    } catch (error) {
      showMessage(error.message || 'Failed to deactivate service.');
    } finally {
      setIsLoading(false);
    }
  };


  // --- Render Logic ---
  return (
    <div>
      {loggedInUsername && <p style={{ fontStyle: 'italic', textAlign: 'right' }}>Managing services for: {loggedInUsername}</p>}

      {/* Link back to the Cleaner Dashboard */}
      <Link to="/cleaner/dashboard">← Back to Dashboard</Link>
      <h2>Manage My Services</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
        <button onClick={() => {
          setActiveTab('create');
          setSelectedService(null);
          clearMessages();
        }} disabled={activeTab === 'create'}>Create New Service
        </button>
        <button onClick={() => {
          setActiveTab('search');
          setSelectedService(null);
          clearMessages();
        }} disabled={activeTab === 'search'}>Search My Services
        </button>
        <button onClick={() => setActiveTab('details')}
                disabled={activeTab === 'details' || !selectedService}>View/Update/Deactivate
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

      {/* --- Create Tab --- */}
      {activeTab === 'create' && !isLoading && !isFetchingCategories && (
        <div>
          <h3>Offer a New Cleaning Service</h3>
          <form onSubmit={handleCreateService}>
            <div>
              <label htmlFor="categorySelect">Service Category: </label>
              <select
                id="categorySelect"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select a Category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.description ? `(${cat.description.substring(0, 50)}...)` : ''}
                  </option>
                ))}
              </select>
              {categories.length === 0 && !isFetchingCategories &&
                <p style={{ color: 'orange' }}>No categories available.</p>}
            </div>
            <div>
              <label htmlFor="createDesc">Description: </label>
              <textarea
                id="createDesc"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows="4"
                cols="50"
                required
                placeholder="Describe the service you offer..."
              />
            </div>
            <div>
              <label htmlFor="createPrice">Price Per Hour (€): </label>
              <input
                id="createPrice"
                type="number"
                value={createPricePerHour}
                onChange={(e) => setCreatePricePerHour(e.target.value)}
                required
                min="0"
                step="0.01" // Allow cents
                placeholder="e.g., 25.50"
              />
            </div>
            <button type="submit" disabled={isLoading || isFetchingCategories}>Create Service</button>
          </form>
        </div>
      )}
      {activeTab === 'create' && isFetchingCategories && <p>Loading categories...</p>}


      {/* --- Search Tab --- */}
      {activeTab === 'search' && !isLoading && (
        <div>
          <h3>Search Your Offered Services</h3>
          <form onSubmit={handleSearchServices}>
            {/* Add search fields as needed, e.g., by category name, description keyword, price range */}
            <input
              type="text"
              name="categoryName"
              placeholder="Category name contains..."
              value={searchParams.categoryName}
              onChange={handleSearchInputChange}
              style={{ marginRight: '10px' }}
            />
            <input
              type="text"
              name="description"
              placeholder="Description contains..."
              value={searchParams.description}
              onChange={handleSearchInputChange}
              style={{ marginRight: '10px' }}
            />
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price/hr"
              value={searchParams.minPrice}
              onChange={handleSearchInputChange}
              min="0" step="0.01"
              style={{ width: '100px', marginRight: '5px' }}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price/hr"
              value={searchParams.maxPrice}
              onChange={handleSearchInputChange}
              min="0" step="0.01"
              style={{ width: '100px', marginRight: '10px' }}
            />
            <button type="submit" disabled={isLoading}>Search</button>
          </form>
          <h4>Results:</h4>
          {/* Display search results (list of service IDs and maybe truncated description/price) */}
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map(service => (
                <li key={service.serviceId}>
                  ID: {service.serviceId} - Desc: "{service.description}..." - Price: €{service.pricePerHour.toFixed(2)}/hr
                  <button
                    onClick={() => fetchServiceDetails(service.serviceId)}
                    style={{ marginLeft: '10px' }}
                    disabled={isFetchingDetails}
                  >
                    {isFetchingDetails ? 'Loading...' : 'View/Manage'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !message.text && <p>No results to display. Perform a search or create a new service.</p>
          )}
        </div>
      )}

      {/* --- Details/Update/Deactivate Tab --- */}
      {activeTab === 'details' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Service Details & Management</h3>
          {selectedService ? (
            <div>
              <p><strong>Service ID:</strong> {selectedService.serviceId}</p>
              {/* Find category name from the fetched categories list */}
              <p>
                <strong>Category:</strong> {categories.find(c => c.id === selectedService.categoryId)?.name || `ID ${selectedService.categoryId}`}
              </p>
              <p><strong>Current Description:</strong> {selectedService.description}</p>
              <p><strong>Current Price Per Hour:</strong> €{selectedService.pricePerHour.toFixed(2)}</p>
              <hr/>
              <h4>Update Service</h4>
              <form onSubmit={handleUpdateService}>
                <div>
                  <label htmlFor="updateDesc">New Description: </label>
                  <textarea
                    id="updateDesc"
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    rows="4"
                    cols="50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="updatePrice">New Price Per Hour (€): </label>
                  <input
                    id="updatePrice"
                    type="number"
                    value={updatePricePerHour}
                    onChange={(e) => setUpdatePricePerHour(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <button type="submit" disabled={isLoading}>Update Service</button>
              </form>
              <hr/>
              <h4>Deactivate Service</h4>
              <p>Deactivating will remove this service from public searches.</p>
              <button onClick={handleDeleteService} style={{ backgroundColor: 'orange' }} disabled={isLoading}>
                Deactivate Service (ID: {selectedService.serviceId})
              </button>
            </div>
          ) : (
            <p>Select a service from the Search tab to view details.</p>
          )}
        </div>
      )}
      {/* Show loading indicator specifically when fetching details for the details tab */}
      {activeTab === 'details' && isFetchingDetails && <p>Fetching service details...</p>}

    </div>
  );
}

export default ServiceManagementPage;