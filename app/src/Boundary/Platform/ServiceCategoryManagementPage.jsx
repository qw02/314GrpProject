import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Helper Function for API Calls (assuming it's available, e.g., from a shared util) ---
async function apiCall(url, method = 'GET', body = null) {
  const apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;
  const options = { method, headers: {} };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(apiUrl, options);
    const contentType = response.headers.get("content-type");
    let data;
    // Handle 204 No Content specifically
    if (response.status === 204) {
      return { message: `Operation successful (Status: ${response.status})` };
    }
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      const textResponse = await response.text();
      if (!response.ok) {
        throw new Error(textResponse || `HTTP error! status: ${response.status}`);
      }
      // For non-JSON success, wrap text response in a message object
      return { message: textResponse || `Operation successful (Status: ${response.status})` };
    }
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API call failed: ${method} ${apiUrl}`, error);
    throw error;
  }
}

function ServiceCategoryManagementPage() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // --- Create State ---
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Stores { id, name, description? }

  // --- Details/Update/Delete State ---
  const [selectedCategory, setSelectedCategory] = useState(null); // Stores full { id, name, description }
  const [updateName, setUpdateName] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');

  const clearMessages = () => setMessage({ text: '', type: '' });
  const showMessage = (text, type = 'info') => setMessage({ text, type });

  // Effect to populate update form when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      setUpdateName(selectedCategory.name);
      setUpdateDescription(selectedCategory.description || '');
    } else {
      setUpdateName('');
      setUpdateDescription('');
    }
  }, [selectedCategory]);

  // --- Handler Functions ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();
    try {
      const result = await apiCall('/api/platform/serviceCategory', 'POST', {
        name: createName,
        description: createDescription,
      });
      showMessage(result.message || 'Service category created successfully!', 'success');
      setCreateName('');
      setCreateDescription('');
    } catch (error) {
      showMessage(error.message || 'Failed to create service category.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCategories = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    clearMessages();
    setSearchResults([]);
    setSelectedCategory(null);
    let url = '/api/platform/serviceCategories/search';
    if (searchTerm.trim()) {
      url += `?term=${encodeURIComponent(searchTerm.trim())}`;
    }

    try {
      const results = await apiCall(url);
      setSearchResults(results);
      if (results.length === 0) {
        showMessage('No service categories found matching criteria.', 'info');
      }
    } catch (error) {
      showMessage(error.message || 'Failed to search service categories.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryDetails = async (categoryId) => {
    if (!categoryId) return;
    setIsFetchingDetails(true);
    setSelectedCategory(null);
    clearMessages();
    try {
      const categoryData = await apiCall(`/api/platform/serviceCategory/${categoryId}`, 'GET');
      setSelectedCategory(categoryData); // Stores { id, name, description }
      setActiveTab('details');
    } catch (error) {
      showMessage(error.message || `Failed to fetch details for category ID ${categoryId}.`, 'error');
      setActiveTab('search'); // Fallback to search tab on error
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      showMessage('No category selected for update.', 'warn');
      return;
    }
    if (updateName === selectedCategory.name && updateDescription === (selectedCategory.description || '')) {
      showMessage('No changes detected to update.', 'info');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const result = await apiCall(
        `/api/platform/serviceCategory/${selectedCategory.id}`,
        'PUT',
        { name: updateName, description: updateDescription }
      );
      showMessage(result.message || 'Service category updated successfully!', 'success');
      setSelectedCategory(prev => ({ ...prev, name: updateName, description: updateDescription }));
    } catch (error) {
      showMessage(error.message || 'Failed to update service category.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    if (!window.confirm(`Are you sure you want to deactivate service category: "${selectedCategory.name}"?`)) return;

    setIsLoading(true);
    clearMessages();
    try {
      const result = await apiCall(`/api/platform/serviceCategory/${selectedCategory.id}`, 'DELETE');
      showMessage(result.message || 'Service category deactivated successfully!', 'success');
      setSelectedCategory(null);
      setActiveTab('search'); // Go back to search or welcome
    } catch (error) {
      showMessage(error.message || 'Failed to deactivate service category.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Tab Navigation ---
  const navigateToTab = (tabName) => {
    clearMessages();
    setSelectedCategory(null); // Clear selection when changing main context
    if (tabName === 'create') {
      setCreateName('');
      setCreateDescription('');
    } else if (tabName === 'search') {
      setSearchTerm('');
      // setSearchResults([]); // Keep results if just switching back? Or clear? Let's clear.
      setSearchResults([]);
    }
    setActiveTab(tabName);
  };


  // --- Render Logic ---
  return (
    <div>
      <Link to="/platform/dashboard">← Back to Platform Dashboard</Link>
      <h2>Manage Service Categories</h2>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <button onClick={() => navigateToTab('welcome')}
                disabled={activeTab === 'welcome' || isLoading || isFetchingDetails}>Welcome
        </button>
        <button onClick={() => navigateToTab('create')}
                disabled={activeTab === 'create' || isLoading || isFetchingDetails} style={{ marginLeft: '5px' }}>Create
          New
        </button>
        <button onClick={() => navigateToTab('search')}
                disabled={activeTab === 'search' || isLoading || isFetchingDetails} style={{ marginLeft: '5px' }}>Search
        </button>
        <button onClick={() => setActiveTab('details')}
                disabled={activeTab === 'details' || !selectedCategory || isLoading || isFetchingDetails}
                style={{ marginLeft: '5px' }}>View/Update/Deactivate
        </button>
      </div>

      {message.text && (
        <p style={{
          padding: '10px',
          border: '1px solid',
          borderColor: message.type === 'success' ? 'green' : (message.type === 'info' || message.type === 'warn' ? 'orange' : 'red'),
          color: message.type === 'success' ? 'green' : (message.type === 'info' || message.type === 'warn' ? 'darkorange' : 'red'),
          backgroundColor: message.type === 'success' ? '#e6ffed' : (message.type === 'info' || message.type === 'warn' ? '#fff3e0' : '#ffebee'),
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {message.text}
        </p>
      )}

      {(isLoading || isFetchingDetails) && <p>Loading, please wait... (๑•﹏•)</p>}

      {/* Welcome Tab */}
      {activeTab === 'welcome' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Welcome to Service Category Management</h3>
          <p>Here, you can add new service categories to the platform or manage existing ones.</p>
          <p>Use the tabs above to navigate:
            <ul>
              <li><strong>Create New:</strong> Add a brand new service category.</li>
              <li><strong>Search:</strong> Find existing categories by name or description.</li>
              <li><strong>View/Update/Deactivate:</strong> Once a category is selected from search, use this tab to see
                its details, make changes, or deactivate it.
              </li>
            </ul>
          </p>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Create New Service Category</h3>
          <form onSubmit={handleCreateCategory}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="createName" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                id="createName"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                style={{ width: '300px', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="createDescription" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
              <textarea
                id="createDescription"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                required
                rows="4"
                style={{ width: '300px', padding: '8px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 15px' }}>Create Category</button>
          </form>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Search Service Categories</h3>
          <form onSubmit={handleSearchCategories} style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px', padding: '8px' }}
            />
            <button type="submit" style={{ marginLeft: '10px', padding: '8px 15px' }}>Search</button>
          </form>
          <h4>Results:</h4>
          {searchResults.length > 0 ? (
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {searchResults.map((category) => (
                <li key={category.id}
                    style={{ marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                  <strong>{category.name}</strong>
                  <button
                    onClick={() => fetchCategoryDetails(category.id)}
                    style={{ marginLeft: '15px', padding: '5px 10px' }}
                    disabled={isFetchingDetails}
                  >
                    {isFetchingDetails ? 'Loading...' : 'View/Manage'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !message.text && <p>No results to display. Perform a search or broaden your criteria.</p>
          )}
        </div>
      )}

      {/* Details/Update/Deactivate Tab */}
      {activeTab === 'details' && !isLoading && !isFetchingDetails && (
        <div>
          <h3>Category Details & Management</h3>
          {selectedCategory ? (
            <div>
              <p><strong>ID:</strong> {selectedCategory.id}</p>
              <p><strong>Current Name:</strong> {selectedCategory.name}</p>
              <p><strong>Current Description:</strong> {selectedCategory.description || 'N/A'}</p>
              <hr style={{ margin: '20px 0' }}/>
              <h4>Update Category Information</h4>
              <form onSubmit={handleUpdateCategory}>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="updateName" style={{ display: 'block', marginBottom: '5px' }}>New Name:</label>
                  <input
                    id="updateName"
                    type="text"
                    value={updateName}
                    onChange={(e) => setUpdateName(e.target.value)}
                    required
                    style={{ width: '300px', padding: '8px' }}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="updateDescription" style={{ display: 'block', marginBottom: '5px' }}>New
                    Description:</label>
                  <textarea
                    id="updateDescription"
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    required
                    rows="4"
                    style={{ width: '300px', padding: '8px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '10px 15px' }}>Update Category</button>
              </form>
              <hr style={{ margin: '20px 0' }}/>
              <h4>Deactivate Category</h4>
              <p>Deactivating a category will make it unavailable for new service listings but will not affect existing
                services using it.</p>
              <button
                onClick={handleDeleteCategory}
                style={{
                  backgroundColor: 'orange',
                  color: 'white',
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Deactivate "{selectedCategory.name}"
              </button>
            </div>
          ) : (
            <p>Select a category from the Search tab to view its details here. (o˘◡˘o)</p>
          )}
        </div>
      )}
      {/* Specific loading indicator for when details are being fetched for the 'details' tab */}
      {activeTab === 'details' && isFetchingDetails && <p>Fetching category details... Please wait a moment!</p>}
    </div>
  );
}

export default ServiceCategoryManagementPage;
