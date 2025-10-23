'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/JobCard.module.css';

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

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <h3 className={styles.jobTitle}>
          <Link href={`/jobs/${job.id}`} className={styles.jobLink}>
            {job.title}
          </Link>
        </h3>
        <div className={styles.companyInfo}>
          <Link href={`/companies/${job.company.id}`} className={styles.companyLink}>
            {job.company.name}
          </Link>
        </div>
      </div>

      <div className={styles.jobDetails}>
        <div className={styles.jobMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Location:</span>
            <span className={styles.metaValue}>{job.location}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Category:</span>
            <span className={styles.metaValue}>{job.category}</span>
          </div>
          {job.type && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Type:</span>
              <span className={styles.metaValue}>{job.type}</span>
            </div>
          )}
          {job.salary && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Salary:</span>
              <span className={styles.metaValue}>{job.salary}</span>
            </div>
          )}
        </div>

        <p className={styles.jobDescription}>
          {truncateDescription(job.description)}
        </p>

        <div className={styles.jobFooter}>
          <div className={styles.jobStats}>
            <span className={styles.applicationCount}>
              {job._count.applications} application{job._count.applications !== 1 ? 's' : ''}
            </span>
            <span className={styles.postedDate}>
              Posted {formatDate(job.createdAt)}
            </span>
          </div>
          
          <div className={styles.jobActions}>
            <Link href={`/jobs/${job.id}`} className={`btn btn-primary ${styles.viewBtn}`}>
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
