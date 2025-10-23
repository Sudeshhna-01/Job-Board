'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import styles from '@/styles/Dashboard.module.css';

// Get the base URL for file serving
const getFileBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

interface Application {
  id: number;
  resumeUrl: string;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  job: {
    id: number;
    title: string;
    location: string;
    category: string;
    company: {
      name: string;
      website?: string;
    };
  };
}

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or not an applicant
  React.useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'APPLICANT') {
      router.push('/');
      return;
    }
  }, [user, router]);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applicant-applications'],
    queryFn: async () => {
      const response = await api.get('/applications/my-applications');
      return response.data;
    },
    enabled: !!user && user.role === 'APPLICANT',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'REVIEWED':
        return 'status-reviewed';
      case 'ACCEPTED':
        return 'status-accepted';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Under Review';
      case 'REVIEWED':
        return 'Reviewed';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Not Selected';
      default:
        return status;
    }
  };

  if (!user || user.role !== 'APPLICANT') {
    return null;
  }

  return (
    <div className={styles.dashboardPage}>
      <div className="container">
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>My Applications</h1>
            <p className={styles.dashboardSubtitle}>
              Track your job applications and their status
            </p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="btn btn-primary"
          >
            Browse Jobs
          </button>
        </div>

        {/* Application Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statNumber}>
              {applications?.length || 0}
            </h3>
            <p className={styles.statLabel}>Total Applications</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statNumber}>
              {applications?.filter((app: Application) => app.status === 'PENDING').length || 0}
            </h3>
            <p className={styles.statLabel}>Under Review</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statNumber}>
              {applications?.filter((app: Application) => app.status === 'ACCEPTED').length || 0}
            </h3>
            <p className={styles.statLabel}>Accepted</p>
          </div>
        </div>

        {/* Applications List */}
        <div className={styles.applicationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Application History</h2>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className="spinner"></div>
              <p>Loading applications...</p>
            </div>
          ) : applications?.length > 0 ? (
            <div className={styles.applicationsList}>
              {applications.map((application: Application) => (
                <div key={application.id} className={styles.applicationCard}>
                  <div className={styles.applicationHeader}>
                    <div className={styles.applicationInfo}>
                      <h3 className={styles.applicationJob}>
                        {application.job.title}
                      </h3>
                      <p className={styles.applicationCompany}>
                        {application.job.company.name}
                      </p>
                      <div className={styles.applicationMeta}>
                        <span className={styles.applicationLocation}>
                          📍 {application.job.location}
                        </span>
                        <span className={styles.applicationCategory}>
                          🏷️ {application.job.category}
                        </span>
                      </div>
                    </div>
                    <div className={styles.applicationStatus}>
                      <span className={`status-badge ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.applicationDetails}>
                    <div className={styles.applicationDate}>
                      <strong>Applied:</strong> {formatDate(application.createdAt)}
                    </div>
                    
                    {application.coverLetter && (
                      <div className={styles.coverLetter}>
                        <strong>Cover Letter:</strong>
                        <p className={styles.coverLetterText}>
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    <div className={styles.applicationActions}>
                      <a
                        href={`${getFileBaseUrl()}${application.resumeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        View Resume
                      </a>
                      <button
                        onClick={() => router.push(`/jobs/${application.job.id}`)}
                        className="btn btn-primary"
                      >
                        View Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>No Applications Yet</h3>
              <p>Start applying for jobs to see your applications here.</p>
              <button 
                onClick={() => router.push('/')} 
                className="btn btn-primary"
              >
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
