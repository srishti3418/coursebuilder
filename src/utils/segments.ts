/**
 * Video segment utility functions
 */

/**
 * Generate appropriate segment titles based on the topic
 */
export function generateSegmentTitles(query: string, segmentCount: number): string[] {
  const topic = query.toLowerCase();
  
  // Technology-specific patterns
  if (topic.includes('react')) {
    return [
      'Components & JSX',
      'State & Props',
      'Hooks & Effects',
      'Routing & Navigation',
      'Deployment & Best Practices'
    ];
  }
  
  if (topic.includes('javascript')) {
    return [
      'Variables & Functions',
      'Objects & Arrays',
      'DOM Manipulation',
      'Async Programming',
      'Modern ES6+ Features'
    ];
  }
  
  if (topic.includes('python')) {
    return [
      'Syntax & Variables',
      'Data Structures',
      'Functions & Classes',
      'File Handling & Libraries',
      'Advanced Concepts'
    ];
  }
  
  if (topic.includes('html') || topic.includes('css')) {
    return [
      'HTML Basics',
      'CSS Styling',
      'Responsive Design',
      'Advanced CSS',
      'Modern Web Development'
    ];
  }
  
  if (topic.includes('node')) {
    return [
      'Node.js Basics',
      'Express.js Framework',
      'Database Integration',
      'API Development',
      'Production Deployment'
    ];
  }
  
  // Default patterns
  return [
    'Introduction & Setup',
    'Basic Concepts',
    'Core Features',
    'Advanced Topics',
    'Best Practices & Conclusion'
  ];
}

/**
 * Create equal segments as fallback
 */
export function createEqualSegments(totalSeconds: number, query: string): Array<{startTime: number, endTime: number, title: string}> {
  const segmentCount = 5;
  const segmentDuration = Math.floor(totalSeconds / segmentCount);
  const segments: Array<{startTime: number, endTime: number, title: string}> = [];
  
  const segmentTitles = generateSegmentTitles(query, segmentCount);
  
  for (let i = 0; i < segmentCount; i++) {
    const startTime = i * segmentDuration;
    const endTime = Math.min((i + 1) * segmentDuration, totalSeconds);
    
    segments.push({
      startTime,
      endTime,
      title: segmentTitles[i] || `Part ${i + 1}`
    });
  }
  
  return segments;
}
