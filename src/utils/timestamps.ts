/**
 * Timestamp utility functions for extracting and processing video timestamps
 */

/**
 * Extract timestamps from video description
 */
export function extractTimestampsFromDescription(description: string): Array<{time: number, title: string}> {
  const timestamps: Array<{time: number, title: string}> = [];
  
  // Common timestamp patterns in YouTube descriptions
  const patterns = [
    // Pattern: 0:00 Introduction
    /(\d{1,2}:\d{2})\s+(.+)/g,
    // Pattern: 00:00 - Introduction
    /(\d{1,2}:\d{2})\s*-\s*(.+)/g,
    // Pattern: [0:00] Introduction
    /\[(\d{1,2}:\d{2})\]\s*(.+)/g,
    // Pattern: 0:00:00 Introduction (with hours)
    /(\d{1,2}:\d{2}:\d{2})\s+(.+)/g,
    // Pattern: 00:00:00 - Introduction (with hours)
    /(\d{1,2}:\d{2}:\d{2})\s*-\s*(.+)/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(description)) !== null) {
      const timeStr = match[1];
      const title = match[2].trim();
      
      // Convert time string to seconds
      const timeInSeconds = parseTimeStringToSeconds(timeStr);
      
      if (timeInSeconds > 0 && title.length > 0) {
        timestamps.push({ time: timeInSeconds, title });
      }
    }
  }
  
  // Sort by time and remove duplicates
  return timestamps
    .sort((a, b) => a.time - b.time)
    .filter((timestamp, index, arr) => 
      index === 0 || timestamp.time !== arr[index - 1].time
    );
}

/**
 * Create segments from extracted timestamps
 */
export function createSegmentsFromTimestamps(
  timestamps: Array<{time: number, title: string}>, 
  totalSeconds: number
): Array<{startTime: number, endTime: number, title: string}> {
  const segments: Array<{startTime: number, endTime: number, title: string}> = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    const currentTimestamp = timestamps[i];
    const nextTimestamp = timestamps[i + 1];
    
    const startTime = currentTimestamp.time;
    const endTime = nextTimestamp ? nextTimestamp.time : totalSeconds;
    
    segments.push({
      startTime,
      endTime,
      title: currentTimestamp.title
    });
  }
  
  return segments;
}

/**
 * Convert time string (MM:SS or HH:MM:SS) to seconds
 */
function parseTimeStringToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  return 0;
}
