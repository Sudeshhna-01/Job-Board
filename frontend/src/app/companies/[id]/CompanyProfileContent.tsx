'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import styles from '@/styles/Companies.module.css';

interface Job {
  id: number;
  title: string;
  location: string;
  category: string;
  type?: string;
  createdAt: string;
}

interface Company {
  id: number;
  name: string;
  description: string;
  website?: string;
  createdAt: string;
  jobs: Job[];
}

export default function CompanyProfileContent() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/companies/${companyId}`);
        setCompany(response.data);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Failed to load company profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className="spinner"></div>
          <p>Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <h2>Error Loading Company</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/companies')} className="btn btn-primary">
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <h2>Company Not Found</h2>
          <p>The company you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={() => router.push('/companies')} className="btn btn-primary">
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.companyProfilePage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/companies" className={styles.breadcrumbLink}>
            Companies
          </Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>{company.name}</span>
        </nav>

        <div className={styles.companyProfileGrid}>
          {/* Company Info */}
          <div className={styles.companyInfo}>
            <div className={styles.companyHeader}>
              <h1 className={styles.companyTitle}>{company.name}</h1>
              <div className={styles.companyMeta}>
                <span className={styles.joinDate}>
                  Joined {formatDate(company.createdAt)}
                </span>
                <span className={styles.jobCount}>
                  {company.jobs.length} job{company.jobs.length !== 1 ? 's' : ''} posted
                </span>
              </div>
            </div>

            <div className={styles.companyDescription}>
              <h3>About {company.name}</h3>
              <p>{company.description}</p>
            </div>

            {company.website && (
              <div className={styles.companyWebsite}>
                <h3>Website</h3>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Company Jobs */}
          <div className={styles.companyJobs}>
            <div className={styles.jobsHeader}>
              <h2>Jobs at {company.name}</h2>
              <p>Current job openings</p>
            </div>

            {company.jobs.length > 0 ? (
              <div className={styles.jobsGrid}>
                {company.jobs.map((job: Job) => (
                  <div key={job.id} className={styles.jobCard}>
                    <div className={styles.jobHeader}>
                      <h3 className={styles.jobTitle}>
                        <Link href={`/jobs/${job.id}`} className={styles.jobLink}>
                          {job.title}
                        </Link>
                      </h3>
                      <div className={styles.jobMeta}>
                        <span className={styles.jobLocation}>{job.location}</span>
                        <span className={styles.jobCategory}>{job.category}</span>
                        {job.type && (
                          <span className={styles.jobType}>{job.type}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.jobFooter}>
                      <span className={styles.jobDate}>
                        Posted {formatDate(job.createdAt)}
                      </span>
                      <Link 
                        href={`/jobs/${job.id}`} 
                        className="btn btn-primary"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noJobs}>
                <h3>No Current Openings</h3>
                <p>This company doesn&apos;t have any active job postings at the moment.</p>
                <Link href="/jobs" className="btn btn-secondary">
                  Browse All Jobs
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
