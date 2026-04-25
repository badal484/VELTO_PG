import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="Page Not Found" />
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <p className="font-display text-[120px] font-bold text-gray-100 leading-none select-none">404</p>
          <h1 className="text-2xl font-bold text-gray-900 -mt-4 mb-3">Page not found</h1>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/listings" className="btn-secondary">Browse PGs</Link>
          </div>
        </div>
      </div>
    </>
  );
}
