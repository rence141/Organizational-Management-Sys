// src/lib/auth.js

// Centralized API Base URL - Ensure this matches your backend configuration
const API_BASE_URL = 'http://127.0.0.1:3000/api/auth';
const API_USERS_URL = 'http://127.0.0.1:3000/api/users';

// Helper: Fetch with timeout to prevent UI hanging if backend is stuck
const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 30000, ...fetchOptions } = options; 
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw error;
  }
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const logout = () => {
  // Clear all auth-related items
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('accountId');
  localStorage.removeItem('userProfile');
  
  // Redirect to login
  window.location.href = '/login';
};

export const authenticateUser = async (email, password) => {
  if (!email || !password) {
    console.error('Missing email or password');
    return { success: false, error: 'Email and password are required' };
  }

  const cleanEmail = email.trim();
  console.log('\n--- Frontend Login Attempt ---');
  console.log('Sending request to:', `${API_BASE_URL}/login`);
  console.log('With email:', cleanEmail);

  try {
    const payload = { email: cleanEmail, password };
    console.log('Request payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(e => {
      console.error('Failed to parse JSON response:', e);
      return { error: 'Invalid server response' };
    });

    console.log('Server response status:', response.status);
    console.log('Server response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      // Handle various error formats (message, error, or validation object)
      const errorContent = data.message || data.error || `Login failed with status ${response.status}`;
      const errorMessage = typeof errorContent === 'object'
        ? JSON.stringify(errorContent)
        : errorContent;

      console.error('Login error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        status: response.status,
        responseData: data // Include full response data for debugging
      };
    }

    // Support both 'token' and 'access_token'
    const token = data.token || data.access_token;
    if (token) {
      setToken(token);
      
      // ✅ CRITICAL FIX: Robust ID handling
      if (data.user) {
        // Handle both 'id' and '_id' to prevent "User session invalid" errors
        const userId = data.user.id || data.user._id || data.user.accId;
        
        if (userId) localStorage.setItem('userId', userId.toString());
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name); // Needed for Dashboard greeting
        
        if (data.user.accountId) {
          localStorage.setItem('accountId', data.user.accountId);
        }

        // Parse name for UI consistency based on DB schema
        const nameParts = data.user.name ? data.user.name.split(' ') : ['User'];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Save profile aligned with MongoDB schema
        const profileKey = `userProfile_${data.user.email}`;
        localStorage.setItem(profileKey, JSON.stringify({
            _id: userId,
            id: userId,
            email: data.user.email,
            name: data.user.name,
            firstName: firstName,
            lastName: lastName,
            role: data.user.role,
            isVerified: data.user.isVerified,
            createdAt: data.user.createdAt
        }));
      }
      return { success: true, token, user: data.user || data };
    }
    
    return { 
      success: false, 
      error: data.message || 'Authentication failed: No token received',
      data 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      error: error.name === 'AbortError' ? 'Server timed out. Check backend connection.' : (error.message || 'Failed to connect to the server')
    };
  }
};

export const registerUser = async (userData) => {
  try {
    // Note: Make sure your backend route matches '/signup' or '/register'
    const response = await fetchWithTimeout(`${API_BASE_URL}/signup`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json().catch(e => {
      console.error('Failed to parse JSON response:', e);
      return { error: 'Invalid server response' };
    });

    const token = data.token || data.access_token;
    if (response.ok && token) {
      setToken(token);
      // Also save user data on registration success
      if (data.user) {
        localStorage.setItem('userId', data.user._id || data.user.id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
      }
      return { success: true, user: data };
    }
    return { success: false, error: data.message || 'Registration failed' };
  } catch (error) {
    return { success: false, error: 'Registration error: ' + error.message };
  }
};

export const updateUserProfile = async (userId, userData) => {
  if (!userId) {
    return { success: false, error: 'User ID is missing' };
  }

  try {
    const response = await fetchWithTimeout(`${API_USERS_URL}/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    if (response.status === 404) {
      // Check if it's a missing route or a missing user (stale ID)
      const errorText = await response.text();
      try {
        const json = JSON.parse(errorText);
        if (json.error === 'User not found') {
          return { success: false, error: 'User ID mismatch. Please Log Out and Log In.' };
        }
      } catch (e) { /* Not JSON */ }
      
      console.error(`API Endpoint not found: ${API_USERS_URL}/${userId}`);
      return { success: false, error: 'Backend route missing (404). Check server code.' };
    }

    // Handle empty responses (204) or non-JSON errors
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn('Server response was not JSON:', text.substring(0, 100));
    }

    if (response.ok) {
      // Update local storage to reflect changes immediately without re-login
      if (userData.name) localStorage.setItem('userName', userData.name);
      if (userData.email) localStorage.setItem('userEmail', userData.email);
      
      // Update cached profile object
      const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      let updatedCache = { ...currentProfile, ...userData };

      // If name is updated, sync derived fields (firstName/lastName)
      if (userData.name) {
        const nameParts = userData.name.split(' ');
        updatedCache.firstName = nameParts[0];
        updatedCache.lastName = nameParts.slice(1).join(' ');
      }

      localStorage.setItem('userProfile', JSON.stringify(updatedCache));

      return { success: true, user: data.user || data };
    }
    return { success: false, error: data.message || `Update failed: ${response.status} ${response.statusText}` };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.name === 'AbortError' ? 'Server timed out' : ('Update error: ' + error.message) };
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getCurrentUser = () => {
  return {
    email: localStorage.getItem('userEmail'),
    userId: localStorage.getItem('userId'),
    accountId: localStorage.getItem('accountId'),
    name: localStorage.getItem('userName')
  };
};