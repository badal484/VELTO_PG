import React from 'react';

export default function PGCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="h-4 skeleton w-1/3" />
      </div>
    </div>
  );
}