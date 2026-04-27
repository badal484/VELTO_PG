import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';

export default function BookingCard({ booking, onCancel, isCancelling }) {
  const { _id, bookingId, pg, roomType, checkIn, duration, totalPrice, status, payment } = booking;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <Link to={`/pg/${pg?._id}`} className="font-bold text-gray-900 hover:text-primary-500 transition-colors text-sm truncate block">
            {pg?.name || 'Property'}
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">{pg?.address?.area}</p>
        </div>
        <span className={getStatusColor(status)}>{status}</span>
      </div>

      {pg?.images?.[0]?.url && (
        <img src={pg.images[0].url} alt={pg.name} className="w-full h-32 object-cover rounded-xl mb-4" />
      )}

      <div className="grid grid-cols-3 gap-3 text-xs mb-4">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-gray-400 mb-0.5">Check-In</p>
          <p className="font-bold text-gray-900">{formatDate(checkIn)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-gray-400 mb-0.5">Duration</p>
          <p className="font-bold text-gray-900">{duration}mo</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-gray-400 mb-0.5">Room</p>
          <p className="font-bold text-gray-900 capitalize">{roomType}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(totalPrice)}</p>
          <p className="text-xs text-gray-400">{payment?.status === 'paid' ? 'Paid' : 'Pending payment'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/pg/${pg?._id}`} className="btn-ghost !py-2 text-xs">View PG</Link>
          {(status === 'pending' || status === 'confirmed') && onCancel && (
            <button 
              onClick={() => onCancel(_id)} 
              disabled={isCancelling}
              className="btn-danger !py-2 !px-3 text-xs flex items-center gap-1 min-w-[70px] justify-center"
            >
              {isCancelling ? (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-300 mt-3">Ref: {bookingId}</p>
    </div>
  );
}