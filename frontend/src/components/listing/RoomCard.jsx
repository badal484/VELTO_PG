import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ROOM_LABELS = {
  single: 'Single Occupancy',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  dormitory: 'Dormitory',
};

export default function RoomCard({ room, selected, onSelect }) {
  const isAvailable = room.availableBeds > 0;

  return (
    <div
      onClick={() => isAvailable && onSelect(room)}
      className={`p-5 rounded-2xl border-2 transition-all ${
        !isAvailable
          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
          : selected
          ? 'border-primary-500 bg-primary-50/30 cursor-pointer'
          : 'border-gray-100 hover:border-gray-300 cursor-pointer'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{ROOM_LABELS[room.type] || room.type}</h4>
          <p className={`text-xs mt-1 font-medium ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
            {isAvailable ? `${room.availableBeds} bed${room.availableBeds > 1 ? 's' : ''} available` : 'Fully booked'}
          </p>
          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {room.amenities.slice(0, 4).map((a) => (
                <span key={a} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{a}</span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-lg font-bold text-gray-900">{formatCurrency(room.price)}</p>
          <p className="text-xs text-gray-400">/month</p>
          {room.securityDeposit > 0 && (
            <p className="text-xs text-gray-400 mt-1">+{formatCurrency(room.securityDeposit)} deposit</p>
          )}
        </div>
      </div>

      {selected && isAvailable && (
        <div className="mt-3 flex items-center gap-1.5 text-primary-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-semibold">Selected</span>
        </div>
      )}
    </div>
  );
}