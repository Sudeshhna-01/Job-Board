'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import ApplicationForm from '@/components/ApplicationForm';
import styles from '@/styles/JobDetail.module.css';

interface Application {
  jobId: number;
  id: number;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const jobId = params?.id as string;

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get(`/jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
  });

  const { data: hasApplied } = useQuery({
    queryKey: ['application-check', jobId, user?.id],
    queryFn: async () => {
      if (!user || user.role !== 'APPLICANT') return false;
      const response = await api.get('/applications/my-applications');
      return response.data.some((app: Application) => app.jobId === parseInt(jobId));
    },
    enabled: !!user && user.role === 'APPLICANT' && !!jobId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApplyClick = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'APPLICANT') {
      alert('Only job seekers can apply for jobs');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    queryClient.invalidateQueries({ queryKey: ['application-check', jobId, user?.id] });
    queryClient.invalidateQueries({ queryKey: ['job', jobId] });
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.loadingContainer}>
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <h2>Job Not Found</h2>
          <p>The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.jobDetailPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <button onClick={() => router.push('/')} className={styles.breadcrumbLink}>
            Jobs
          </button>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>{job.title}</span>
        </nav>

        <div className={styles.jobDetailGrid}>
          {/* Main Job Content */}
          <div className={styles.jobContent}>
            <div className={styles.jobHeader}>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <div className={styles.jobMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Company</span>
                  <span className={styles.metaValue}>{job.company.name}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaValue}>{job.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Category</span>
                  <span className={styles.metaValue}>{job.category}</span>
                </div>
                {job.type && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Type</span>
                    <span className={styles.metaValue}>{job.type}</span>
                  </div>
                )}
                {job.salary && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Salary</span>
                    <span className={styles.metaValue}>{job.salary}</span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Posted</span>
                  <span className={styles.metaValue}>{formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className={styles.jobDescription}>
              <h3>Job Description</h3>
              <div className={styles.descriptionContent}>
                {job.description.split('\n').map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Application Section */}
            <div className={styles.applicationSection}>
              <h3>Apply for this Position</h3>
              {!user ? (
                <div className={styles.loginPrompt}>
                  <p>Please log in to apply for this job.</p>
                  <button onClick={() => router.push('/auth/login')} className="btn btn-primary">
                    Log In
                  </button>
                </div>
              ) : user.role !== 'APPLICANT' ? (
                <div className={styles.rolePrompt}>
                  <p>Only job seekers can apply for jobs.</p>
                </div>
              ) : hasApplied ? (
                <div className={styles.appliedPrompt}>
                  <p>✅ You have already applied for this job.</p>
                  <button onClick={() => router.push('/dashboard/applicant')} className="btn btn-secondary">
                    View My Applications
                  </button>
                </div>
              ) : (
                <div className={styles.applySection}>
                  <p>Ready to apply? Upload your resume and add a cover letter.</p>
                  <button onClick={handleApplyClick} className="btn btn-primary">
                    Apply Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.jobSidebar}>
            <div className={styles.companyCard}>
              <h3>About {job.company.name}</h3>
              <p className={styles.companyDescription}>{job.company.description}</p>
              {job.company.website && (
                <a 
                  href={job.company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Visit Website
                </a>
              )}
              <button 
                onClick={() => router.push(`/companies/${job.company.id}`)}
                className="btn btn-primary"
              >
                View Company Profile
              </button>
            </div>

            <div className={styles.jobStats}>
              <h3>Job Statistics</h3>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Applications</span>
                <span className={styles.statValue}>{job._count.applications}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Posted</span>
                <span className={styles.statValue}>{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <ApplicationForm
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.company.name}
            onSuccess={handleApplicationSuccess}
            onCancel={() => setShowApplicationForm(false)}
          />
        )}
      </div>
    </div>
  );
}
