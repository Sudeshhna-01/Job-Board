'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import styles from '@/styles/JobForm.module.css';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  salary?: string;
  type?: string;
}

interface JobFormData {
  title: string;
  description: string;
  location: string;
  category: string;
  salary?: string;
  type?: string;
}

interface JobFormProps {
  job?: Job | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    salary: '',
    type: ''
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        location: job.location,
        category: job.category,
        salary: job.salary || '',
        type: job.type || ''
      });
    }
  }, [job]);

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await api.post('/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as ApiError).response?.data?.message 
        : 'Failed to create job';
      setError(errorMessage || 'Failed to create job');
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await api.put(`/jobs/${job?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as ApiError).response?.data?.message 
        : 'Failed to update job';
      setError(errorMessage || 'Failed to update job');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    const submitData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      category: formData.category,
      salary: formData.salary || undefined,
      type: formData.type || undefined
    };

    if (job) {
      updateJobMutation.mutate(submitData);
    } else {
      createJobMutation.mutate(submitData);
    }
  };

  const isLoading = createJobMutation.isPending || updateJobMutation.isPending;

  const categories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Design',
    'Engineering',
    'Customer Service',
    'Human Resources',
    'Operations',
    'Other'
  ];

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Freelance',
    'Remote'
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{job ? 'Edit Job' : 'Post New Job'}</h2>
          <button onClick={onCancel} className={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.jobForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={8}
            />
          </div>

          <div className={styles.formRow}>
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className="form-group">
              <label htmlFor="salary" className="form-label">
                Salary Range
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                className="form-input"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Job Type
              </label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitButton}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  {job ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                job ? 'Update Job' : 'Post Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
