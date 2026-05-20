import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-premium-200 border-t-premium-600 ${sizes[size]} ${className}`} 
      />
    </div>
  );
};

export default Spinner;
