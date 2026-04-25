import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, getPGTypeLabel } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export default function PGCard({ pg, isWishlisted = false, onWishlistToggle }) {
  const { user } = useAuth();
  const { _id, name, address, images, type, rating, reviewCount, priceFrom, rooms, featured, owner } = pg;
  const isMine = user && (owner?.toString() === user._id || owner === user._id || owner?._id === user._id);
  const displayPrice = priceFrom || rooms?.[0]?.price || 0;

  return (
    <div className="card-interactive group overflow-hidden">
      <Link to={`/pg/${_id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <img
            src={images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isMine && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">Managed by You</span>
            )}
            {featured && (
              <span className="badge-primary text-[11px] px-2 py-0.5 shadow-sm">Elite</span>
            )}
            <span className={`badge text-[11px] px-2 py-0.5 shadow-sm ${
              type === 'male' ? 'badge-male' : type === 'female' ? 'badge-female' : 'badge-coed'
            }`}>
              {getPGTypeLabel(type)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="text-sm font-bold text-gray-900 truncate">{name}</h3>
            {rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold text-gray-900">{rating.toFixed(1)}</span>
                {reviewCount > 0 && <span className="text-xs text-gray-400">({reviewCount})</span>}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{address?.area}, {address?.city}</span>
          </p>

          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
            <span className="text-xs text-gray-400">/month</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
