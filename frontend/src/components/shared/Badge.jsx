import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    primary:  'bg-primary-50 text-primary-600',
    success:  'bg-green-50 text-green-700',
    warning:  'bg-amber-50 text-amber-700',
    error:    'bg-red-50 text-red-700',
    neutral:  'bg-gray-100 text-gray-600',
    male:     'bg-blue-50 text-blue-700',
    female:   'bg-pink-50 text-pink-700',
    'co-ed':  'bg-purple-50 text-purple-700',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
