import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with JSON serialization
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {Array} [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove value from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Custom hook for managing sessionStorage with JSON serialization
 * @param {string} key - The sessionStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {Array} [value, setValue, removeValue]
 */
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Custom hook for persisting form data in localStorage
 * @param {string} formKey - Unique key for the form
 * @param {Object} initialData - Initial form data
 * @returns {Object} { formData, updateField, updateFields, clearForm, hasUnsavedChanges }
 */
export function usePersistedForm(formKey, initialData = {}) {
  const storageKey = `form_${formKey}`;
  const [formData, setFormData] = useLocalStorage(storageKey, initialData);
  const [originalData] = useState(initialData);

  // Update a single field
  const updateField = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Update multiple fields
  const updateFields = (fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  };

  // Clear form data
  const clearForm = () => {
    setFormData(initialData);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return {
    formData,
    updateField,
    updateFields,
    clearForm,
    hasUnsavedChanges
  };
}

/**
 * Custom hook for managing user preferences
 * @returns {Object} User preferences and setters
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    sidebarCollapsed: false,
    language: 'en',
    notifications: {
      email: true,
      push: false,
      comments: true,
      listSharing: true
    }
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationPreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const resetPreferences = () => {
    setPreferences({
      theme: 'light',
      sidebarCollapsed: false,
      language: 'en',
      notifications: {
        email: true,
        push: false,
        comments: true,
        listSharing: true
      }
    });
  };

  return {
    preferences,
    updatePreference,
    updateNotificationPreference,
    resetPreferences
  };
}

/**
 * Custom hook for detecting if storage is available
 * @param {string} type - 'localStorage' or 'sessionStorage'
 * @returns {boolean} Whether storage is available
 */
export function useStorageAvailable(type = 'localStorage') {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      setIsAvailable(true);
    } catch {
      setIsAvailable(false);
    }
  }, [type]);

  return isAvailable;
}