import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, getPGTypeLabel } from '../../utils/formatters';
import Badge from './Badge';

const PGCard = ({ pg, isWishlisted = false, onWishlistToggle }) => {
  const { _id, name, address, images, rooms, type, rating, priceFrom, featured } = pg;

  return (
    <div className="card-interactive group">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        <img 
          src={images[0]?.url || 'https://via.placeholder.com/400x300'} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {featured && <Badge variant="primary" className="shadow-sm">Elite Collection</Badge>}
          <Badge variant={type} className="shadow-sm">{getPGTypeLabel(type)}</Badge>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistToggle && onWishlistToggle(_id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white transition-all shadow-sm active:scale-90"
        >
          <svg className={`w-5 h-5 ${isWishlisted ? 'text-primary-500 fill-primary-500' : 'text-gray-900'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <Link to={`/pg/${_id}`} className="block p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-gray-900 truncate flex-1 pr-2">{name}</h3>
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md">
            <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-gray-900">{rating?.toFixed(1) || 'New'}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {address.area}, {address.city}
        </p>

        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-gray-900">{formatCurrency(priceFrom || rooms[0]?.price)}</span>
          <span className="text-xs text-gray-500 font-medium">/ month</span>
        </div>
      </Link>
    </div>
  );
};

export default PGCard;