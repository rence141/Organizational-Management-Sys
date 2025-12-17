const API_BASE_URL = 'http://localhost:3000/api';
const COLLECTION_NAME = 'test-organization'; // MongoDB collection name

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Common headers with authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Handle API response
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }
  return data;
};

/**
 * Get all organizations from the test-organization collection
 * @returns {Promise<Array>} List of organizations
 */
export const getOrganizations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/organizations?collection=${COLLECTION_NAME}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw new Error(error.message || 'Failed to fetch organizations');
  }
};

/**
 * Get organization by ID from test-organization collection
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Organization data
 */
export const getOrganizationById = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${id}?collection=${COLLECTION_NAME}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching organization with ID ${id}:`, error);
    throw new Error(error.message || 'Failed to fetch organization');
  }
};

/**
 * Create new organization in test-organization collection
 * @param {Object} organizationData - Organization data to create
 * @returns {Promise<Object>} Created organization data
 */
export const createOrganization = async (organizationData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/organizations?collection=${COLLECTION_NAME}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(organizationData)
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error(error.message || 'Failed to create organization');
  }
};

/**
 * Update organization in test-organization collection
 * @param {string} id - Organization ID to update
 * @param {Object} organizationData - Updated organization data
 * @returns {Promise<Object>} Updated organization data
 */
export const updateOrganization = async (id, organizationData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${id}?collection=${COLLECTION_NAME}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(organizationData)
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating organization with ID ${id}:`, error);
    throw new Error(error.message || 'Failed to update organization');
  }
};

/**
 * Delete organization from test-organization collection
 * @param {string} id - Organization ID to delete
 * @returns {Promise<Object>} Deletion status
 */
export const deleteOrganization = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${id}?collection=${COLLECTION_NAME}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error(`Error deleting organization with ID ${id}:`, error);
    throw new Error(error.message || 'Failed to delete organization');
  }
};
