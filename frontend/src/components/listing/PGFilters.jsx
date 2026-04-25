import React, { useState, useRef, useEffect } from 'react';
import { BANGALORE_AREAS } from '../../utils/bangaloreAreas';

const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'ac', label: 'AC' },
  { key: 'meals', label: 'Meals' },
  { key: 'laundry', label: 'Laundry' },
  { key: 'parking', label: 'Parking' },
  { key: 'gym', label: 'Gym' },
  { key: 'security', label: 'Security' },
  { key: 'housekeeping', label: 'Housekeeping' },
];

export default function PGFilters({ filters, onChange, onReset }) {
  const [showAreaMenu, setShowAreaMenu] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const areaRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (areaRef.current && !areaRef.current.contains(e.target)) setShowAreaMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const handleAmenity = (key) => {
    const current = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    const updated = current.includes(key) ? current.filter(a => a !== key) : [...current, key];
    onChange('amenities', updated.join(','));
  };

  const selectedAmenities = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];

  return (
    <div className="space-y-6">
      {/* Area */}
      {/* Area */}
      <div>
        <label className="input-label">Area</label>
        <div className="relative" ref={areaRef}>
          <div 
            onClick={() => setShowAreaMenu(!showAreaMenu)}
            className="input-field cursor-pointer flex justify-between items-center bg-white"
          >
            <span className={filters.area ? 'text-gray-900' : 'text-gray-400'}>
              {filters.area || 'All Areas'}
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showAreaMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showAreaMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-modal border border-gray-100 z-50 overflow-hidden slide-up">
              <div className="p-2 border-b border-gray-50">
                <input
                  type="text"
                  placeholder="Search area..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={areaSearch}
                  onChange={e => setAreaSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                <button
                  onClick={() => { onChange('area', ''); setShowAreaMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!filters.area ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Areas
                </button>
                {BANGALORE_AREAS.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase())).map(a => (
                  <button
                    key={a.name}
                    onClick={() => { onChange('area', a.name); setShowAreaMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filters.area === a.name ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="input-label">PG Type</label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'All', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
            { value: 'male', label: 'Boys', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M16.5 7.5L12 12" /></svg> },
            { value: 'female', label: 'Girls', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 15v5m-2-2h4" /></svg> },
            { value: 'co-ed', label: 'Co-ed', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange('type', opt.value)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1 uppercase tracking-wider ${
                filters.type === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-100 text-gray-500 bg-white hover:border-gray-200'
              }`}
            >
              <div className={filters.type === opt.value ? 'text-primary-500' : 'text-gray-400'}>{opt.icon}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sharing */}
      <div>
        <label className="input-label">Sharing Type</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'single', label: 'Single' },
            { value: 'double', label: 'Double' },
            { value: 'triple', label: 'Triple' },
            { value: 'dormitory', label: 'Dorm' },
          ].map(opt => {
            const current = filters.roomType ? filters.roomType.split(',').filter(Boolean) : [];
            const isSelected = current.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => {
                  const updated = isSelected ? current.filter(t => t !== opt.value) : [...current, opt.value];
                  onChange('roomType', updated.join(','));
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-100 text-gray-600 bg-white hover:border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      {/* Price Range */}
      <div>
        <label className="input-label">Price Range (₹/month)</label>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
            <input
              type="number"
              placeholder="Min"
              className="w-full border border-gray-100 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              value={filters.priceMin || ''}
              onChange={e => onChange('priceMin', e.target.value)}
              min="0"
            />
          </div>
          <span className="text-gray-300 font-bold">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full border border-gray-100 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              value={filters.priceMax || ''}
              onChange={e => onChange('priceMax', e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="input-label">Amenities</label>
        <div className="grid grid-cols-2 gap-2">
          {AMENITY_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleAmenity(opt.key)}
              className={`py-2 px-3 rounded-xl text-[11px] font-bold border text-left transition-all ${
                selectedAmenities.includes(opt.key)
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-50 text-gray-500 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="pt-2">
        <label className="flex items-center justify-between cursor-pointer bg-gray-50/50 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
          <span className="text-xs text-gray-700 font-bold uppercase tracking-wider">Include Meals</span>
          <div
            onClick={(e) => { e.preventDefault(); onChange('meals', filters.meals === 'true' ? '' : 'true'); }}
            className={`w-10 h-5 rounded-full transition-colors relative ${filters.meals === 'true' ? 'bg-primary-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.meals === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>

      {/* Reset */}
      <div className="pt-4">
        <button onClick={onReset} className="w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
          Reset All Filters
        </button>
      </div>
    </div>
  );
}
