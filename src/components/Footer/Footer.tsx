import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>CourseBuilder</h3>
            <p>Create amazing courses with AI assistance</p>
          </div>
          <div className={styles.section}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/courses">Courses</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>
          <div className={styles.section}>
            <h4>Contact</h4>
            <p>Email: info@coursebuilder.com</p>
            <p>Phone: (555) 123-4567</p>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; 2024 CourseBuilder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
