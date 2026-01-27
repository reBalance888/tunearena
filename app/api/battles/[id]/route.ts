import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/battles/[id]
 * Get a specific battle by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const battle = await prisma.battle.findUnique({
      where: { id: params.id },
      include: {
        trackA: true,
        trackB: true,
        winner: true,
        votes: true,
      },
    });

    if (!battle) {
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ battle });
  } catch (error) {
    console.error('Error fetching battle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battle' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/battles/[id]
 * Update a battle (reveal winner)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { winnerId, isRevealed } = body;

    const battle = await prisma.battle.update({
      where: { id: params.id },
      data: {
        winnerId,
        isRevealed,
        revealedAt: isRevealed ? new Date() : undefined,
      },
      include: {
        trackA: true,
        trackB: true,
        winner: true,
      },
    });

    // Update AI model stats
    if (winnerId && isRevealed) {
      await updateAIModelStats(battle);
    }

    return NextResponse.json({ battle });
  } catch (error) {
    console.error('Error updating battle:', error);
    return NextResponse.json(
      { error: 'Failed to update battle' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Update AI model ELO and stats
 */
async function updateAIModelStats(battle: any) {
  const winner = battle.winner;
  const loser = battle.winnerId === battle.trackAId ? battle.trackB : battle.trackA;

  if (!winner || !loser) return;

  // Simple ELO calculation (K-factor = 32)
  const K = 32;
  const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
  const expectedLoser = 1 - expectedWinner;

  const newWinnerElo = Math.round(winner.elo + K * (1 - expectedWinner));
  const newLoserElo = Math.round(loser.elo + K * (0 - expectedLoser));

  // Update winner
  await prisma.aIModel.update({
    where: { id: winner.id },
    data: {
      elo: newWinnerElo,
      wins: { increment: 1 },
      totalBattles: { increment: 1 },
    },
  });

  // Update loser
  await prisma.aIModel.update({
    where: { id: loser.id },
    data: {
      elo: newLoserElo,
      losses: { increment: 1 },
      totalBattles: { increment: 1 },
    },
  });

  // Update global stats
  await prisma.globalStats.upsert({
    where: { id: 'singleton' },
    update: {
      totalBattles: { increment: 1 },
    },
    create: {
      id: 'singleton',
      totalBattles: 1,
    },
  });
}
