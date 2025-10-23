'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import JobForm from '@/components/JobForm';
import styles from '@/styles/Dashboard.module.css';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  salary?: string;
  type?: string;
  createdAt: string;
  _count: {
    applications: number;
  };
}

interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  recentApplications: Array<{
    id: number;
    status: string;
    createdAt: string;
    coverLetter?: string;
    resumeUrl: string;
    job: {
      title: string;
    };
    applicant: {
      name: string;
      email: string;
    };
  }>;
}

interface CompanyJob extends Job {
  company?: {
    id: number;
  };
}

export default function CompanyDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Redirect if not authenticated or not a company
  React.useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'COMPANY') {
      router.push('/');
      return;
    }
  }, [user, router]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['company-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/companies/dashboard/stats');
      return response.data;
    },
    enabled: !!user && user.role === 'COMPANY',
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['company-jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs');
      return response.data.jobs.filter((job: CompanyJob) => 
        job.company?.id === user?.company?.id
      );
    },
    enabled: !!user && user.role === 'COMPANY',
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['company-applications'],
    queryFn: async () => {
      const response = await api.get('/applications/company-applications');
      return response.data;
    },
    enabled: !!user && user.role === 'COMPANY',
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await api.delete(`/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard-stats'] });
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      await api.put(`/applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard-stats'] });
    },
  });

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = (jobId: number) => {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleUpdateApplicationStatus = (applicationId: number, status: string) => {
    updateApplicationStatusMutation.mutate({ applicationId, status });
  };

  const handleDownloadResume = (resumeUrl: string, applicantName: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5001${resumeUrl}`;
    link.download = `${applicantName}_resume.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJobFormSuccess = () => {
    setShowJobForm(false);
    setEditingJob(null);
    queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
    queryClient.invalidateQueries({ queryKey: ['company-dashboard-stats'] });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || user.role !== 'COMPANY') {
    return null;
  }

  return (
    <div className={styles.dashboardPage}>
      <div className="container">
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Company Dashboard</h1>
            <p className={styles.dashboardSubtitle}>
              Welcome back, {user.name}
            </p>
          </div>
          <button onClick={handleCreateJob} className="btn btn-primary">
            Post New Job
          </button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className={styles.loadingContainer}>
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3 className={styles.statNumber}>{stats?.totalJobs || 0}</h3>
              <p className={styles.statLabel}>Active Jobs</p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statNumber}>{stats?.totalApplications || 0}</h3>
              <p className={styles.statLabel}>Total Applications</p>
            </div>
            <div className={styles.statCard}>
              <h3 className={styles.statNumber}>
                {stats?.recentApplications?.length || 0}
              </h3>
              <p className={styles.statLabel}>Recent Applications</p>
            </div>
          </div>
        )}

        <div className={styles.dashboardGrid}>
          {/* Applications Management */}
          <div className={styles.applicationsManagement}>
            <h2 className={styles.sectionTitle}>Applications Received</h2>
            {applicationsLoading ? (
              <div className={styles.loadingContainer}>
                <div className="spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : applications?.length > 0 ? (
              <div className={styles.applicationsList}>
                {applications.map((application: DashboardStats['recentApplications'][0]) => (
                  <div key={application.id} className={styles.applicationItem}>
                    <div className={styles.applicationInfo}>
                      <h4 className={styles.applicationJob}>
                        {application.job.title}
                      </h4>
                      <p className={styles.applicationApplicant}>
                        <strong>{application.applicant.name}</strong> ({application.applicant.email})
                      </p>
                      <p className={styles.applicationDate}>
                        Applied {formatDate(application.createdAt)}
                      </p>
                      {application.coverLetter && (
                        <div className={styles.coverLetter}>
                          <h5>Cover Letter:</h5>
                          <p>{application.coverLetter}</p>
                        </div>
                      )}
                    </div>
                    <div className={styles.applicationActions}>
                      <div className={styles.applicationStatus}>
                        <span className={`status-badge status-${application.status.toLowerCase()}`}>
                          {application.status}
                        </span>
                      </div>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleDownloadResume(application.resumeUrl, application.applicant.name)}
                          className="btn btn-secondary"
                        >
                          📄 Download Resume
                        </button>
                        <select
                          value={application.status}
                          onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                          className="form-select"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No applications received yet</p>
                <p>Applications will appear here when job seekers apply to your jobs</p>
              </div>
            )}
          </div>

          {/* Job Management */}
          <div className={styles.jobManagement}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Your Jobs</h2>
              <button onClick={handleCreateJob} className="btn btn-secondary">
                Add Job
              </button>
            </div>

            {jobsLoading ? (
              <div className={styles.loadingContainer}>
                <div className="spinner"></div>
                <p>Loading jobs...</p>
              </div>
            ) : jobs?.length > 0 ? (
              <div className={styles.jobsList}>
                {jobs.map((job: Job) => (
                  <div key={job.id} className={styles.jobItem}>
                    <div className={styles.jobInfo}>
                      <h4 className={styles.jobTitle}>{job.title}</h4>
                      <p className={styles.jobLocation}>{job.location}</p>
                      <p className={styles.jobCategory}>{job.category}</p>
                      <p className={styles.jobApplications}>
                        {job._count.applications} application{job._count.applications !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className={styles.jobActions}>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="btn btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No jobs posted yet</p>
                <button onClick={handleCreateJob} className="btn btn-primary">
                  Post Your First Job
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Job Form Modal */}
        {showJobForm && (
          <JobForm
            job={editingJob}
            onSuccess={handleJobFormSuccess}
            onCancel={() => {
              setShowJobForm(false);
              setEditingJob(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
