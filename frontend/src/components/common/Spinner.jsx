/**
 * Loading Spinner component
 */
function Spinner({ 
  size = 'md', 
  color = 'primary',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: '',
    lg: 'spinner-lg'
  };

  const classes = [
    'spinner',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      role="status" 
      aria-hidden="true"
      style={{ color: `var(--color-${color})` }}
      {...props}
    />
  );
}

/**
 * Loading overlay component
 */
export function LoadingOverlay({ 
  loading = false, 
  children, 
  message = 'Loading...',
  className = ''
}) {
  return (
    <div className={`position-relative ${className}`}>
      {children}
      {loading && (
        <div className="loading-overlay">
          <div className="d-flex flex-column align-items-center">
            <Spinner size="lg" />
            {message && (
              <div className="mt-md text-muted">{message}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Centered loading component
 */
export function CenteredLoading({ 
  message = 'Loading...', 
  size = 'lg',
  className = ''
}) {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-3xl ${className}`}>
      <Spinner size={size} />
      {message && (
        <div className="mt-md text-muted">{message}</div>
      )}
    </div>
  );
}

export default Spinner;