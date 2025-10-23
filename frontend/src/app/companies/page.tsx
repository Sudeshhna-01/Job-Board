'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import styles from '@/styles/Companies.module.css';

interface Company {
  id: number;
  name: string;
  description: string;
  website?: string;
  createdAt: string;
  _count: {
    jobs: number;
  };
}

export default function CompaniesPage() {
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className="spinner"></div>
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <h2>Error Loading Companies</h2>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.companiesPage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Companies</h1>
          <p className={styles.pageSubtitle}>
            Discover companies hiring on our platform
          </p>
        </div>

        {companies?.length > 0 ? (
          <div className={styles.companiesGrid}>
            {companies.map((company: Company) => (
              <div key={company.id} className={styles.companyCard}>
                <div className={styles.companyHeader}>
                  <h3 className={styles.companyName}>
                    <Link href={`/companies/${company.id}`} className={styles.companyLink}>
                      {company.name}
                    </Link>
                  </h3>
                  <div className={styles.companyMeta}>
                    <span className={styles.jobCount}>
                      {company._count.jobs} job{company._count.jobs !== 1 ? 's' : ''}
                    </span>
                    <span className={styles.joinDate}>
                      Joined {formatDate(company.createdAt)}
                    </span>
                  </div>
                </div>

                <div className={styles.companyDescription}>
                  <p>{company.description}</p>
                </div>

                <div className={styles.companyActions}>
                  <Link 
                    href={`/companies/${company.id}`} 
                    className="btn btn-primary"
                  >
                    View Profile
                  </Link>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No Companies Found</h3>
            <p>No companies are currently registered on the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
}
