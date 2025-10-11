'use client';

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout/AppLayout';
import PromptInput from '@/components/PromptInput/PromptInput';
import VideoGrid, { Video } from '@/components/VideoGrid/VideoGrid';
import styles from './page.module.scss';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimestamp, setSearchTimestamp] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  const handlePromptSubmit = async (prompt: string) => {
    setVideos([]);
    setError(null);
    setIsLoading(true);
    setSearchTimestamp(Date.now()); // Update timestamp to force re-render
    setHasSearched(true); // Mark that a search has been attempted

    try {
      console.log('Starting to fetch new videos...');
      const response = await fetch('/api/getVideos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setVideos(data.videos || []);
      
      // Scroll to video section after videos are loaded
      setTimeout(() => {
        if (videoSectionRef.current) {
          videoSectionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
      
      // Scroll to video section even on error to show the error message
      setTimeout(() => {
        if (videoSectionRef.current) {
          videoSectionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className={styles.home}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Build Courses for Fast Learning
            </h1>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.icon}>🚀</span>
                <span>Fast Generation</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.icon}>🎯</span>
                <span>Targeted Content</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.icon}>📚</span>
                <span>Structured Learning</span>
              </div>
            </div>
            <div className={styles.promptContainer}>
              <h2 className={styles.promptTitle}>What course would you like to create?</h2>
              <PromptInput 
                onSubmit={handlePromptSubmit}
                placeholder="Example: Create a course on web development using React and TypeScript..."
              />
            </div>
          </div>
        </section>

        {/* Video Results Section */}
        <div ref={videoSectionRef}>
          <VideoGrid 
            key={searchTimestamp}
            videos={videos}
            isLoading={isLoading}
            error={error}
            hasSearched={hasSearched}
          />
        </div>

        {/* Examples Section - Only show when no videos are displayed and not loading/error */}
        {videos.length === 0 && !isLoading && !error && (
          <section className={styles.examples}>
            <h3>Popular Course Ideas</h3>
            <div className={styles.exampleGrid}>
              <div 
                className={styles.exampleCard}
                onClick={() => handlePromptSubmit('Create a course on HTML, CSS, JavaScript, and modern frameworks')}
              >
                <h4>Web Development</h4>
                <p>Create a course on HTML, CSS, JavaScript, and modern frameworks</p>
              </div>
              <div 
                className={styles.exampleCard}
                onClick={() => handlePromptSubmit('Create a course on Python, pandas, and machine learning fundamentals')}
              >
                <h4>Data Science</h4>
                <p>Create a course on Python, pandas, and machine learning fundamentals</p>
              </div>
              <div 
                className={styles.exampleCard}
                onClick={() => handlePromptSubmit('Create a course on SEO, social media, and content marketing strategies')}
              >
                <h4>Digital Marketing</h4>
                <p>Create a course on SEO, social media, and content marketing strategies</p>
              </div>
              <div 
                className={styles.exampleCard}
                onClick={() => handlePromptSubmit('Create a course on photography basics and techniques')}
              >
                <h4>Photography</h4>
                <p>Create a course on photography basics and techniques</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
