import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import SEOHead from '../components/common/SEOHead';
import PGCard from '../components/listing/PGCard';
import PGCardSkeleton from '../components/listing/PGCardSkeleton';
import PGFilters from '../components/listing/PGFilters';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const loaderRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'owner') {
      navigate('/owner/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const getFilters = useCallback(() => ({
    search: searchParams.get('search') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    amenities: searchParams.get('amenities') || '',
    meals: searchParams.get('meals') || '',
    sort: searchParams.get('sort') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    roomType: searchParams.get('roomType') || '',
  }), [searchParams]);

  const filters = getFilters();

  const fetchPGs = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...getFilters(), page: pageNum, limit: 12 };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const { data } = await api.get('/pgs', { params });
      setPgs(prev => append ? [...prev, ...data.data] : data.data);
      setTotal(data.pagination.total);
      setHasMore(pageNum < data.pagination.pages);
    } catch {
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getFilters]);

  useEffect(() => {
    setPage(1);
    fetchPGs(1);
  }, [searchParams, fetchPGs]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPGs(nextPage, true);
      }
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchPGs]);

  const handleFilterChange = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  const handleReset = () => setSearchParams({});

  const handleNearMe = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const p = new URLSearchParams(searchParams);
      p.set('lat', pos.coords.latitude.toFixed(6));
      p.set('lng', pos.coords.longitude.toFixed(6));
      setSearchParams(p);
    }, () => alert('Location access denied'));
  };


  const activeFilterCount = [filters.area, filters.type, filters.priceMin, filters.priceMax, filters.amenities, filters.meals].filter(Boolean).length;

  return (
    <>
      <SEOHead title="Find PGs in Bangalore" description="Browse verified PG accommodations across Bangalore. Filter by area, price, amenities and book instantly." />

      <div className="pt-[72px] min-h-screen bg-white flex flex-col">
        {/* Toolbar */}
        <div className="sticky top-[72px] z-30 bg-white border-b border-gray-100">
          <div className="page-container py-3 flex items-center gap-3 flex-wrap">
            {/* Near me */}
            <button onClick={handleNearMe} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Near Me
            </button>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-semibold border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters {activeFilterCount > 0 && <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
            </button>

            {/* Sort */}
            <select
              className="text-xs font-semibold border border-gray-200 px-3 py-2 rounded-xl bg-white focus:outline-none hover:border-gray-300 transition-colors"
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div className="flex-1" />
            <span className="text-xs text-gray-400 font-medium">{total} properties</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-gray-100 overflow-y-auto sticky top-[120px] max-h-[calc(100vh-120px)] p-6">
            <PGFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="p-6">
              {error ? (
                <ErrorState message={error} onRetry={() => fetchPGs(1)} />
              ) : loading && pgs.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }, (_, i) => <PGCardSkeleton key={i} />)}
                </div>
              ) : pgs.length === 0 ? (
                <EmptyState
                  title="No properties found"
                  description="Try adjusting your filters or searching a different area."
                  action={{ label: 'Clear Filters', onClick: handleReset }}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {pgs.map(pg => (
                      <div key={pg._id}>
                        <PGCard pg={pg} />
                      </div>
                    ))}
                  </div>
                  <div ref={loaderRef} className="h-10 flex items-center justify-center mt-4">
                    {loading && hasMore && <div className="w-6 h-6 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />}
                  </div>
                </>
              )}
            </div>
          </main>

        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PGFilters filters={filters} onChange={(k, v) => { handleFilterChange(k, v); }} onReset={() => { handleReset(); setShowFilters(false); }} />
            <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-4">
              Show {total} Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
