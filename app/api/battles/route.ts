import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/battles
 * Get all battles or filter by query params
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const isRevealed = searchParams.get('revealed');

    const battles = await prisma.battle.findMany({
      take: limit,
      where: isRevealed !== null ? { isRevealed: isRevealed === 'true' } : undefined,
      include: {
        trackA: true,
        trackB: true,
        winner: true,
        votes: true,
      },
      orderBy: {
        battleNumber: 'desc',
      },
    });

    return NextResponse.json({ battles });
  } catch (error) {
    console.error('Error fetching battles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/battles
 * Create a new battle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, trackAId, trackBId, trackAUrl, trackBUrl } = body;

    if (!prompt || !trackAId || !trackBId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const battle = await prisma.battle.create({
      data: {
        prompt,
        trackAId,
        trackBId,
        trackAUrl,
        trackBUrl,
      },
      include: {
        trackA: true,
        trackB: true,
      },
    });

    return NextResponse.json({ battle }, { status: 201 });
  } catch (error) {
    console.error('Error creating battle:', error);
    return NextResponse.json(
      { error: 'Failed to create battle' },
      { status: 500 }
    );
  }
}
