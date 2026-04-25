import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatCurrency } from '../../utils/formatters';
import RefundPolicyInfo from './RefundPolicyInfo';

export default function BookingForm({ pg, room, onSubmit, loading }) {
  const [checkIn, setCheckIn] = useState(new Date());
  const [duration, setDuration] = useState(3);
  const [specialRequests, setSpecialRequests] = useState('');

  const monthlyRent = room?.price || 0;
  const deposit = room?.securityDeposit || 0;
  const total = monthlyRent * duration;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn) return;
    onSubmit({ 
      checkIn: checkIn.toISOString().split('T')[0], 
      duration, 
      totalPrice: total, 
      securityDeposit: deposit, 
      specialRequests 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Check-in date */}
      <div>
        <label className="input-label mb-2 block">Check-In Date</label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-primary-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <DatePicker
            selected={checkIn}
            onChange={(date) => setCheckIn(date)}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            customInput={
              <button type="button" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-left flex items-center">
                <span className={checkIn ? 'text-gray-900 font-medium' : 'text-gray-400 font-normal'}>
                  {checkIn ? checkIn.toLocaleDateString('en-GB') : 'Select check-in date'}
                </span>
              </button>
            }
            required
          />
        </div>
      </div>

      {/* Duration slider */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="input-label mb-0">Duration</label>
          <span className="text-sm font-bold text-gray-900">{duration} month{duration > 1 ? 's' : ''}</span>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="w-full accent-primary-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 month</span>
          <span>12 months</span>
        </div>
      </div>

      {/* Special requests */}
      <div>
        <label className="input-label">Special Requests <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          className="input-field resize-none"
          rows={3}
          placeholder="Any specific requirements or questions..."
          value={specialRequests}
          onChange={e => setSpecialRequests(e.target.value)}
          maxLength={500}
        />
      </div>

      {/* Price breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">{formatCurrency(monthlyRent)} × {duration} month{duration > 1 ? 's' : ''}</span>
          <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
        </div>
        {deposit > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Security deposit (refundable)</span>
            <span>{formatCurrency(deposit)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total due now</span>
          <span>{formatCurrency(total + deposit)}</span>
        </div>
      </div>

      <RefundPolicyInfo compact />

      <button type="submit" disabled={loading || !checkIn || !room} className="btn-primary w-full py-4 text-base">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing…
          </span>
        ) : 'Confirm & Pay'}
      </button>
    </form>
  );
}
