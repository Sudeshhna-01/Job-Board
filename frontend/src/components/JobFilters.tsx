'use client';

import React from 'react';
import styles from '@/styles/JobFilters.module.css';

interface JobFilters {
  search: string;
  location: string;
  category: string;
}

interface JobFiltersProps {
  filters: JobFilters;
  onFilterChange: (filters: Partial<JobFilters>) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFilterChange }) => {
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

  const locations = [
    'Remote',
    'New York',
    'San Francisco',
    'Los Angeles',
    'Chicago',
    'Boston',
    'Seattle',
    'Austin',
    'Denver',
    'Miami',
    'Other'
  ];

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersCard}>
        <h3 className={styles.filtersTitle}>Filter Jobs</h3>
        
        <div className={styles.filtersGrid}>
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Job title, keywords..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <select
              className="form-select"
              value={filters.location}
              onChange={(e) => onFilterChange({ location: e.target.value })}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.clearFilters}>
            <button
              onClick={() => onFilterChange({ search: '', location: '', category: '' })}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
