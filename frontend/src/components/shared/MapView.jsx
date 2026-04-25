import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCurrency } from '../../utils/formatters';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CustomMarker = ({ price }) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="bg-white border border-gray-200 shadow-card px-2 py-1 rounded-lg font-bold text-xs text-gray-900 hover:scale-110 transition-transform duration-200">
             ${formatCurrency(price)}
           </div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });
};

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const MapView = ({ pgs = [], center = [12.9716, 77.5946], zoom = 12 }) => {
  return (
    <div className="h-full w-full rounded-3xl overflow-hidden shadow-card border border-gray-100">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pgs.map(pg => (
          <Marker 
            key={pg._id} 
            position={[pg.address.coordinates.lat, pg.address.coordinates.lng]}
            icon={CustomMarker({ price: pg.priceFrom || pg.rooms[0]?.price })}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <img src={pg.images[0]?.url} alt={pg.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                <h4 className="text-sm font-bold text-gray-900 truncate">{pg.name}</h4>
                <p className="text-xs text-gray-500">{pg.address.area}</p>
                <div className="mt-2 text-sm font-bold text-primary-500">
                  {formatCurrency(pg.priceFrom || pg.rooms[0]?.price)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
