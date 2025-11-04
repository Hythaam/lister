import { forwardRef } from 'react';

/**
 * Reusable Input component with validation support
 */
const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    placeholder = '',
    value = '',
    onChange,
    onBlur,
    onFocus,
    error = null,
    disabled = false,
    required = false,
    fullWidth = true,
    className = '',
    id,
    name,
    autoComplete,
    autoFocus = false,
    ...props
  },
  ref
) {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Build CSS classes
  const inputClasses = [
    'form-control',
    error ? 'is-invalid' : '',
    fullWidth ? 'w-100' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        name={name || inputId}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        {...props}
      />
      
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
});

export default Input;