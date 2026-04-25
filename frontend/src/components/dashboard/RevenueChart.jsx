import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-modal border border-gray-100 px-4 py-3">
      <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
      <p className="text-base font-bold text-gray-900">{formatCurrency(payload[0]?.value || 0)}</p>
      {payload[1] && <p className="text-xs text-gray-400">{payload[1].value} bookings</p>}
    </div>
  );
};

export default function RevenueChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No revenue data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF385C" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#FF385C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} width={48} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#FF385C" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#FF385C' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
