import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import PGCard from '../listing/PGCard';
import PGCardSkeleton from '../listing/PGCardSkeleton';

export default function FeaturedPGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pgs/featured')
      .then(({ data }) => setPgs(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-[0.2em] mb-3 block">Premium Selection</span>
            <h2 className="section-title">The Elite Collection</h2>
            <p className="text-gray-500 mt-3 leading-relaxed max-w-md">
              Hand-picked properties verified for quality, safety, and comfort.
            </p>
          </div>
          <Link to="/listings" className="text-primary-500 font-bold hover:underline flex items-center gap-1.5 group flex-shrink-0">
            Explore All
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <PGCardSkeleton key={i} />)
            : pgs.map(pg => <PGCard key={pg._id} pg={pg} />)
          }
        </div>
      </div>
    </section>
  );
}