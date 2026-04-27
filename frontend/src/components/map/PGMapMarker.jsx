import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

function createPriceIcon(price, isHovered) {
  const bg = isHovered ? '#FF385C' : '#222222';
  const html = `
    <div style="
      background:${bg};color:#fff;
      padding:4px 10px;border-radius:999px;
      font-size:12px;font-weight:700;
      white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);
      transition:background 0.15s;
      font-family:'Plus Jakarta Sans',system-ui,sans-serif;
    ">₹${Math.round(price / 1000)}K</div>`;
  return L.divIcon({ className: '', html, iconAnchor: [28, 16] });
}

export default function PGMapMarker({ pg, isHovered, onClick }) {
  const lat = pg.address?.coordinates?.lat;
  const lng = pg.address?.coordinates?.lng;
  if (!lat || !lng) return null;

  return (
    <Marker
      position={[lat, lng]}
      icon={createPriceIcon(pg.priceFrom || pg.rooms?.[0]?.price || 0, isHovered)}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <Link to={`/pg/${pg._id}`} className="block w-44 no-underline">
          {pg.images?.[0]?.url && (
            <img src={pg.images[0].url} alt={pg.name} className="w-full h-28 object-cover rounded-lg mb-2" />
          )}
          <p className="font-bold text-gray-900 text-sm leading-tight">{pg.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{pg.address?.area}</p>
          <p className="text-sm font-bold text-primary-500 mt-1">{formatCurrency(pg.priceFrom || 0)}/mo</p>
        </Link>
      </Popup>
    </Marker>
  );
}