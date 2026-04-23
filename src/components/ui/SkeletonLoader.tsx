import React from 'react';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '1rem',
  radius = 'rem',
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-${radius} ${className}`}
      style={{ width, height }}
    />
  );
};

export default SkeletonLoader;