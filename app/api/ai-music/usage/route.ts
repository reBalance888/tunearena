import { NextRequest, NextResponse } from 'next/server';
import { musicManager } from '@/lib/ai-music/manager';

/**
 * GET /api/ai-music/usage
 * Get API usage statistics and costs
 */
export async function GET(request: NextRequest) {
  try {
    const usage = musicManager.getTotalUsage();
    const cacheStats = musicManager.getCacheStats();

    return NextResponse.json({
      usage,
      cache: cacheStats,
    });
  } catch (error: any) {
    console.error('Failed to get usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to get usage statistics' },
      { status: 500 }
    );
  }
}
