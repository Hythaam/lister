import { VALIDATION_RULES, ERROR_MESSAGES } from './constants.js';

/**
 * Form validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email) {
    return VALIDATION_RULES.REQUIRED.MESSAGE;
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return VALIDATION_RULES.EMAIL.MESSAGE;
  }
  
  return null;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {boolean} requireStrong - Whether to require strong password
 * @returns {string|null} Error message or null if valid
 */
export function validatePassword(password, requireStrong = true) {
  if (!password) {
    return VALIDATION_RULES.REQUIRED.MESSAGE;
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`;
  }
  
  if (requireStrong && !VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
    return VALIDATION_RULES.PASSWORD.MESSAGE;
  }
  
  return null;
}

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null if valid
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (!confirmPassword) {
    return VALIDATION_RULES.REQUIRED.MESSAGE;
  }
  
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
  }
  
  return null;
}

/**
 * Validate name field
 * @param {string} name - Name to validate
 * @param {boolean} required - Whether field is required
 * @returns {string|null} Error message or null if valid
 */
export function validateName(name, required = true) {
  if (!name && required) {
    return VALIDATION_RULES.REQUIRED.MESSAGE;
  }
  
  if (name && name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters long`;
  }
  
  if (name && name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return `Name must be no more than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters long`;
  }
  
  if (name && !VALIDATION_RULES.NAME.PATTERN.test(name)) {
    return VALIDATION_RULES.NAME.MESSAGE;
  }
  
  return null;
}

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  
  return null;
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export function validateLength(value, minLength, maxLength, fieldName = 'Field') {
  if (!value) return null;
  
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  
  return null;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether field is required
 * @returns {string|null} Error message or null if valid
 */
export function validateUrl(url, required = false) {
  if (!url && required) {
    return VALIDATION_RULES.REQUIRED.MESSAGE;
  }
  
  if (!url) return null;
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    required = false
  } = options;
  
  if (!file && required) {
    return 'Please select a file';
  }
  
  if (!file) return null;
  
  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
}

/**
 * Validate form object with field validators
 * @param {Object} formData - Form data to validate
 * @param {Object} validators - Field validators object
 * @returns {Object} Validation errors object
 */
export function validateForm(formData, validators) {
  const errors = {};
  
  Object.keys(validators).forEach(fieldName => {
    const validator = validators[fieldName];
    const value = formData[fieldName];
    
    if (typeof validator === 'function') {
      // Check if validator expects formData as second parameter
      const error = validator.length > 1 ? validator(value, formData) : validator(value);
      if (error) {
        errors[fieldName] = error;
      }
    } else if (Array.isArray(validator)) {
      // Multiple validators for one field
      for (const validatorFn of validator) {
        const error = validatorFn.length > 1 ? validatorFn(value, formData) : validatorFn(value);
        if (error) {
          errors[fieldName] = error;
          break; // Stop at first error
        }
      }
    }
  });
  
  return errors;
}

/**
 * Create validator functions for common patterns
 */
export const createValidators = {
  /**
   * Create required field validator
   * @param {string} fieldName - Field name for error message
   * @returns {Function} Validator function
   */
  required: (fieldName = 'This field') => (value) => validateRequired(value, fieldName),
  
  /**
   * Create email validator
   * @param {boolean} required - Whether field is required
   * @returns {Function} Validator function
   */
  email: (required = true) => (value) => {
    if (!value && !required) return null;
    return validateEmail(value);
  },
  
  /**
   * Create password validator
   * @param {boolean} requireStrong - Whether to require strong password
   * @returns {Function} Validator function
   */
  password: (requireStrong = true) => (value) => validatePassword(value, requireStrong),
  
  /**
   * Create name validator
   * @param {boolean} required - Whether field is required
   * @returns {Function} Validator function
   */
  name: (required = true) => (value) => validateName(value, required),
  
  /**
   * Create length validator
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @param {string} fieldName - Field name for error message
   * @returns {Function} Validator function
   */
  length: (minLength, maxLength, fieldName = 'Field') => (value) => 
    validateLength(value, minLength, maxLength, fieldName),
  
  /**
   * Create URL validator
   * @param {boolean} required - Whether field is required
   * @returns {Function} Validator function
   */
  url: (required = false) => (value) => validateUrl(value, required),
  
  /**
   * Create password confirmation validator
   * @param {string} passwordFieldName - Name of the password field to compare against
   * @returns {Function} Validator function
   */
  confirmPassword: (passwordFieldName = 'password') => (value, formData) => 
    validatePasswordConfirmation(formData[passwordFieldName], value),
  
  /**
   * Create custom validator
   * @param {Function} validatorFn - Custom validation function
   * @returns {Function} Validator function
   */
  custom: (validatorFn) => validatorFn
};

/**
 * Common form validation schemas
 */
export const validationSchemas = {
  /**
   * Login form validation
   */
  login: {
    email: createValidators.email(),
    password: createValidators.required('Password')
  },
  
  /**
   * Registration form validation
   */
  register: {
    email: createValidators.email(),
    name: createValidators.name(false),
    password: createValidators.password(),
    confirmPassword: createValidators.confirmPassword('password')
  },
  
  /**
   * Account activation form validation
   */
  activate: {
    name: createValidators.name(),
    password: createValidators.password(),
    confirmPassword: createValidators.confirmPassword('password')
  },
  
  /**
   * Change password form validation
   */
  changePassword: {
    currentPassword: createValidators.required('Current password'),
    newPassword: createValidators.password(),
    confirmPassword: createValidators.confirmPassword('newPassword')
  },
  
  /**
   * List form validation
   */
  list: {
    title: createValidators.required('List title'),
    description: createValidators.length(0, 500, 'Description')
  },
  
  /**
   * Item form validation
   */
  item: {
    title: createValidators.required('Item title'),
    description: createValidators.length(0, 1000, 'Description'),
    url: createValidators.url(false)
  },
  
  /**
   * Comment form validation
   */
  comment: {
    content: createValidators.required('Comment')
  },
  
  /**
   * Group form validation
   */
  group: {
    name: createValidators.required('Group name'),
    description: createValidators.length(0, 500, 'Description')
  }
};