import React from 'react';
import Hero from './Hero';
import FeaturedListings from './FeaturedListings';
import { WhyChoose, SellerCTA, FindHomeCTA } from './Sections';

export default function Home() {
  return (
    <main style={{ paddingTop: '4rem' }}>
      <Hero />
      <FeaturedListings />
      <WhyChoose />
      <SellerCTA />
      <FindHomeCTA />
    </main>
  );
}
