import axios from 'axios';

// Create a base axios instance
const http = axios.create({
  baseURL: 'http://localhost:3000/', // Change to your actual API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and user info to each request
http.interceptors.request.use(
  (config) => {
    // Get token from storage (localStorage or sessionStorage)
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    // Get user data from storage if available
    const userString = localStorage.getItem('userData');
    let userId = null;
    let tenantId = null;
    
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        userId = userData.userId;
        tenantId = userData.tenantId;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Add token to headers if it exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add user and tenant IDs to headers if they exist
    if (userId) {
      config.headers['userId'] = userId;
    }
    
    if (tenantId) {
      config.headers['tenantId'] = tenantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh or common error patterns
http.interceptors.response.use(
  (response) => {
    // Extract user and tenant IDs from response headers if they exist
    const userId = response.headers['userId'];
    const tenantId = response.headers['tenantId'];
    
    // Store user info if it's included in auth-related responses
    if (response.data?.user) {
      const userData = {
        userId: response.data.user.userId || userId,
        tenantId: response.data.user.tenantId || tenantId,
        // Add other user properties as needed
      };
      
      // Store the user data in localStorage for future requests
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    return response;
  },
  async (error) => {
    // Extract error message from response
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Try to extract error message from various possible locations
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      } else if (data?.errors && Array.isArray(data.errors)) {
        // Handle validation errors (array of error objects)
        errorMessage = data.errors.map(err => err.message || err.msg).join(', ');
      } else if (typeof data === 'string') {
        errorMessage = data;
      } else {
        // Fallback to generic status-based messages
        switch (status) {
          case 400:
            errorMessage = 'Bad Request: Please check your input';
            break;
          case 401:
            errorMessage = 'Unauthorized: Please log in again';
            break;
          case 403:
            errorMessage = 'Forbidden: You do not have permission';
            break;
          case 404:
            errorMessage = 'Not Found: The requested resource was not found';
            break;
          case 500:
            errorMessage = 'Server Error: Please try again later';
            break;
          default:
            errorMessage = `Error ${status}: ${error.message}`;
        }
      }
      
      // Log the error for debugging
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status,
        message: errorMessage,
        data: error.config?.data
      });
      
      // Display error message to user
      if (status !== 401) { // Don't show alert for auth errors as they're handled separately
        alert(errorMessage);
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network Error: Unable to reach the server';
      console.error('Network Error:', error.request);
      alert(errorMessage);
    } else {
      // Something else happened
      errorMessage = error.message || 'An unexpected error occurred';
      console.error('Error:', errorMessage);
      alert(errorMessage);
    }
    
    // Attach formatted message to error object
    error.userMessage = errorMessage;
    
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default http;