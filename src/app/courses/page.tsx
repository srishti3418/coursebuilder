'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout/AppLayout';
import styles from './courses.module.scss';

export default function Courses() {
  return (
    <AppLayout>
      <div className={styles.courses}>
        <h1>Your Courses</h1>
        <p>Here you can view and manage all your created courses.</p>
        
        <div className={styles.placeholder}>
          <div className={styles.emptyState}>
            <span className={styles.icon}>📚</span>
            <h2>No courses yet!</h2>
            <p>Start by creating your first course from the home page.</p>
            <Link href="/" className={styles.createButton}>
              Create Your First Course
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
