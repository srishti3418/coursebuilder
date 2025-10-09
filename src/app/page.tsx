'use client';

import React, { useState } from 'react';
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

  const handlePromptSubmit = async (prompt: string) => {
    setVideos([]);
    setError(null);
    setIsLoading(true);
    setSearchTimestamp(Date.now()); // Update timestamp to force re-render
    setHasSearched(true); // Mark that a search has been attempted

    // Small delay to ensure UI updates before fetching
    await new Promise(resolve => setTimeout(resolve, 100));

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
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
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
              Build Amazing Courses with AI
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
        <VideoGrid 
          key={searchTimestamp}
          videos={videos}
          isLoading={isLoading}
          error={error}
          hasSearched={hasSearched}
        />

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
