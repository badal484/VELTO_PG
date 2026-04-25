import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  title = "No results found", 
  message = "Try adjusting your filters or search terms to find what you're looking for.",
  actionText,
  onAction,
  icon: Icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-50 p-6 rounded-full mb-6">
        {Icon ? (
          <Icon className="w-12 h-12 text-gray-400" />
        ) : (
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed mb-8">
        {message}
      </p>
      {actionText && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};

export default EmptyState;
