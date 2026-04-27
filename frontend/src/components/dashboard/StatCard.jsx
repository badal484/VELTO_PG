import React from 'react';

export default function StatCard({ title, value, subtitle, icon, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-500',
    green:   'bg-green-50 text-green-600',
    blue:    'bg-blue-50 text-blue-600',
    amber:   'bg-amber-50 text-amber-600',
    purple:  'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] || colors.primary}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}