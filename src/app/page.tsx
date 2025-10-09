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

  const handlePromptSubmit = async (prompt: string) => {
    console.log('Course prompt submitted:', prompt);
    
    setIsLoading(true);
    setError(null);
    setVideos([]);

    try {
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
                placeholder="Example: Create a beginner-friendly course on web development using React and TypeScript..."
              />
            </div>
          </div>
        </section>

        {/* Video Results Section */}
        {(videos.length > 0 || isLoading || error) && (
          <VideoGrid 
            videos={videos}
            isLoading={isLoading}
            error={error}
          />
        )}

        {/* Examples Section - Only show when no videos are displayed */}
        {videos.length === 0 && !isLoading && !error && (
          <section className={styles.examples}>
            <h3>Popular Course Ideas</h3>
            <div className={styles.exampleGrid}>
              <div className={styles.exampleCard}>
                <h4>Web Development</h4>
                <p>Learn HTML, CSS, JavaScript, and modern frameworks</p>
              </div>
              <div className={styles.exampleCard}>
                <h4>Data Science</h4>
                <p>Master Python, pandas, and machine learning fundamentals</p>
              </div>
              <div className={styles.exampleCard}>
                <h4>Digital Marketing</h4>
                <p>SEO, social media, and content marketing strategies</p>
              </div>
              <div className={styles.exampleCard}>
                <h4>Photography</h4>
                <p>From basics to advanced techniques and post-processing</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
