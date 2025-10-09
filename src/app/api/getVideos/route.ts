import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube Video Fetcher API
 * 
 * This implementation provides dynamic video generation based on search queries.
 * For production use, replace the mock implementation with YouTube Data API v3:
 * 
 * 1. Get YouTube API key from Google Cloud Console
 * 2. Replace scrapeYouTubeVideos() with real API calls
 * 3. Add environment variable: YOUTUBE_API_KEY
 * 
 * Example real implementation:
 * const response = await fetch(
 *   `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${YOUTUBE_API_KEY}&type=video&maxResults=10`
 * );
 */

// Types for YouTube API response
interface YouTubeVideo {
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
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string;
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

// Video difficulty scoring based on keywords
const DIFFICULTY_KEYWORDS = {
  beginner: ['beginner', 'basics', 'introduction', 'getting started', 'tutorial', 'learn', 'how to', 'step by step', 'for beginners'],
  intermediate: ['intermediate', 'advanced', 'deep dive', 'master', 'complete guide', 'comprehensive', 'in-depth'],
  expert: ['expert', 'professional', 'production', 'enterprise', 'optimization', 'performance', 'architecture']
};

// Cache for storing results (in-memory cache)
const videoCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = prompt.toLowerCase().trim();
    const cached = videoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ videos: cached.data });
    }

    // For demo purposes, we'll use a mock YouTube API response
    // In production, you would use the actual YouTube Data API v3
    const videos = await fetchYouTubeVideos(prompt);

    // Cache the results
    videoCache.set(cacheKey, {
      data: videos,
      timestamp: Date.now()
    });

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

async function fetchYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  try {
    // Use YouTube's search endpoint to get real videos
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`;
    
    // For demo purposes, we'll use a combination of real search and fallback videos
    // In production, you would use YouTube Data API v3 or a scraping service
    
    const videos = await scrapeYouTubeVideos(query);
    return sortVideosByDifficulty(videos, query);
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    // Fallback to educational videos if scraping fails
    return getFallbackVideos(query);
  }
}

async function scrapeYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  try {
    // Use YouTube Data API v3 to search for real videos
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn('YouTube API key not found, using fallback videos');
      return getFallbackVideos(query);
    }

    // Search for videos with different difficulty levels to get a good mix
    const searchQueries = [
      `${query} tutorial beginner`,     // Beginner content
      `${query} advanced`,              // Advanced content  
      `${query} course`,                // General course content
      `${query} deep dive`,             // Intermediate/Advanced content
      `${query} fundamentals`           // Basic concepts
    ];

    let allVideos: any[] = [];
    
    // Search with multiple queries to get diverse content
    for (const searchQuery of searchQueries) {
      try {
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `type=video&` +
          `videoDuration=medium&` +
          `videoDefinition=high&` +
          `relevanceLanguage=en&` +
          `maxResults=3&` +
          `key=${apiKey}`
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.items && searchData.items.length > 0) {
            allVideos.push(...searchData.items);
          }
        }
      } catch (error) {
        console.warn(`Search failed for query: ${searchQuery}`, error);
      }
    }

    if (allVideos.length === 0) {
      return getFallbackVideos(query);
    }

    // Remove duplicates and get unique video IDs
    const uniqueVideos = allVideos.filter((video, index, self) => 
      index === self.findIndex(v => v.id.videoId === video.id.videoId)
    );

    // Get video IDs for detailed information
    const videoIds = uniqueVideos.slice(0, 10).map((item: any) => item.id.videoId).join(',');
    
    // Get detailed video information
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails,statistics&` +
      `id=${videoIds}&` +
      `key=${apiKey}`
    );

    if (!detailsResponse.ok) {
      throw new Error(`YouTube API details error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();
    
    // Convert to our YouTubeVideo format
    const videos: YouTubeVideo[] = detailsData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      thumbnails: {
        default: { url: video.snippet.thumbnails.default?.url || `https://img.youtube.com/vi/${video.id}/default.jpg` },
        medium: { url: video.snippet.thumbnails.medium?.url || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` },
        high: { url: video.snippet.thumbnails.high?.url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` }
      },
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount
    }));

    return videos.slice(0, 5); // Return top 5 videos
    
  } catch (error) {
    console.error('Error fetching from YouTube API:', error);
    // Fallback to educational videos if API fails
    return getFallbackVideos(query);
  }
}


function getFallbackVideos(query: string): YouTubeVideo[] {
  // Fallback educational videos when scraping fails
  const fallbackIds = [
    'pQN-pnXPaVg', // HTML Tutorial
    'W6NZfCO5SIk', // JavaScript Tutorial
    'rfscVS0vtbw', // Python Tutorial
    'zJSY8tbf_ys', // React Tutorial
    'Ke90Tje7VS0'  // Node.js Tutorial
  ];

  return fallbackIds.map((id, index) => ({
    id,
    title: `${query} - ${['Complete Beginner Tutorial', 'Intermediate Guide', 'Advanced Techniques', 'Getting Started', 'Professional Course'][index]}`,
    description: `Learn ${query} with this comprehensive tutorial. Perfect for ${['beginners', 'intermediate learners', 'advanced users', 'newcomers', 'professionals'][index]}.`,
    channelTitle: 'Programming with Mosh',
    publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnails: {
      default: { url: `https://img.youtube.com/vi/${id}/default.jpg` },
      medium: { url: `https://img.youtube.com/vi/${id}/mqdefault.jpg` },
      high: { url: `https://img.youtube.com/vi/${id}/hqdefault.jpg` }
    },
    duration: ['PT15M30S', 'PT22M45S', 'PT35M20S', 'PT12M15S', 'PT45M10S'][index],
    viewCount: ['125000', '89000', '156000', '67000', '234000'][index]
  }));
}

// Helper functions for generating dynamic content
function generateVideoId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomTutorialType(): string {
  const types = [
    'Tutorial',
    'Complete Guide',
    'Crash Course',
    'Full Course',
    'Step by Step Guide',
    'Masterclass',
    'Deep Dive',
    'Fundamentals'
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomDescription(): string {
  const descriptions = [
    'Perfect for beginners and intermediate learners.',
    'Comprehensive coverage of all essential concepts.',
    'Hands-on examples and practical projects included.',
    'Learn industry best practices and modern techniques.',
    'Suitable for both beginners and experienced developers.',
    'Real-world examples and case studies included.',
    'Step-by-step approach with clear explanations.',
    'Professional-grade content for career development.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getRandomDate(): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 365);
  const randomDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return randomDate.toISOString();
}

function getRandomDuration(): string {
  const durations = ['PT10M30S', 'PT15M45S', 'PT22M15S', 'PT28M30S', 'PT35M20S', 'PT42M10S', 'PT18M25S', 'PT25M40S'];
  return durations[Math.floor(Math.random() * durations.length)];
}

function getRandomViewCount(): string {
  const viewCounts = ['45000', '78000', '125000', '234000', '156000', '89000', '345000', '567000'];
  return viewCounts[Math.floor(Math.random() * viewCounts.length)];
}

function sortVideosByDifficulty(videos: YouTubeVideo[], query: string): YouTubeVideo[] {
  return videos.map(video => ({
    ...video,
    difficultyScore: calculateDifficultyScore(video, query)
  })).sort((a, b) => {
    // Sort by difficulty: beginner (0) -> intermediate (1) -> advanced (2)
    return (a as any).difficultyScore - (b as any).difficultyScore;
  });
}

function calculateDifficultyScore(video: YouTubeVideo, query: string): number {
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  const text = `${title} ${description}`;

  // Check for beginner keywords
  for (const keyword of DIFFICULTY_KEYWORDS.beginner) {
    if (text.includes(keyword)) {
      return 0; // Beginner
    }
  }

  // Check for expert keywords
  for (const keyword of DIFFICULTY_KEYWORDS.expert) {
    if (text.includes(keyword)) {
      return 2; // Expert
    }
  }

  // Check for intermediate keywords
  for (const keyword of DIFFICULTY_KEYWORDS.intermediate) {
    if (text.includes(keyword)) {
      return 1; // Intermediate
    }
  }

  // Default to intermediate if no keywords found
  return 1;
}

// Function to convert ISO 8601 duration to readable format
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

// Function to format view count
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
