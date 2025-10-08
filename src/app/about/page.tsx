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
          <p>Empowering educators and creators with AI-driven course development</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Our Mission</h2>
            <p>
              We believe that everyone has valuable knowledge to share. CourseBuilder makes it 
              easy to transform your expertise into engaging, well-structured online courses 
              using the power of artificial intelligence.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How It Works</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <h3>Describe Your Course</h3>
                <p>Simply tell us what you want to teach in your own words</p>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <h3>AI Generation</h3>
                <p>Our AI creates a comprehensive curriculum structure and content</p>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <h3>Customize & Publish</h3>
                <p>Review, edit, and personalize your course before sharing</p>
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
