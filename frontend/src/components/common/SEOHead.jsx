import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({ title, description, image, url }) {
  const fullTitle = title ? `${title} — Velto Stay` : 'Velto Stay — Find Your Perfect PG in Bangalore';
  const desc = description || 'Discover premium, verified PG accommodations in Bangalore. Book instantly with secure payments.';
  const img = image || 'https://veltostay.com/og-image.jpg';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}