import React, { useState, useEffect, useCallback } from 'react';

export default function PGImageGallery({ images = [], pgName = '' }) {
  const [lightbox, setLightbox] = useState(false);
  const [current, setCurrent] = useState(0);
  const safe = images.length > 0
    ? images
    : [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200' }];

  const prev = useCallback(() => setCurrent(i => (i - 1 + safe.length) % safe.length), [safe.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % safe.length), [safe.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 h-[280px] md:h-[460px] rounded-2xl md:rounded-3xl overflow-hidden">
        {/* Main image */}
        <div className="col-span-4 md:col-span-2 h-full cursor-pointer" onClick={() => { setCurrent(0); setLightbox(true); }}>
          <img src={safe[0]?.url} alt={pgName} className="w-full h-full object-cover hover:brightness-95 transition-all" />
        </div>

        {/* Thumbnails */}
        <div className="hidden md:grid col-span-2 grid-rows-2 gap-2 h-full">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="relative cursor-pointer overflow-hidden" onClick={() => { setCurrent(Math.min(idx, safe.length - 1)); setLightbox(true); }}>
              <img
                src={safe[idx]?.url || safe[0]?.url}
                alt={`${pgName} ${idx + 1}`}
                className="w-full h-full object-cover hover:brightness-95 transition-all"
              />
              {idx === 3 && safe.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">+{safe.length - 4} more</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile show-all button */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold shadow-card md:hidden"
        >
          View all {safe.length} photos
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10"
            onClick={() => setLightbox(false)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {current + 1} / {safe.length}
          </div>

          {/* Image */}
          <img
            src={safe[current]?.url}
            alt={`${pgName} ${current + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Nav buttons */}
          {safe.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={e => { e.stopPropagation(); prev(); }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={e => { e.stopPropagation(); next(); }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] pb-1">
            {safe.map((img, idx) => (
              <button
                key={idx}
                onClick={e => { e.stopPropagation(); setCurrent(idx); }}
                className={`w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${current === idx ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}