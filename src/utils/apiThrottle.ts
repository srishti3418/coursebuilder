/**
 * API Throttling and Rate Limiting Utilities
 * Handles YouTube API rate limits and implements retry logic
 */

interface ThrottleOptions {
  delayMs?: number;
  maxRetries?: number;
  backoffMultiplier?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiThrottler {
  private lastRequestTime = 0;
  private requestCount = 0;
  private readonly defaultDelay = 100; // Reduced from 1000ms to 100ms for faster responses
  private readonly maxRequestsPerMinute = 50; // YouTube API limit
  private readonly requestTimes: number[] = [];

  /**
   * Throttle API requests to respect rate limits
   */
  async throttle<T>(
    apiCall: () => Promise<Response>,
    options: ThrottleOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      delayMs = this.defaultDelay,
      maxRetries = 3,
      backoffMultiplier = 2
    } = options;

    let lastError: Error | null = null;
    let delay = delayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Wait if we're hitting rate limits
        await this.waitForRateLimit();

        // Make the API call
        const response = await apiCall();
        
        // Update request tracking
        this.updateRequestTracking();

        // Handle rate limit responses
        if (response.status === 429) {
          const retryAfter = this.getRetryAfterDelay(response);
          console.warn(`Rate limited. Retrying after ${retryAfter}ms`);
          await this.delay(retryAfter);
          continue;
        }

        // Handle quota exceeded
        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error?.message?.includes('quota')) {
            throw new Error('YouTube API quota exceeded. Please try again later.');
          }
        }

        // Success
        if (response.ok) {
          const data = await response.json();
          return { data, status: response.status };
        }

        // Other errors
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on quota exceeded or client errors
        if (error instanceof Error && 
            (error.message.includes('quota') || 
             error.message.includes('400') || 
             error.message.includes('401'))) {
          break;
        }

        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
          await this.delay(delay);
          delay *= backoffMultiplier;
        }
      }
    }

    return {
      error: lastError?.message || 'API call failed after all retries',
      status: 500
    };
  }

  /**
   * Wait if we're approaching rate limits
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old request times
    while (this.requestTimes.length > 0 && this.requestTimes[0] < oneMinuteAgo) {
      this.requestTimes.shift();
    }

    // If we're at the limit, wait
    if (this.requestTimes.length >= this.maxRequestsPerMinute) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = 60000 - (now - oldestRequest) + 1000; // Add 1 second buffer
      
      if (waitTime > 0) {
        console.log(`Rate limit approaching. Waiting ${waitTime}ms`);
        await this.delay(waitTime);
      }
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.defaultDelay) {
      await this.delay(this.defaultDelay - timeSinceLastRequest);
    }
  }

  /**
   * Update request tracking
   */
  private updateRequestTracking(): void {
    const now = Date.now();
    this.lastRequestTime = now;
    this.requestTimes.push(now);
    this.requestCount++;
  }

  /**
   * Get retry delay from response headers
   */
  private getRetryAfterDelay(response: Response): number {
    const retryAfter = response.headers.get('Retry-After');
    if (retryAfter) {
      return parseInt(retryAfter) * 1000; // Convert to milliseconds
    }
    return 60000; // Default 1 minute
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current request statistics
   */
  getStats() {
    return {
      totalRequests: this.requestCount,
      requestsInLastMinute: this.requestTimes.length,
      lastRequestTime: this.lastRequestTime
    };
  }
}

// Create a singleton instance
export const apiThrottler = new ApiThrottler();

/**
 * Convenience function for throttled fetch
 */
export async function throttledFetch<T>(
  url: string,
  options: RequestInit = {},
  throttleOptions: ThrottleOptions = {}
): Promise<ApiResponse<T>> {
  return apiThrottler.throttle<T>(
    () => fetch(url, options),
    throttleOptions
  );
}

/**
 * YouTube API specific throttling
 */
export async function throttledYouTubeApiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return throttledFetch<T>(url, options, {
    delayMs: 100, // Reduced from 1200ms to 100ms for faster responses
    maxRetries: 3,
    backoffMultiplier: 2
  });
}
