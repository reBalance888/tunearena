import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/votes
 * Get votes for a battle or user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const battleId = searchParams.get('battleId');
    const userWallet = searchParams.get('userWallet');

    if (!battleId && !userWallet) {
      return NextResponse.json(
        { error: 'battleId or userWallet required' },
        { status: 400 }
      );
    }

    const votes = await prisma.vote.findMany({
      where: {
        ...(battleId && { battleId }),
        ...(userWallet && { userWallet }),
      },
      include: {
        battle: {
          include: {
            trackA: true,
            trackB: true,
            winner: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/votes
 * Create a new vote/bet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { battleId, userWallet, choice, betAmount } = body;

    if (!battleId || !userWallet || !choice || !betAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if vote already exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        battleId_userWallet: {
          battleId,
          userWallet,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Vote already placed for this battle' },
        { status: 400 }
      );
    }

    // Check if battle is still open
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return NextResponse.json(
        { error: 'Battle not found' },
        { status: 404 }
      );
    }

    if (battle.isRevealed) {
      return NextResponse.json(
        { error: 'Battle already revealed' },
        { status: 400 }
      );
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        battleId,
        userWallet,
        choice,
        betAmount,
      },
      include: {
        battle: true,
      },
    });

    // Update global stats
    await prisma.globalStats.upsert({
      where: { id: 'singleton' },
      update: {
        totalVolume: { increment: BigInt(betAmount) },
      },
      create: {
        id: 'singleton',
        totalVolume: BigInt(betAmount),
      },
    });

    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: 'Failed to create vote' },
      { status: 500 }
    );
  }
}
