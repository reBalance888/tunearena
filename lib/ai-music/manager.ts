/**
 * AI Music Generation Manager
 * Handles caching, cost tracking, and API key management
 */

import { SunoAPI } from './suno';
import { UdioAPI } from './udio';
import { GenerationOptions, GeneratedTrack } from './base';

interface CachedTrack extends GeneratedTrack {
  expiresAt: Date;
}

export class MusicGenerationManager {
  private sunoAPI: SunoAPI;
  private udoAPI: UdioAPI;
  private cache: Map<string, CachedTrack> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Load API keys from environment
    const sunoKey = process.env.SUNO_API_KEY || '';
    const udioKey = process.env.UDIO_API_KEY || '';

    this.sunoAPI = new SunoAPI(sunoKey);
    this.udoAPI = new UdioAPI(udioKey);
  }

  /**
   * Generate track with caching
   */
  async generate(
    model: 'Suno' | 'Udio' | 'Stable Audio' | 'ElevenLabs Music',
    options: GenerationOptions
  ): Promise<GeneratedTrack> {
    // Generate cache key
    const cacheKey = this.getCacheKey(model, options);

    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`[Cache] Hit for ${model} - ${options.prompt}`);
      return cached;
    }

    // Generate new track
    console.log(`[Cache] Miss for ${model} - ${options.prompt}`);
    let track: GeneratedTrack;

    switch (model) {
      case 'Suno':
        track = await this.sunoAPI.generate(options);
        break;
      case 'Udio':
        track = await this.udoAPI.generate(options);
        break;
      default:
        throw new Error(`Model ${model} not implemented yet`);
    }

    // Cache the result
    this.addToCache(cacheKey, track);

    return track;
  }

  /**
   * Get total API usage and costs
   */
  getTotalUsage() {
    const sunoUsage = this.sunoAPI.getUsage();
    const udioUsage = this.udoAPI.getUsage();

    return {
      totalRequests: sunoUsage.totalRequests + udioUsage.totalRequests,
      totalCost: sunoUsage.totalCost + udioUsage.totalCost,
      byModel: {
        Suno: sunoUsage,
        Udio: udioUsage,
      },
    };
  }

  /**
   * Clear expired cache entries
   */
  cleanCache(): void {
    const now = new Date();
    let cleaned = 0;

    this.cache.forEach((track, key) => {
      if (track.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`[Cache] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxAge: this.cacheExpiry / 1000 / 60 / 60, // hours
    };
  }

  /**
   * Generate cache key from model and options
   */
  private getCacheKey(model: string, options: GenerationOptions): string {
    const parts = [
      model,
      options.prompt,
      options.duration || 30,
      options.style || 'default',
      options.instrumental ? 'instrumental' : 'vocal',
    ];
    return parts.join('::');
  }

  /**
   * Get track from cache if not expired
   */
  private getFromCache(key: string): GeneratedTrack | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check expiry
    if (cached.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  /**
   * Add track to cache
   */
  private addToCache(key: string, track: GeneratedTrack): void {
    const expiresAt = new Date(Date.now() + this.cacheExpiry);

    this.cache.set(key, {
      ...track,
      expiresAt,
    });
  }
}

// Singleton instance
export const musicManager = new MusicGenerationManager();
