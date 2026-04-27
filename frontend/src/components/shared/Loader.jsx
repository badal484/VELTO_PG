import React from 'react';

const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className={`rounded-full border-gray-100 border-t-primary-500 animate-spin ${sizeClasses[size] || sizeClasses.md}`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
        <p className="mt-4 text-sm font-bold text-gray-900 tracking-tight animate-pulse">Loading Velto Stay...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinner}
    </div>
  );
};

export const Skeleton = ({ className }) => (
  <div className={`skeleton ${className}`}></div>
);

export const PGCardSkeleton = () => (
  <div className="card">
    <div className="aspect-[4/3] skeleton rounded-t-2xl"></div>
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-24" />
      <div className="pt-2">
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export default Loader;