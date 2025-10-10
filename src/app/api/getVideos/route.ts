import { NextRequest, NextResponse } from 'next/server';
import {
  parseDurationToSeconds,
  formatSecondsToDuration,
  isLongVideo,
  extractTimestampsFromDescription,
  createSegmentsFromTimestamps,
  createEqualSegments,
  sortVideosByDifficulty,
  throttledYouTubeApiCall
} from '@/utils';
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
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
  };
  duration?: string;  // For segments
  viewCount?: string; // For segments
  startTime?: number;  
  endTime?: number;    
}

interface YouTubeSearchItem {
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
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string;
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
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}


// Cache for storing results (in-memory cache)
// interface CacheEntry {
//   data: Video[];
//   timestamp: number;
// }
// const videoCache = new Map<string, CacheEntry>();
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }
    
    // For demo purposes, we'll use a mock YouTube API response
    // In production, you would use the actual YouTube Data API v3
    const videos = await fetchYouTubeVideos(prompt);


    return NextResponse.json({ videos });

  } catch (error) {
    console.error('Error fetching videos:', error);
    
    // Handle quota exceeded errors specifically
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        { error: 'YouTube API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

async function fetchYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  try {
    // Use YouTube's search endpoint to get real videos
    // const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`;
    
    // For demo purposes, we'll use a combination of real search and fallback videos
    // In production, you would use YouTube Data API v3 or a scraping service
    
    const videos = await scrapeYouTubeVideos(query);
    return sortVideosByDifficulty(videos);
    
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

    // Search for the most popular crash course video
    const crashCourseQueries = [
      `${query} crash course`,          // Most popular crash course
      `${query} complete course`,       // Complete course alternative
      `${query} full tutorial`,         // Full tutorial alternative
      `${query} course tutorial`        // Course tutorial alternative
    ];

    let bestVideo: YouTubeVideo | null = null;
    let maxViews = 0;
    
    // Find the most viewed crash course video
    for (const searchQuery of crashCourseQueries) {
      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `type=video&` +
          `videoDuration=long&` +        // Look for longer videos (crash courses)
          `videoDefinition=high&` +
          `relevanceLanguage=en&` +
          `maxResults=5&` +              // Get top 5 to find best one
          `order=relevance&` +           // Order by relevance first
          `key=${apiKey}`;

        const searchResult = await throttledYouTubeApiCall<YouTubeSearchResponse>(searchUrl);
        
        if (searchResult.data && searchResult.data.items && searchResult.data.items.length > 0) {
          // Get detailed info for these videos to check view counts
          const videoIds = searchResult.data.items.map((item: YouTubeSearchItem) => item.id.videoId).join(',');
          
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
            `part=snippet,contentDetails,statistics&` +
            `id=${videoIds}&` +
            `key=${apiKey}`;

          const detailsResult = await throttledYouTubeApiCall<YouTubeVideoDetailsResponse>(detailsUrl);

          if (detailsResult.data && detailsResult.data.items) {
            const detailsData = detailsResult.data;
              
            // Find the video with highest view count
            for (const video of detailsData.items) {
              const viewCount = parseInt(video.statistics.viewCount || '0');
              const duration = video.contentDetails.duration;
              
              // Prefer videos that are 30+ minutes (good crash courses)
              if (viewCount > maxViews && isLongVideo(duration)) {
                maxViews = viewCount;
                bestVideo = {
                  id: video.id,
                  title: video.snippet.title,
                  description: video.snippet.description,
                  channelTitle: video.snippet.channelTitle,
                  publishedAt: video.snippet.publishedAt,
                  thumbnails: video.snippet.thumbnails,
                  contentDetails: video.contentDetails,
                  statistics: video.statistics
                };
              }
            }
          } else if (detailsResult.error) {
            console.warn(`Details API failed for query: ${searchQuery}`, detailsResult.error);
          }
        } else if (searchResult.error) {
          console.warn(`Search API failed for query: ${searchQuery}`, searchResult.error);
        }
      } catch (error) {
        console.warn(`Unexpected error for query: ${searchQuery}`, error);
      }
    }

    if (!bestVideo) {
      return getFallbackVideos(query);
    }

    // Split the crash course into smaller segments based on timestamps
    const videoSegments = await splitVideoIntoSegments(bestVideo, query);
    return videoSegments;
    
  } catch (error) {
    console.error('Error fetching from YouTube API:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof Error && error.message.includes('quota')) {
      throw new Error('YouTube API quota exceeded. Please try again later.');
    }
    
    // Fallback to educational videos if API fails
    return getFallbackVideos(query);
  }
}


// Function to split a long video into smaller segments based on actual timestamps
async function splitVideoIntoSegments(video: YouTubeVideo, query: string): Promise<YouTubeVideo[]> {
  const duration = video.contentDetails.duration;
  const totalSeconds = parseDurationToSeconds(duration);
  
  // Extract timestamps from video description
  const timestamps = extractTimestampsFromDescription(video.description || '');
  
  // If we found timestamps, use them; otherwise create equal segments
  let segments: Array<{startTime: number, endTime: number, title: string}>;
  
  if (timestamps.length > 0) {
    segments = createSegmentsFromTimestamps(timestamps, totalSeconds);
  } else {
    // Fallback: create equal segments
    segments = createEqualSegments(totalSeconds, query);
  }
  
  const videoSegments: YouTubeVideo[] = [];
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    videoSegments.push({
      id: video.id,
      title: segment.title,
      description: `Segment ${i + 1}: ${video.description?.substring(0, 100)}...`,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      thumbnails: {
        default: { url: video.thumbnails?.default?.url || `https://img.youtube.com/vi/${video.id}/default.jpg` },
        medium: { url: video.thumbnails?.medium?.url || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` },
        high: { url: video.thumbnails?.high?.url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` }
      },
      contentDetails: {
        duration: formatSecondsToDuration(segment.endTime - segment.startTime)
      },
      statistics: {
        viewCount: video.statistics?.viewCount || '0'
      },
      duration: formatSecondsToDuration(segment.endTime - segment.startTime),
      viewCount: video.statistics?.viewCount || '0',
      startTime: segment.startTime,
      endTime: segment.endTime
    });
  }
  
  return videoSegments;
}



function getFallbackVideos(query: string): YouTubeVideo[] {
  // Return empty array when YouTube API fails - will show "no videos available"
  console.log(`No videos found for query: ${query}`);
  return [];
}

