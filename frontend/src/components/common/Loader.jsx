// src/components/common/Loader.jsx
import React from 'react';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-6 w-6 border-2',
    xl: 'h-8 w-8 border-2',
  };

  return (
    <span className={`inline-block animate-spin rounded-full border-t-2 border-b-2 border-current ${sizes[size]} ${className}`} />
  );
};

export default Loader;