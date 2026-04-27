import React from 'react';
import SEOHead from '../components/common/SEOHead';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/home/HeroSection';
import FeaturedPGs from '../components/home/FeaturedPGs';
import HowItWorks from '../components/home/HowItWorks';
import WhyVeltoStay from '../components/home/WhyVeltoStay';
import PartnerCTA from '../components/home/PartnerCTA';
import Testimonials from '../components/home/Testimonials';

import AdminLandingContent from '../components/home/AdminLandingContent';

export default function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  
  if (isAdmin) {
    return (
      <>
        <SEOHead title="Admin Console — Velto Stay" />
        <HeroSection />
        <AdminLandingContent />
      </>
    );
  }

  return (
    <>
      <SEOHead />
      <HeroSection />
      <FeaturedPGs />
      {!isOwner && <HowItWorks />}
      <WhyVeltoStay />
      <Testimonials />
      {!isOwner && <PartnerCTA />}
    </>
  );
}