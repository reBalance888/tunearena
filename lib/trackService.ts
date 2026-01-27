/**
 * Track Service - handles loading and selecting tracks for battles
 */

export interface Track {
  id: string;
  prompt: string;
  ai_model: string;
  file_path: string;
  duration: number;
  elo: number;
  created_at: string;
  tags: string[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  elo: number;
  total_battles: number;
}

export interface TracksData {
  tracks: Track[];
  ai_models: AIModel[];
}

/**
 * Load tracks database from public/tracks.json
 */
export async function loadTracks(): Promise<TracksData> {
  try {
    const response = await fetch('/tracks.json');
    if (!response.ok) {
      throw new Error('Failed to load tracks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading tracks:', error);
    // Return fallback data with placeholder URLs
    return getFallbackTracks();
  }
}

/**
 * Select two random tracks with different AI models
 */
export function selectBattleTracks(tracks: Track[]): [Track, Track] {
  if (tracks.length < 2) {
    throw new Error('Not enough tracks for battle');
  }

  // Get unique AI models
  const modelGroups = tracks.reduce((acc, track) => {
    if (!acc[track.ai_model]) {
      acc[track.ai_model] = [];
    }
    acc[track.ai_model].push(track);
    return acc;
  }, {} as Record<string, Track[]>);

  const models = Object.keys(modelGroups);

  if (models.length < 2) {
    // If only one model, just pick two random tracks
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  // Pick two different models randomly
  const shuffledModels = models.sort(() => Math.random() - 0.5);
  const model1 = shuffledModels[0];
  const model2 = shuffledModels[1];

  // Pick random track from each model
  const track1 = modelGroups[model1][Math.floor(Math.random() * modelGroups[model1].length)];
  const track2 = modelGroups[model2][Math.floor(Math.random() * modelGroups[model2].length)];

  return [track1, track2];
}

/**
 * Get fallback tracks with placeholder audio URLs
 */
function getFallbackTracks(): TracksData {
  return {
    tracks: [
      {
        id: "fallback_001",
        prompt: "dark phonk beat with heavy 808s",
        ai_model: "Suno",
        file_path: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
        duration: 45,
        elo: 1542,
        created_at: "2026-01-27",
        tags: ["phonk", "dark"]
      },
      {
        id: "fallback_002",
        prompt: "dark phonk beat with heavy 808s",
        ai_model: "Udio",
        file_path: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_2948d6e39f.mp3",
        duration: 45,
        elo: 1489,
        created_at: "2026-01-27",
        tags: ["phonk", "dark"]
      }
    ],
    ai_models: [
      {
        id: "suno",
        name: "Suno",
        description: "Best for vocals and complex arrangements",
        elo: 1580,
        total_battles: 1247
      },
      {
        id: "udio",
        name: "Udio",
        description: "Excellent at instrumental and genre consistency",
        elo: 1560,
        total_battles: 1189
      }
    ]
  };
}

/**
 * Format duration in MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
