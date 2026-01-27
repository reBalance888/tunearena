# AI Music Generation Setup Guide

## Overview

Tune Arena supports multiple AI music generation services:
- **Suno** - High-quality AI music with vocals
- **Udio** - AI-generated music tracks
- **Stable Audio** - Coming soon
- **ElevenLabs Music** - Coming soon

## Current Status

⚠️ **Important**: This implementation uses **placeholder/mock APIs** for development. To use real AI music generation, you need to:

1. Obtain API keys from each service
2. Update the API client implementations
3. Configure environment variables

## Getting API Keys

### Phase 3.2.1: Suno API

1. Visit [suno.ai](https://www.suno.ai/)
2. Sign up for an account
3. Navigate to API settings
4. Generate API key
5. Add to `.env.local`:
   ```
   SUNO_API_KEY="your-suno-api-key-here"
   ```

**Pricing** (estimated):
- ~$0.10 per 30-second generation
- Check current pricing on Suno website

### Phase 3.2.2: Udio API

1. Visit [udio.com](https://www.udio.com/)
2. Sign up for an account
3. Access API documentation
4. Generate API key
5. Add to `.env.local`:
   ```
   UDIO_API_KEY="your-udio-api-key-here"
   ```

**Pricing** (estimated):
- ~$0.12 per 30-second generation
- Check current pricing on Udio website

### Phase 3.2.3: Other Models

Support for additional models coming soon:
- Stable Audio
- ElevenLabs Music
- MusicGen
- AudioCraft

## Architecture

### Components

```
MusicGenerationManager
├── SunoAPI (implements AIMusicAPI)
├── UdioAPI (implements AIMusicAPI)
├── Cache (24-hour TTL)
└── Cost Tracking
```

### Base Class: AIMusicAPI

All API clients extend this base class:

```typescript
abstract class AIMusicAPI {
  abstract generate(options: GenerationOptions): Promise<GeneratedTrack>;
  abstract checkStatus(id: string): Promise<Status>;
  getUsage(): APIUsage;
}
```

### Manager: MusicGenerationManager

Central manager that handles:
- API key management
- Caching (24 hours)
- Cost tracking
- Rate limiting
- Error handling

## Usage

### Generate Track

```typescript
import { musicManager } from '@/lib/ai-music/manager';

const track = await musicManager.generate('Suno', {
  prompt: 'Dark phonk beat with heavy bass',
  duration: 30,
  style: 'phonk',
  instrumental: true,
});

console.log('Generated:', track.url);
```

### API Route

```bash
POST /api/ai-music/generate

{
  "model": "Suno",
  "prompt": "Epic orchestral soundtrack",
  "duration": 30,
  "instrumental": false
}

Response:
{
  "track": {
    "id": "suno_1234567890",
    "url": "https://cdn.suno.ai/tracks/...",
    "duration": 30,
    "prompt": "Epic orchestral soundtrack",
    "model": "Suno",
    "createdAt": "2025-01-27T12:00:00Z",
    "cost": 0.10
  }
}
```

### Get Usage Stats

```bash
GET /api/ai-music/usage

Response:
{
  "usage": {
    "totalRequests": 247,
    "totalCost": 29.64,
    "byModel": {
      "Suno": {
        "totalRequests": 150,
        "totalCost": 15.00
      },
      "Udio": {
        "totalRequests": 97,
        "totalCost": 11.64
      }
    }
  },
  "cache": {
    "size": 45,
    "maxAge": 24
  }
}
```

## Caching

Tracks are cached for **24 hours** to:
- Reduce API costs
- Improve response times
- Handle duplicate requests

Cache key format:
```
{model}::{prompt}::{duration}::{style}::{vocal/instrumental}
```

Example:
```
Suno::Dark phonk beat::30::phonk::instrumental
```

## Rate Limiting

The manager automatically handles rate limiting:
- Detects HTTP 429 responses
- Waits for `Retry-After` header
- Defaults to 60-second wait if no header
- Retries the request automatically

## Cost Tracking

Track costs per model:

```typescript
const usage = musicManager.getTotalUsage();

console.log(`Total cost: $${usage.totalCost}`);
console.log(`Suno: $${usage.byModel.Suno.totalCost}`);
console.log(`Udio: $${usage.byModel.Udio.totalCost}`);
```

## Real Implementation

### Step 1: Update API Client

Edit `lib/ai-music/suno.ts`:

```typescript
// Replace mockAPICall with realAPICall
async generate(options: GenerationOptions): Promise<GeneratedTrack> {
  this.validateApiKey();

  const response = await fetch(`${this.baseURL}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      duration: options.duration || 30,
      instrumental: options.instrumental ?? false,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.audio_url,
    duration: data.duration,
    prompt: options.prompt,
    model: 'Suno',
    createdAt: new Date(),
    cost: data.cost || 0.1,
  };
}
```

### Step 2: Test API

```bash
# Set API key
export SUNO_API_KEY="your-key"

# Test generation
curl -X POST http://localhost:3000/api/ai-music/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Suno",
    "prompt": "Test track",
    "duration": 30
  }'
```

### Step 3: Monitor Costs

```bash
# Check usage
curl http://localhost:3000/api/ai-music/usage
```

## Error Handling

### Common Errors

#### API Key Missing

```json
{
  "error": "AI music API not configured",
  "details": "Please set up API keys in environment variables"
}
```

**Solution**: Add API keys to `.env.local`

#### Rate Limit Exceeded

The manager automatically handles this with exponential backoff.

#### Invalid Prompt

```json
{
  "error": "Invalid prompt",
  "details": "Prompt must be 10-500 characters"
}
```

**Solution**: Validate prompt length client-side

#### Generation Failed

```json
{
  "error": "Failed to generate music",
  "details": "API returned 500 error"
}
```

**Solution**: Check API status page, retry later

## Best Practices

### 1. Validate Before Generation

```typescript
function validatePrompt(prompt: string): boolean {
  return prompt.length >= 10 && prompt.length <= 500;
}
```

### 2. Use Cache Effectively

Don't regenerate the same track multiple times:

```typescript
// Good: Reuse cache
const track1 = await musicManager.generate('Suno', { prompt: 'Dark phonk' });
const track2 = await musicManager.generate('Suno', { prompt: 'Dark phonk' }); // Cache hit!
```

### 3. Monitor Costs

Set up cost alerts:

```typescript
const usage = musicManager.getTotalUsage();
if (usage.totalCost > 100) {
  console.warn('⚠️ API costs exceeded $100');
  // Send alert notification
}
```

### 4. Handle Failures Gracefully

```typescript
try {
  const track = await musicManager.generate('Suno', options);
} catch (error) {
  // Fallback to another model
  console.warn('Suno failed, trying Udio...');
  const track = await musicManager.generate('Udio', options);
}
```

## Production Checklist

Before deploying to production:

- [ ] Real API keys configured (not test keys)
- [ ] Cost alerts set up
- [ ] Rate limiting tested
- [ ] Cache working correctly
- [ ] Error handling for all APIs
- [ ] Monitoring dashboard setup
- [ ] Budget limits in place
- [ ] CDN configured for audio files
- [ ] Database for tracking generations
- [ ] Backup API providers configured

## Monitoring

### Track Key Metrics

1. **Generation Success Rate**: % of successful generations
2. **Average Cost Per Track**: Total cost / total generations
3. **Cache Hit Rate**: Cache hits / total requests
4. **API Response Time**: Average latency per model
5. **Error Rate**: Failed generations / total attempts

### Example Dashboard

```typescript
const stats = {
  successRate: 98.5,        // %
  avgCost: 0.11,            // USD
  cacheHitRate: 65.3,       // %
  avgResponseTime: 2.3,     // seconds
  errorRate: 1.5,           // %
};
```

## Troubleshooting

### High Costs

- Increase cache TTL (currently 24h)
- Reduce generation frequency
- Use cheaper models for testing
- Implement user quotas

### Slow Generation

- Check API response times
- Verify network latency
- Use cache more effectively
- Consider async generation

### Cache Not Working

```typescript
// Debug cache
const stats = musicManager.getCacheStats();
console.log('Cache size:', stats.size);

// Force cache clear
musicManager.cleanCache();
```

## Future Improvements

- [ ] Async generation with webhooks
- [ ] Multiple audio formats (MP3, WAV, FLAC)
- [ ] Custom model fine-tuning
- [ ] Batch generation API
- [ ] Priority queue for generations
- [ ] Cost optimization algorithms
- [ ] A/B testing different models
- [ ] User feedback on quality

## Resources

- [Suno Documentation](https://www.suno.ai/docs) (when available)
- [Udio API Guide](https://www.udio.com/api) (when available)
- [Stable Audio API](https://stability.ai/audio)
- [ElevenLabs Music](https://elevenlabs.io/music)

## Support

For API issues:
- Check provider status pages
- Review API documentation
- Contact provider support
- Check GitHub issues

## License

MIT
