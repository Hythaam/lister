import { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * Reusable Modal component with backdrop and keyboard support
 */
function Modal({
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'md',
  closable = true,
  footer = null,
  className = '',
  backdropClosable = true,
  ...props
}) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && closable && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closable, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (
      backdropClosable &&
      closable &&
      onClose &&
      e.target === backdropRef.current
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Build CSS classes
  const modalClasses = ['modal', 'show'].join(' ');
  const dialogClasses = [
    'modal-dialog',
    size === 'sm' ? 'modal-sm' : '',
    size === 'lg' ? 'modal-lg' : '',
    size === 'xl' ? 'modal-xl' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Modal backdrop */}
      <div 
        className="modal-backdrop show" 
        ref={backdropRef}
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div
        className={modalClasses}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <div className={dialogClasses}>
          <div 
            className="modal-content"
            ref={modalRef}
            tabIndex="-1"
          >
            {/* Modal header */}
            {(title || closable) && (
              <div className="modal-header">
                {title && (
                  <h5 className="modal-title">{title}</h5>
                )}
                
                {closable && (
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={onClose}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            
            {/* Modal body */}
            <div className="modal-body">
              {children}
            </div>
            
            {/* Modal footer */}
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Confirmation Modal component
 */
export function ConfirmModal({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'danger', 'warning'
  loading = false
}) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  const confirmVariant = {
    default: 'primary',
    danger: 'danger',
    warning: 'warning'
  }[type] || 'primary';

  const footer = (
    <div className="btn-group-responsive">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={handleConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      closable={!loading}
      backdropClosable={!loading}
    >
      <p>{message}</p>
    </Modal>
  );
}

export default Modal;