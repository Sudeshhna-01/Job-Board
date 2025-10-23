'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import styles from '@/styles/Home.module.css';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  salary?: string;
  type?: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    website?: string;
  };
  _count: {
    applications: number;
  };
}

interface JobFiltersType {
  search: string;
  location: string;
  category: string;
}

export default function Home() {
  const [filters, setFilters] = useState<JobFiltersType>({
    search: '',
    location: '',
    category: ''
  });
  const [page, setPage] = useState(1);

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.category) params.append('category', filters.category);
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await api.get(`/jobs?${params.toString()}`);
      return response.data;
    },
  });

  const handleFilterChange = (newFilters: Partial<JobFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="container">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Error Loading Jobs</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <div className="container">
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Find Your Dream Job Today
            </h1>
            <p className={styles.heroSubtitle}>
              Discover thousands of job opportunities from top companies worldwide
            </p>
          </div>
        </section>

        {/* Filters */}
        <JobFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />

        {/* Job Listings */}
        <section className={styles.jobsSection}>
          <div className={styles.jobsHeader}>
            <h2 className={styles.sectionTitle}>Available Jobs</h2>
            {jobsData && (
              <p className={styles.jobsCount}>
                {jobsData.pagination.total} jobs found
              </p>
            )}
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className="spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : jobsData?.jobs?.length > 0 ? (
            <>
              <div className={styles.jobsGrid}>
                {jobsData.jobs.map((job: Job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {jobsData.pagination.pages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`btn btn-secondary ${styles.paginationBtn}`}
                  >
                    Previous
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, jobsData.pagination.pages) }, (_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > jobsData.pagination.pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`${styles.pageBtn} ${
                            pageNum === page ? styles.pageBtnActive : ''
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === jobsData.pagination.pages}
                    className={`btn btn-secondary ${styles.paginationBtn}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noJobs}>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}