import React from 'react';

const Input = ({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  containerClassName = '',
  icon: Icon,
  ...props 
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

export const TextArea = ({ label, error, className = '', containerClassName = '', ...props }) => (
  <div className={`w-full ${containerClassName}`}>
    {label && <label className="input-label">{label}</label>}
    <textarea
      className={`input-field min-h-[120px] resize-none ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="input-error">{error}</p>}
  </div>
);

export const Select = ({ label, error, options = [], className = '', containerClassName = '', ...props }) => (
  <div className={`w-full ${containerClassName}`}>
    {label && <label className="input-label">{label}</label>}
    <select
      className={`input-field appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23949494'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="input-error">{error}</p>}
  </div>
);

export default Input;
