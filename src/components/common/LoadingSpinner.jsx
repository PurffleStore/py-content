import React from 'react';

const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-gray-200 border-t-orange-600 rounded-full spinner`}></div>
      {label && <p className="text-gray-600 font-medium">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
