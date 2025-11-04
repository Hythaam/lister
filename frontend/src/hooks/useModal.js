import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state and interactions
 * @param {boolean} initialIsOpen - Initial open state
 * @returns {Object} Modal state and controls
 */
export function useModal(initialIsOpen = false) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [data, setData] = useState(null);

  const openModal = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      setData(null);
    }
  }, [isOpen]);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal
  };
}

/**
 * Custom hook for managing multiple modals
 * @returns {Object} Multi-modal state and controls
 */
export function useMultiModal() {
  const [modals, setModals] = useState({});

  const openModal = useCallback((modalId, data = null) => {
    setModals(prev => ({
      ...prev,
      [modalId]: {
        isOpen: true,
        data
      }
    }));
  }, []);

  const closeModal = useCallback((modalId) => {
    setModals(prev => ({
      ...prev,
      [modalId]: {
        isOpen: false,
        data: null
      }
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({});
  }, []);

  const isModalOpen = useCallback((modalId) => {
    return modals[modalId]?.isOpen || false;
  }, [modals]);

  const getModalData = useCallback((modalId) => {
    return modals[modalId]?.data || null;
  }, [modals]);

  const toggleModal = useCallback((modalId, data = null) => {
    const isCurrentlyOpen = isModalOpen(modalId);
    if (isCurrentlyOpen) {
      closeModal(modalId);
    } else {
      openModal(modalId, data);
    }
  }, [isModalOpen, closeModal, openModal]);

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData,
    toggleModal
  };
}

/**
 * Custom hook for managing confirmation modals
 * @returns {Object} Confirmation modal state and controls
 */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirm Action',
    message: 'Are you sure you want to continue?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'default' // 'default', 'danger', 'warning'
  });

  const showConfirm = useCallback((options) => {
    setConfig(prev => ({
      ...prev,
      ...options
    }));
    setIsOpen(true);
  }, []);

  const hideConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback(() => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    hideConfirm();
  }, [config, hideConfirm]);

  const cancel = useCallback(() => {
    if (config.onCancel) {
      config.onCancel();
    }
    hideConfirm();
  }, [config, hideConfirm]);

  return {
    isOpen,
    config,
    showConfirm,
    hideConfirm,
    confirm,
    cancel
  };
}

/**
 * Custom hook for managing modal with form validation
 * @param {Function} onSubmit - Function to call on form submission
 * @param {Function} validator - Function to validate form data
 * @returns {Object} Modal form state and controls
 */
export function useModalForm(onSubmit, validator = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = useCallback((initialData = {}) => {
    setFormData(initialData);
    setErrors({});
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setFormData({});
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const updateFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!validator) return true;

    const validationErrors = validator(formData);
    setErrors(validationErrors || {});
    
    return !validationErrors || Object.keys(validationErrors).length === 0;
  }, [validator, formData]);

  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      closeModal();
    } catch (error) {
      // Handle submission errors
      if (error.validationErrors) {
        setErrors(error.validationErrors);
      } else {
        setErrors({
          general: error.message || 'An error occurred while submitting the form'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, formData, closeModal]);

  return {
    isOpen,
    formData,
    errors,
    isSubmitting,
    openModal,
    closeModal,
    updateField,
    updateFields,
    submitForm,
    validateForm
  };
}

/**
 * Custom hook for managing modal navigation history
 * @returns {Object} Modal navigation state and controls
 */
export function useModalNavigation() {
  const [modalStack, setModalStack] = useState([]);

  const pushModal = useCallback((modalId, data = null) => {
    setModalStack(prev => [...prev, { id: modalId, data }]);
  }, []);

  const popModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  const replaceModal = useCallback((modalId, data = null) => {
    setModalStack(prev => {
      const newStack = [...prev];
      if (newStack.length > 0) {
        newStack[newStack.length - 1] = { id: modalId, data };
      } else {
        newStack.push({ id: modalId, data });
      }
      return newStack;
    });
  }, []);

  const clearModalStack = useCallback(() => {
    setModalStack([]);
  }, []);

  const currentModal = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
  const canGoBack = modalStack.length > 1;

  return {
    modalStack,
    currentModal,
    canGoBack,
    pushModal,
    popModal,
    replaceModal,
    clearModalStack
  };
}