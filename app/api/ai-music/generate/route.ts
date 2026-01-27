import { NextRequest, NextResponse } from 'next/server';
import { musicManager } from '@/lib/ai-music/manager';

/**
 * POST /api/ai-music/generate
 * Generate AI music track
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, duration, style, instrumental } = body;

    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'Model and prompt are required' },
        { status: 400 }
      );
    }

    // Validate model
    const validModels = ['Suno', 'Udio', 'Stable Audio', 'ElevenLabs Music'];
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Must be one of: ${validModels.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate track
    const track = await musicManager.generate(model, {
      prompt,
      duration,
      style,
      instrumental,
    });

    return NextResponse.json({ track });
  } catch (error: any) {
    console.error('AI music generation error:', error);

    if (error.message.includes('API key')) {
      return NextResponse.json(
        {
          error: 'AI music API not configured',
          details: 'Please set up API keys in environment variables',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate music', details: error.message },
      { status: 500 }
    );
  }
}
