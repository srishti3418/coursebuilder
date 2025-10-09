/**
 * Video utility functions for processing and formatting
 */

/**
 * Format YouTube duration to readable format
 */
export function formatDuration(duration: string): string {
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
}

/**
 * Format view count to readable format
 */
export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Get difficulty label from score
 */
export function getDifficultyLabel(score?: number): string {
  switch (score) {
    case 0: return 'Beginner';
    case 1: return 'Intermediate';
    case 2: return 'Advanced';
    default: return 'Intermediate';
  }
}

/**
 * Get difficulty color from score
 */
export function getDifficultyColor(score?: number): string {
  switch (score) {
    case 0: return '#10b981'; // Green for beginner
    case 1: return '#f59e0b'; // Yellow for intermediate
    case 2: return '#ef4444'; // Red for advanced
    default: return '#6b7280'; // Gray for unknown
  }
}
