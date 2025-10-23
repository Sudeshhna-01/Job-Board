'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from '@/styles/Navbar.module.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className="container">
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            JobBoard
          </Link>

          <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
            <Link href="/" className={styles.navLink}>
              Jobs
            </Link>
            <Link href="/companies" className={styles.navLink}>
              Companies
            </Link>

            {user ? (
              <>
                {user.role === 'COMPANY' && (
                  <Link href="/dashboard/company" className={styles.navLink}>
                    Dashboard
                  </Link>
                )}
                {user.role === 'APPLICANT' && (
                  <Link href="/dashboard/applicant" className={styles.navLink}>
                    My Applications
                  </Link>
                )}
                <div className={styles.userMenu}>
                  <span className={styles.userName}>{user.name}</span>
                  <button onClick={handleLogout} className={`btn btn-secondary ${styles.logoutBtn}`}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.authLinks}>
                <Link href="/auth/login" className={`btn btn-secondary ${styles.authBtn}`}>
                  Login
                </Link>
                <Link href="/auth/register" className={`btn btn-primary ${styles.authBtn}`}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
