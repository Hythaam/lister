/**
 * Application constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  LOGOUT: '/users/logout',
  ACTIVATE: '/users/activate',
  ME: '/users/me',
  CHANGE_PASSWORD: '/users/change-password',
  REQUEST_PASSWORD_RESET: '/users/request-password-reset',
  RESET_PASSWORD: '/users/reset-password',
  
  // Users
  USERS: '/users',
  
  // Lists
  LISTS: '/lists',
  
  // Items
  ITEMS: '/items',
  
  // Comments
  COMMENTS: '/comments',
  
  // Groups
  GROUPS: '/groups'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// UI Constants
export const UI_CONSTANTS = {
  // Breakpoints (must match CSS)
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  },
  
  // Sidebar
  SIDEBAR_WIDTH: 280,
  SIDEBAR_WIDTH_COLLAPSED: 64,
  HEADER_HEIGHT: 64,
  
  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070
  }
};

// Form Validation
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE: 'Password must be at least 6 characters with uppercase, lowercase, and number'
  },
  
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-Z\s]+$/,
    MESSAGE: 'Name must be 2-255 characters and contain only letters and spaces'
  },
  
  REQUIRED: {
    MESSAGE: 'This field is required'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_CREDENTIALS: 'auth_credentials',
  CURRENT_USER: 'current_user',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  LANGUAGE: 'language'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  
  // Authentication specific
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  ACCOUNT_NOT_ACTIVATED: 'Please activate your account before logging in.',
  PASSWORD_RESET_REQUIRED: 'You must reset your password to continue.',
  
  // Form validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password does not meet requirements.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  
  // List/Item specific
  LIST_NOT_FOUND: 'List not found or you do not have access.',
  ITEM_NOT_FOUND: 'Item not found.',
  CANNOT_DELETE_LIST: 'Cannot delete list with items.',
  CANNOT_EDIT_ITEM: 'You do not have permission to edit this item.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  REGISTRATION_SUCCESS: 'Account created successfully.',
  ACTIVATION_SUCCESS: 'Account activated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PASSWORD_RESET_SENT: 'Password reset instructions sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
  
  PROFILE_UPDATED: 'Profile updated successfully.',
  PREFERENCES_SAVED: 'Preferences saved successfully.',
  
  LIST_CREATED: 'List created successfully.',
  LIST_UPDATED: 'List updated successfully.',
  LIST_DELETED: 'List deleted successfully.',
  LIST_SHARED: 'List shared successfully.',
  
  ITEM_CREATED: 'Item added successfully.',
  ITEM_UPDATED: 'Item updated successfully.',
  ITEM_DELETED: 'Item deleted successfully.',
  
  COMMENT_ADDED: 'Comment added successfully.',
  COMMENT_UPDATED: 'Comment updated successfully.',
  COMMENT_DELETED: 'Comment deleted successfully.',
  
  GROUP_CREATED: 'Group created successfully.',
  GROUP_UPDATED: 'Group updated successfully.',
  GROUP_DELETED: 'Group deleted successfully.',
  MEMBER_ADDED: 'Member added successfully.',
  MEMBER_REMOVED: 'Member removed successfully.'
};

// Modal Types
export const MODAL_TYPES = {
  CONFIRM: 'confirm',
  CREATE_LIST: 'createList',
  EDIT_LIST: 'editList',
  DELETE_LIST: 'deleteList',
  CREATE_ITEM: 'createItem',
  EDIT_ITEM: 'editItem',
  DELETE_ITEM: 'deleteItem',
  VIEW_ITEM: 'viewItem',
  CREATE_GROUP: 'createGroup',
  EDIT_GROUP: 'editGroup',
  DELETE_GROUP: 'deleteGroup',
  MANAGE_MEMBERS: 'manageMembers',
  SHARE_LIST: 'shareList',
  USER_PROFILE: 'userProfile',
  CHANGE_PASSWORD: 'changePassword'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Language Options
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de'
};

// Date Format Options
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  DATETIME: 'MM/dd/yyyy HH:mm',
  TIME: 'HH:mm'
};

// List/Item Status
export const ITEM_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// List Privacy Levels
export const LIST_PRIVACY = {
  PRIVATE: 'private',
  SHARED: 'shared',
  PUBLIC: 'public'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Export all constants as default object
export default {
  API_ENDPOINTS,
  USER_ROLES,
  UI_CONSTANTS,
  VALIDATION_RULES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MODAL_TYPES,
  THEMES,
  LANGUAGES,
  DATE_FORMATS,
  ITEM_STATUS,
  LIST_PRIVACY,
  NOTIFICATION_TYPES,
  FILE_UPLOAD,
  PAGINATION
};