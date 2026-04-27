import React from 'react';

const POLICIES = [
  { range: 'More than 7 days before check-in', refund: '90% refund', color: 'text-green-600', bg: 'bg-green-50' },
  { range: '3–7 days before check-in', refund: '50% refund', color: 'text-amber-600', bg: 'bg-amber-50' },
  { range: 'Less than 3 days before check-in', refund: 'No refund', color: 'text-red-600', bg: 'bg-red-50' },
];

export default function RefundPolicyInfo({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs text-gray-400">
        Free cancellation up to 7 days before check-in.{' '}
        <span className="text-primary-500 font-medium cursor-pointer hover:underline">Learn more</span>
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
        <h4 className="font-bold text-gray-900 text-sm">Cancellation & Refund Policy</h4>
      </div>
      <div className="space-y-2">
        {POLICIES.map(p => (
          <div key={p.range} className={`flex justify-between items-center px-3 py-2.5 rounded-xl ${p.bg}`}>
            <span className="text-xs text-gray-600">{p.range}</span>
            <span className={`text-xs font-bold ${p.color}`}>{p.refund}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Security deposit is fully refundable within 7 business days after checkout.
      </p>
    </div>
  );
}