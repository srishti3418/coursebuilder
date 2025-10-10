import React from 'react';
import Image from 'next/image';
import styles from './VideoGrid.module.scss';
import { formatDuration, formatViewCount, formatDate, getDifficultyLabel, getDifficultyColor } from '@/utils';

// Types for video data
export interface Video {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  duration: string;
  viewCount: string;
  difficultyScore?: number;
  startTime?: number;  // Optional: for video segments
  endTime?: number;    // Optional: for video segments
}

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  error?: string | null;
  hasSearched?: boolean;
}


const VideoCard: React.FC<{ video: Video; index: number }> = ({ video }) => {
  const [showEmbed, setShowEmbed] = React.useState(false);
  
  const handleVideoClick = () => {
    if (video.startTime !== undefined && video.endTime !== undefined) {
      // Show embedded video segment instead of opening new tab
      setShowEmbed(true);
    } else {
      // Open YouTube video in new tab for regular videos
      window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
    }
  };

  const handleCloseEmbed = () => {
    setShowEmbed(false);
  };

  return (
    <>
      <div className={styles.videoCard} onClick={handleVideoClick}>
        <div className={styles.thumbnailContainer}>
          <Image
            src={video.thumbnails.medium.url}
            alt={video.title}
            width={320}
            height={180}
            className={styles.thumbnail}
          />
          <div className={styles.duration}>
            {formatDuration(video.duration)}
          </div>
          <div className={styles.difficultyBadge} style={{ backgroundColor: getDifficultyColor(video.difficultyScore) }}>
            {getDifficultyLabel(video.difficultyScore)}
          </div>
          
          {video.startTime !== undefined && video.endTime !== undefined && (
            <div className={styles.playOverlay}>
              ▶️ Play Segment
            </div>
          )}
        </div>
        
        <div className={styles.videoInfo}>
          <h3 className={styles.title}>{video.title}</h3>
          <p className={styles.channel}>{video.channelTitle}</p>
          <div className={styles.metadata}>
            <span className={styles.views}>{formatViewCount(video.viewCount)}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.date}>{formatDate(video.publishedAt)}</span>
          </div>
          <p className={styles.description}>
            {video.description.length > 100 
              ? `${video.description.substring(0, 100)}...` 
              : video.description
            }
          </p>
        </div>
      </div>

      {/* Embedded Video Modal */}
      {showEmbed && video.startTime !== undefined && video.endTime !== undefined && (
        <div className={styles.embedModal} onClick={handleCloseEmbed}>
          <div className={styles.embedContainer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseEmbed}>
              ✕
            </button>
            <div className={styles.embedHeader}>
              <h3>{video.title}</h3>
              <p>{video.channelTitle}</p>
            </div>
            <div className={styles.embedVideo}>
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?start=${Math.floor(video.startTime)}&end=${Math.floor(video.endTime)}&autoplay=1&rel=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.embedActions}>
              <button 
                className={styles.watchFullButton}
                onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
              >
                Watch Full Video on YouTube
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className={styles.videoCard}>
    <div className={styles.thumbnailContainer}>
      <div className={styles.skeletonThumbnail}></div>
      <div className={styles.skeletonDuration}></div>
    </div>
    <div className={styles.videoInfo}>
      <div className={styles.skeletonTitle}></div>
      <div className={styles.skeletonChannel}></div>
      <div className={styles.skeletonMetadata}></div>
      <div className={styles.skeletonDescription}></div>
    </div>
  </div>
);

const VideoGrid: React.FC<VideoGridProps> = ({ videos, isLoading, error, hasSearched }) => {
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Failed to load videos</h3>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.videoGrid}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Loading videos...</h2>
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if ((!videos || videos.length === 0) && hasSearched) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📺</div>
        <h3 className={styles.emptyTitle}>No videos available</h3>
        <p className={styles.emptyMessage}>
          Please give a valid input to find relevant videos. Try searching for educational topics like programming, design, or other learning subjects.
        </p>
      </div>
    );
  }

  // If no search has been attempted yet, don't render anything (examples will show)
  if (!hasSearched) {
    return null;
  }

  return (
    <div className={styles.videoGrid}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>
          Recommended Learning Path ({videos.length} videos)
        </h2>
      </div>
      
      <div className={styles.grid}>
        {videos.map((video, index) => (
          <VideoCard key={`${video.id}-${video.startTime}-${video.endTime}`} video={video} index={index} />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
