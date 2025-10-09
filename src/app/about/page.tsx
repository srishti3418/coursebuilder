'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout/AppLayout';
import styles from './about.module.scss';

export default function About() {
  return (
    <AppLayout>
      <div className={styles.about}>
        <div className={styles.hero}>
          <h1>About CourseBuilder</h1>
          <p>Empowering learners with AI-driven structured courses</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Our Mission</h2>
            <p>
              CourseBuilder gives learners easy access to well-structured courses — complete with curated videos, notes, and quizzes — all intelligently organized to help you learn any topic from basics to mastery.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How It Works</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <h3>Describe Your Course</h3>
                <p>Simply tell us what you want to learn in your own words</p>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <h3>AI Generation</h3>
                <p>Our AI creates a comprehensive curriculum structure and content</p>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <h3>Save your course (Upcoming feature)</h3>
                <p>Save your course to your account for future reference</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Features</h2>
            <div className={styles.features}>
              <div className={styles.feature}>
                <h3>🚀 Fast Generation</h3>
                <p>Create complete course outlines in minutes, not hours</p>
              </div>
              <div className={styles.feature}>
                <h3>🎯 Targeted Content</h3>
                <p>AI ensures content matches your learning objectives</p>
              </div>
              <div className={styles.feature}>
                <h3>📱 Responsive Design</h3>
                <p>Works perfectly on all devices and screen sizes</p>
              </div>
              <div className={styles.feature}>
                <h3>✨ Easy to Use</h3>
                <p>Intuitive interface that anyone can master</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
