'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const CompanyProfileContent = dynamic(() => import('./CompanyProfileContent'), {
  ssr: false,
  loading: () => (
    <div className="container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem' }}>
        <div className="spinner"></div>
        <p>Loading company profile...</p>
      </div>
    </div>
  )
});

export default function CompanyProfilePage() {
  return <CompanyProfileContent />;
}