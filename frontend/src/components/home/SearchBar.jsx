import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BANGALORE_AREAS } from '../../utils/bangaloreAreas';

export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const ref = useRef(null);
  const typeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 1) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    setSuggestions(BANGALORE_AREAS.filter(a => a.name.toLowerCase().includes(q)).slice(0, 6));
  }, [query]);

  useEffect(() => {
    const handler = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setShowSuggestions(false); 
      if (typeRef.current && !typeRef.current.contains(e.target)) setShowTypeMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (type) params.set('type', type);
    navigate(`/listings?${params.toString()}`);
  };

  const selectArea = (area) => {
    setQuery(area.name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSearch} className={`bg-white rounded-2xl md:rounded-[2rem] shadow-modal p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 ${className}`}>
      {/* Search input */}
      <div ref={ref} className="relative flex-1">
        <div className="flex items-center gap-3 px-4 py-2">
          <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by area, PG name or landmark…"
            className="w-full border-none focus:outline-none text-gray-900 text-sm font-medium placeholder:text-gray-400 bg-transparent"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-modal border border-gray-100 z-50 overflow-hidden">
            {suggestions.map(a => (
              <button
                key={a.name}
                type="button"
                onClick={() => selectArea(a)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
              >
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-gray-200" />

      {/* Type selector (Custom Dropdown) */}
      <div className="relative group" ref={typeRef}>
        <button
          type="button"
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition-colors md:w-44 whitespace-nowrap"
        >
          <div className="w-5 h-5 flex items-center justify-center text-primary-500">
            {type === 'male' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M16.5 7.5L12 12" /></svg>
            ) : type === 'female' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 15v5m-2-2h4" /></svg>
            ) : type === 'co-ed' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            )}
          </div>
          <span className="flex-1 text-left">
            {type === 'male' ? 'Male Only' : type === 'female' ? 'Female Only' : type === 'co-ed' ? 'Co-living' : 'All Stays'}
          </span>
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showTypeMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showTypeMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-modal border border-gray-100 z-50 overflow-hidden py-1.5 slide-up">
            {[
              { id: '', label: 'All Stays', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
              { id: 'male', label: 'Male Only', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M16.5 7.5L12 12" /></svg> },
              { id: 'female', label: 'Female Only', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 15v5m-2-2h4" /></svg> },
              { id: 'co-ed', label: 'Co-living', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setType(opt.id); setShowTypeMenu(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${type === opt.id ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className={`${type === opt.id ? 'text-primary-500' : 'text-gray-400'}`}>
                  {opt.icon}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary md:rounded-[1.5rem] w-full md:w-auto px-8">
        Search
      </button>
    </form>
  );
}