import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 hover:scale-105',
    secondary: 'bg-blue-900 text-white hover:bg-blue-950 focus:ring-blue-700 hover:scale-105',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400 hover:scale-105',
    ghost: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:scale-105',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'cursor-pointer';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full spinner"></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
