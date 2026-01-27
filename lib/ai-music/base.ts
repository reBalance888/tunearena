/**
 * Base class for AI music generation APIs
 */

export interface GenerationOptions {
  prompt: string;
  duration?: number; // seconds
  style?: string;
  instrumental?: boolean;
}

export interface GeneratedTrack {
  id: string;
  url: string;
  duration: number;
  prompt: string;
  model: string;
  createdAt: Date;
  cost?: number; // in USD
}

export interface APIUsage {
  totalRequests: number;
  totalCost: number;
  lastRequest: Date;
}

export abstract class AIMusicAPI {
  protected apiKey: string;
  protected baseURL: string = '';
  protected usage: APIUsage;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.usage = {
      totalRequests: 0,
      totalCost: 0,
      lastRequest: new Date(),
    };
  }

  /**
   * Generate a music track from prompt
   */
  abstract generate(options: GenerationOptions): Promise<GeneratedTrack>;

  /**
   * Check generation status (for async APIs)
   */
  abstract checkStatus(id: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    track?: GeneratedTrack;
    error?: string;
  }>;

  /**
   * Get API usage stats
   */
  getUsage(): APIUsage {
    return { ...this.usage };
  }

  /**
   * Update usage stats
   */
  protected updateUsage(cost: number): void {
    this.usage.totalRequests++;
    this.usage.totalCost += cost;
    this.usage.lastRequest = new Date();
  }

  /**
   * Validate API key
   */
  protected validateApiKey(): void {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('API key is required');
    }
  }

  /**
   * Handle rate limiting
   */
  protected async handleRateLimit(retryAfter?: number): Promise<void> {
    const delay = retryAfter || 60000; // Default 60s
    console.warn(`Rate limit hit, waiting ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
