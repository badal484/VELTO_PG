import React from 'react';

export default function Loader({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  const spinner = (
    <div className={`${sizes[size] || sizes.md} border-gray-100 border-t-primary-500 rounded-full animate-spin`} />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex justify-center py-8">{spinner}</div>;
}