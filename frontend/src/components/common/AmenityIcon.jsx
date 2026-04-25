import React from 'react';

const ICONS = {
  wifi:             { label: 'WiFi', path: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
  ac:               { label: 'AC', path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2' },
  meals:            { label: 'Meals', path: 'M3 3h18v2H3zm0 8h18v2H3zm0 8h18v2H3z' },
  laundry:          { label: 'Laundry', path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  parking:          { label: 'Parking', path: 'M5 8h2a3 3 0 010 6H5V8zm0 0V5m0 9v3m14-9H5' },
  gym:              { label: 'Gym', path: 'M3 6h18M3 12h18M3 18h18' },
  security:         { label: 'Security', path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  powerBackup:      { label: 'Power Backup', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
  housekeeping:     { label: 'Housekeeping', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  tv:               { label: 'TV', path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2' },
  waterPurifier:    { label: 'Water Purifier', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' },
  geyser:           { label: 'Geyser', path: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  refrigerator:     { label: 'Refrigerator', path: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 8h14M9 3v8' },
  studyTable:       { label: 'Study Table', path: 'M3 10h18M3 14h18M10 10V6a2 2 0 114 0v4' },
  wardrobe:         { label: 'Wardrobe', path: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 0v18' },
  attachedBathroom: { label: 'Attached Bath', path: 'M4 4h16v12H4V4zm0 0v16m16-16v16M8 4v16m8-16v16' },
  cctv:             { label: 'CCTV', path: 'M15 10l4.553-2.276A1 1 0 0121 8.618V15.38a1 1 0 01-1.447.894L15 14M3 8h12v8H3z' },
  biometricEntry:   { label: 'Biometric', path: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4' },
  fireExtinguisher: { label: 'Fire Safety', path: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
};

export default function AmenityIcon({ amenity, showLabel = true }) {
  const icon = ICONS[amenity];
  if (!icon) return null;

  return (
    <div className="flex items-center gap-3 text-gray-600">
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
        </svg>
      </div>
      {showLabel && <span className="text-sm font-medium">{icon.label}</span>}
    </div>
  );
}

export { ICONS as AMENITY_MAP };
