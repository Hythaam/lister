import { apiClient } from './api';

/**
 * Authentication service for managing user authentication
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.authKey = 'auth_credentials';
    this.userKey = 'current_user';
  }

  /**
   * Log in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  async login(email, password) {
    try {
      // Set authentication headers
      apiClient.setAuth(email, password);
      
      // Make authenticated request to get current user
      const user = await apiClient.get('/users/me');
      
      // Store credentials and user data
      this.storeAuth(email, password);
      this.storeUser(user);
      this.currentUser = user;
      
      return user;
    } catch (error) {
      // Clear any stored auth on failure
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data
   */
  async register(userData) {
    // Register user (no auth required)
    const user = await apiClient.post('/users/register', userData);
    
    // Automatically log in with the new credentials
    if (userData.email && userData.password) {
      return await this.login(userData.email, userData.password);
    }
    
    return user;
  }

  /**
   * Activate user account
   * @param {Object} activationData - Account activation data
   * @returns {Promise<Object>} User data
   */
  async activateAccount(activationData) {
    // Activate account (requires existing partial auth)
    const user = await apiClient.post('/users/activate', activationData);
    
    // Update stored user data
    this.storeUser(user);
    this.currentUser = user;
    
    return user;
  }

  /**
   * Log out current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Optionally call logout endpoint on server
      if (apiClient.isAuthenticated()) {
        await apiClient.post('/users/logout');
      }
    } catch (error) {
      // Ignore server errors during logout
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local auth state
      this.clearAuth();
    }
  }

  /**
   * Get current user from stored data
   * @returns {Promise<Object|null>} User data or null
   */
  async getCurrentUser() {
    // If user is already loaded, return it
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from storage
    const storedUser = this.getStoredUser();
    const storedAuth = this.getStoredAuth();

    if (storedUser && storedAuth) {
      try {
        // Set auth headers
        apiClient.defaultHeaders.Authorization = storedAuth;
        
        // Verify with server (optional)
        const user = await apiClient.get('/users/me');
        this.currentUser = user;
        
        // Update stored user data if different
        if (JSON.stringify(user) !== JSON.stringify(storedUser)) {
          this.storeUser(user);
        }
        
        return user;
      } catch {
        // Clear invalid stored data
        this.clearAuth();
        return null;
      }
    }

    return null;
  }

  /**
   * Update current user data
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userData) {
    const updatedUser = await apiClient.put('/users/me', userData);
    
    this.storeUser(updatedUser);
    this.currentUser = updatedUser;
    
    return updatedUser;
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(currentPassword, newPassword) {
    await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword
    });
    
    // Update stored credentials with new password
    const user = this.getCurrentUser();
    if (user && user.email) {
      this.storeAuth(user.email, newPassword);
      apiClient.setAuth(user.email, newPassword);
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async requestPasswordReset(email) {
    await apiClient.post('/users/request-password-reset', { email });
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    await apiClient.post('/users/reset-password', {
      token,
      newPassword
    });
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.getStoredAuth() && !!this.getStoredUser();
  }

  /**
   * Store authentication credentials
   * @param {string} email - User email
   * @param {string} password - User password
   */
  storeAuth(email, password) {
    const credentials = btoa(`${email}:${password}`);
    const authHeader = `Basic ${credentials}`;
    
    localStorage.setItem(this.authKey, authHeader);
  }

  /**
   * Store user data
   * @param {Object} user - User data
   */
  storeUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Get stored authentication credentials
   * @returns {string|null} Auth header or null
   */
  getStoredAuth() {
    return localStorage.getItem(this.authKey);
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getStoredUser() {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Error parsing stored user data:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    localStorage.removeItem(this.authKey);
    localStorage.removeItem(this.userKey);
    apiClient.clearAuth();
    this.currentUser = null;
  }

  /**
   * Get user permissions
   * @returns {Array} User roles/permissions
   */
  getUserRoles() {
    const user = this.currentUser || this.getStoredUser();
    return user?.roles || [];
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has role
   */
  hasRole(role) {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  /**
   * Check if user is admin
   * @returns {boolean} Whether user is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Get user's name or email
   * @returns {string} Display name
   */
  getUserDisplayName() {
    const user = this.currentUser || this.getStoredUser();
    return user?.name || user?.email || 'Unknown User';
  }

  /**
   * Set up authentication event listeners
   */
  setupEventListeners() {
    // Listen for auth failure events from API client
    window.addEventListener('auth_failure', () => {
      this.clearAuth();
      
      // Dispatch custom event for app to handle
      window.dispatchEvent(new CustomEvent('auth_logout', {
        detail: { reason: 'auth_failure' }
      }));
    });
  }
}

// Create singleton instance
const authService = new AuthService();

// Setup event listeners
authService.setupEventListeners();

export { authService };