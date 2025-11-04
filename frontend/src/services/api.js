/**
 * API Client for Lister application
 * Handles all HTTP communication with the backend
 */

class ApiClient {
  constructor() {
    this.baseURL = '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    this.interceptors = {
      request: [],
      response: []
    };
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Function to modify request before sending
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} interceptor - Function to handle response
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  /**
   * Apply request interceptors
   * @param {Object} config - Request configuration
   * @returns {Object} Modified request configuration
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.interceptors.request) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   * @param {Response} response - Fetch response
   * @returns {Response} Modified response
   */
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    
    for (const interceptor of this.interceptors.response) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    let config = {
      method: 'GET',
      headers: { ...this.defaultHeaders },
      ...options
    };

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    try {
      const response = await fetch(url, config);
      
      // Apply response interceptors
      const interceptedResponse = await this.applyResponseInterceptors(response);

      // Handle HTTP errors
      if (!interceptedResponse.ok) {
        const errorData = await this.parseErrorResponse(interceptedResponse);
        throw new ApiError(
          errorData.message || 'Request failed',
          interceptedResponse.status,
          errorData
        );
      }

      // Parse response based on content type
      return await this.parseResponse(interceptedResponse);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      throw new ApiError(
        'Network error occurred',
        0,
        { originalError: error }
      );
    }
  }

  /**
   * Parse response based on content type
   * @param {Response} response - Fetch response
   * @returns {*} Parsed response data
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    if (contentType && contentType.includes('text/')) {
      return await response.text();
    }
    
    return await response.blob();
  }

  /**
   * Parse error response
   * @param {Response} response - Error response
   * @returns {Object} Error data
   */
  async parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      const text = await response.text();
      return { message: text || response.statusText };
    } catch {
      return { message: response.statusText || 'Unknown error' };
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {*} data - Request body data
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {*} data - Request body data
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {*} data - Request body data
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async patch(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Upload file
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {Object} options - Additional options
   * @returns {Promise} Response data
   */
  async upload(endpoint, formData, options = {}) {
    const uploadOptions = { ...options };
    
    // Remove Content-Type header to let browser set it with boundary
    if (uploadOptions.headers) {
      delete uploadOptions.headers['Content-Type'];
    }
    
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
      ...uploadOptions
    });
  }

  /**
   * Set authentication token
   * @param {string} email - User email
   * @param {string} password - User password
   */
  setAuth(email, password) {
    const credentials = btoa(`${email}:${password}`);
    this.defaultHeaders.Authorization = `Basic ${credentials}`;
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    delete this.defaultHeaders.Authorization;
  }

  /**
   * Check if client is authenticated
   * @returns {boolean} Whether client has auth headers
   */
  isAuthenticated() {
    return !!this.defaultHeaders.Authorization;
  }
}

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a client error (4xx)
   * @returns {boolean}
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   * @returns {boolean}
   */
  isServerError() {
    return this.status >= 500;
  }

  /**
   * Check if error is a network error
   * @returns {boolean}
   */
  isNetworkError() {
    return this.status === 0;
  }

  /**
   * Check if error is authentication related
   * @returns {boolean}
   */
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Add authentication interceptor
apiClient.addRequestInterceptor(async (config) => {
  // Add any stored authentication credentials
  const storedAuth = localStorage.getItem('auth_credentials');
  if (storedAuth && !config.headers.Authorization) {
    config.headers.Authorization = storedAuth;
  }
  
  return config;
});

// Add response interceptor for authentication errors
apiClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Clear stored credentials on auth failure
    localStorage.removeItem('auth_credentials');
    
    // Dispatch auth failure event
    window.dispatchEvent(new CustomEvent('auth_failure'));
  }
  
  return response;
});

export { apiClient, ApiError };