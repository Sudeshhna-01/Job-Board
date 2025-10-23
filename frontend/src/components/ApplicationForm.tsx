'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import styles from '@/styles/ApplicationForm.module.css';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ApplicationFormProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  jobId,
  jobTitle,
  companyName,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null as File | null
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post(`/applications/apply/${jobId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as ApiError).response?.data?.message 
        : 'Failed to submit application';
      setError(errorMessage || 'Failed to submit application');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, resume: file }));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resume) {
      setError('Please upload your resume');
      return;
    }

    const submitData = new FormData();
    submitData.append('resume', formData.resume);
    submitData.append('coverLetter', formData.coverLetter);

    applyMutation.mutate(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Apply for {jobTitle}</h2>
          <p className={styles.companyName}>at {companyName}</p>
          <button onClick={onCancel} className={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.applicationForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="resume" className="form-label">
              Resume *
            </label>
            <input
              type="file"
              id="resume"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className={styles.fileInput}
              required
            />
            <p className={styles.fileHint}>
              Upload your resume (PDF or Word document, max 5MB)
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="coverLetter" className="form-label">
              Cover Letter
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              className="form-textarea"
              value={formData.coverLetter}
              onChange={handleChange}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              rows={6}
            />
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
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
