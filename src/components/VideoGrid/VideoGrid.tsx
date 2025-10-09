import React from 'react';
import styles from './VideoGrid.module.scss';

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
}

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  error?: string | null;
}

// Utility functions
const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'Unknown';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

const formatViewCount = (viewCount: string): string => {
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

const getDifficultyLabel = (score?: number): string => {
  switch (score) {
    case 0: return 'Beginner';
    case 1: return 'Intermediate';
    case 2: return 'Advanced';
    default: return 'Intermediate';
  }
};

const getDifficultyColor = (score?: number): string => {
  switch (score) {
    case 0: return '#10b981'; // Green for beginner
    case 1: return '#f59e0b'; // Yellow for intermediate
    case 2: return '#ef4444'; // Red for advanced
    default: return '#6b7280'; // Gray for unknown
  }
};

const VideoCard: React.FC<{ video: Video; index: number }> = ({ video, index }) => {
  const handleVideoClick = () => {
    // Open YouTube video in new tab
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
  };

  return (
    <div className={styles.videoCard} onClick={handleVideoClick}>
      <div className={styles.thumbnailContainer}>
        <img
          src={video.thumbnails.medium.url}
          alt={video.title}
          className={styles.thumbnail}
        />
        <div className={styles.duration}>
          {formatDuration(video.duration)}
        </div>
        <div className={styles.difficultyBadge} style={{ backgroundColor: getDifficultyColor(video.difficultyScore) }}>
          {getDifficultyLabel(video.difficultyScore)}
        </div>
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

const VideoGrid: React.FC<VideoGridProps> = ({ videos, isLoading, error }) => {
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

  if (!videos || videos.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📺</div>
        <h3 className={styles.emptyTitle}>No videos found</h3>
        <p className={styles.emptyMessage}>
          Try searching for a different topic or check your internet connection.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.videoGrid}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>
          Recommended Learning Path ({videos.length} videos)
        </h2>
        <p className={styles.sectionSubtitle}>
          Videos are ordered from beginner to advanced level
        </p>
      </div>
      
      <div className={styles.grid}>
        {videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
