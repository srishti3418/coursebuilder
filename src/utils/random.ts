/**
 * Random data generation utilities for fallback videos
 */

/**
 * Generate a random YouTube video ID
 */
export function generateVideoId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get a random tutorial type
 */
export function getRandomTutorialType(): string {
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

/**
 * Get a random description
 */
export function getRandomDescription(): string {
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

/**
 * Get a random date within the last year
 */
export function getRandomDate(): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 365);
  const randomDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return randomDate.toISOString();
}

/**
 * Get a random duration
 */
export function getRandomDuration(): string {
  const durations = ['PT10M30S', 'PT15M45S', 'PT22M15S', 'PT28M30S', 'PT35M20S', 'PT42M10S', 'PT18M25S', 'PT25M40S'];
  return durations[Math.floor(Math.random() * durations.length)];
}

/**
 * Get a random view count
 */
export function getRandomViewCount(): string {
  const viewCounts = ['45000', '78000', '125000', '234000', '156000', '89000', '345000', '567000'];
  return viewCounts[Math.floor(Math.random() * viewCounts.length)];
}
