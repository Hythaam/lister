import { DATE_FORMATS } from './constants';

/**
 * Data formatting utilities
 */

/**
 * Format date using various formats
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type from DATE_FORMATS
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = DATE_FORMATS.MEDIUM, options = {}) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const { locale = 'en-US', timeZone } = options;
  
  // Simple format patterns
  const patterns = {
    [DATE_FORMATS.SHORT]: { month: 'numeric', day: 'numeric', year: 'numeric' },
    [DATE_FORMATS.MEDIUM]: { month: 'short', day: 'numeric', year: 'numeric' },
    [DATE_FORMATS.LONG]: { month: 'long', day: 'numeric', year: 'numeric' },
    [DATE_FORMATS.FULL]: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    [DATE_FORMATS.ISO]: undefined, // Handle separately
    [DATE_FORMATS.DATETIME]: { 
      month: 'numeric', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    },
    [DATE_FORMATS.TIME]: { hour: 'numeric', minute: '2-digit' }
  };
  
  if (format === DATE_FORMATS.ISO) {
    return dateObj.toISOString().split('T')[0];
  }
  
  const formatOptions = patterns[format] || patterns[DATE_FORMATS.MEDIUM];
  
  if (timeZone) {
    formatOptions.timeZone = timeZone;
  }
  
  return dateObj.toLocaleDateString(locale, formatOptions);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date, options = {}) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  const { locale = 'en-US' } = options;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  
  // Use Intl.RelativeTimeFormat if available
  if (Intl.RelativeTimeFormat) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (Math.abs(diffSeconds) < 60) {
      return rtf.format(diffSeconds, 'second');
    } else if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, 'minute');
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    } else {
      return rtf.format(diffDays, 'day');
    }
  }
  
  // Fallback for older browsers
  const abs = Math.abs;
  const isPast = diffMs < 0;
  
  if (abs(diffSeconds) < 60) {
    return isPast ? 'just now' : 'in a moment';
  } else if (abs(diffMinutes) < 60) {
    const unit = abs(diffMinutes) === 1 ? 'minute' : 'minutes';
    return isPast ? `${abs(diffMinutes)} ${unit} ago` : `in ${abs(diffMinutes)} ${unit}`;
  } else if (abs(diffHours) < 24) {
    const unit = abs(diffHours) === 1 ? 'hour' : 'hours';
    return isPast ? `${abs(diffHours)} ${unit} ago` : `in ${abs(diffHours)} ${unit}`;
  } else {
    const unit = abs(diffDays) === 1 ? 'day' : 'days';
    return isPast ? `${abs(diffDays)} ${unit} ago` : `in ${abs(diffDays)} ${unit}`;
  }
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format number with thousands separators
 * @param {number} number - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number string
 */
export function formatNumber(number, options = {}) {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  const { locale = 'en-US', style = 'decimal', ...intlOptions } = options;
  
  return new Intl.NumberFormat(locale, { style, ...intlOptions }).format(number);
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., 'USD')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD', options = {}) {
  return formatNumber(amount, {
    style: 'currency',
    currency,
    ...options
  });
}

/**
 * Format percentage
 * @param {number} value - Value to format (0.5 = 50%)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, options = {}) {
  return formatNumber(value, {
    style: 'percent',
    ...options
  });
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str) return '';
  
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert camelCase to Title Case
 * @param {string} str - CamelCase string
 * @returns {string} Title case string
 */
export function camelToTitle(str) {
  if (!str) return '';
  
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
    .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {string} format - Format pattern (default: US format)
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone, format = 'US') {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (format === 'US') {
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
  }
  
  return phone; // Return original if can't format
}

/**
 * Format address
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export function formatAddress(address) {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
}

/**
 * Format list of items with proper conjunctions
 * @param {Array} items - Array of items to format
 * @param {string} conjunction - Conjunction to use ('and', 'or')
 * @returns {string} Formatted list string
 */
export function formatList(items, conjunction = 'and') {
  if (!Array.isArray(items) || items.length === 0) return '';
  
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}

/**
 * Format name display (handle empty names gracefully)
 * @param {Object} user - User object with name and email
 * @returns {string} Display name
 */
export function formatUserName(user) {
  if (!user) return 'Unknown User';
  
  if (user.name && user.name.trim()) {
    return user.name.trim();
  }
  
  if (user.email) {
    // Use part before @ as display name
    return user.email.split('@')[0];
  }
  
  return 'Unknown User';
}

/**
 * Format initials from name
 * @param {string} name - Full name
 * @param {number} maxLength - Maximum number of initials
 * @returns {string} Initials
 */
export function formatInitials(name, maxLength = 2) {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  const initials = words
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxLength);
  
  return initials.join('');
}

/**
 * Remove HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHtml(html) {
  if (!html) return '';
  
  // Create a temporary element to use innerHTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  return temp.textContent || temp.innerText || '';
}

/**
 * Format URL for display (remove protocol, www, etc.)
 * @param {string} url - URL to format
 * @returns {string} Formatted URL
 */
export function formatDisplayUrl(url) {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    let display = urlObj.hostname;
    
    // Remove www.
    if (display.startsWith('www.')) {
      display = display.slice(4);
    }
    
    // Add path if not root
    if (urlObj.pathname && urlObj.pathname !== '/') {
      display += urlObj.pathname;
    }
    
    return display;
  } catch {
    return url;
  }
}