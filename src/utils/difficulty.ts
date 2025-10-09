/**
 * Video difficulty scoring and sorting utilities
 */

// Video difficulty scoring based on keywords
export const DIFFICULTY_KEYWORDS = {
  beginner: ['beginner', 'basics', 'introduction', 'getting started', 'tutorial', 'learn', 'how to', 'step by step', 'for beginners'],
  intermediate: ['intermediate', 'advanced', 'deep dive', 'master', 'complete guide', 'comprehensive', 'in-depth'],
  expert: ['expert', 'professional', 'production', 'enterprise', 'optimization', 'performance', 'architecture']
};

/**
 * Calculate difficulty score for a video based on title and description
 */
export function calculateDifficultyScore(video: { title: string; description: string }, query: string): number {
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

/**
 * Sort videos by difficulty (beginner -> intermediate -> advanced)
 */
export function sortVideosByDifficulty<T extends { title: string; description: string }>(
  videos: T[], 
  query: string
): (T & { difficultyScore: number })[] {
  return videos.map(video => ({
    ...video,
    difficultyScore: calculateDifficultyScore(video, query)
  })).sort((a, b) => {
    // Sort by difficulty: beginner (0) -> intermediate (1) -> advanced (2)
    return a.difficultyScore - b.difficultyScore;
  });
}
