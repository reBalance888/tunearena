import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/models
 * Get all AI models with rankings
 */
export async function GET(request: NextRequest) {
  try {
    const models = await prisma.aIModel.findMany({
      orderBy: {
        elo: 'desc',
      },
    });

    // Add rank and win rate
    const modelsWithStats = models.map((model: any, index: number) => ({
      ...model,
      rank: index + 1,
      winRate: model.totalBattles > 0
        ? ((model.wins / model.totalBattles) * 100).toFixed(1)
        : '0.0',
    }));

    return NextResponse.json({ models: modelsWithStats });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/models
 * Create a new AI model
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, elo = 1500 } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const model = await prisma.aIModel.create({
      data: {
        name,
        elo,
      },
    });

    return NextResponse.json({ model }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Model with this name already exists' },
        { status: 400 }
      );
    }

    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}
