import React from 'react';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? 'bg-primary-500 text-white' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx + 1}
              </div>
              <p className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${active ? 'text-gray-900' : done ? 'text-primary-500' : 'text-gray-400'}`}>
                {step}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${done ? 'bg-primary-500' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
