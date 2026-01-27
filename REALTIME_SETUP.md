# Real-time Updates Setup Guide

## Overview

Tune Arena uses Supabase for real-time updates across all connected clients. Users see:

- Live battles happening now
- Other users betting in real-time
- Stats updating live
- New battles starting

This creates a "Twitch-like" viewing experience where everyone is watching the same battle simultaneously.

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Create new project
4. Choose region (closest to your users)
5. Set database password (save it!)
6. Wait for project to provision (~2 minutes)

### 2. Get Credentials

From your Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Go to **Settings** → **Database**
4. Copy **Connection string** → `DATABASE_URL`
   - Click "Connection string"
   - Select "NodeJS"
   - Replace `[YOUR-PASSWORD]` with your actual password

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Seed initial data
npx prisma db seed
```

### 5. Enable Realtime in Supabase

1. Go to **Database** → **Replication**
2. Find these tables:
   - `battles`
   - `votes`
3. Click the toggle to enable replication for each table

### 6. Test Real-time Connection

Start your dev server:

```bash
npm run dev
```

Open browser console and check for:
```
Battles subscription status: SUBSCRIBED
Votes subscription status: SUBSCRIBED
```

## How It Works

### Architecture

```
Frontend (Next.js) ←→ Supabase Realtime ←→ PostgreSQL
     │                       │
     └─ Subscribes to:       └─ Listens to:
        - battles table         - INSERT
        - votes table           - UPDATE
                                - DELETE
```

### Data Flow

1. **Battle Creation**:
   ```
   API Route → Prisma → PostgreSQL
                          ↓
   Real-time notification → Supabase Realtime
                                    ↓
   WebSocket → Frontend (all clients)
   ```

2. **Vote/Bet Placed**:
   ```
   User submits bet → API → Database
                              ↓
   Real-time notification → All clients
                              ↓
   Live feed updates automatically
   ```

### Components

#### `useRealtimeBattle` Hook

```typescript
const { currentBattle, recentVotes, isConnected } = useRealtimeBattle();

// currentBattle: Current active battle data
// recentVotes: Last 10 votes in real-time
// isConnected: WebSocket connection status
```

#### `LiveBattleFeed` Component

Add to any page:

```tsx
import LiveBattleFeed from "@/components/LiveBattleFeed";

export default function Page() {
  return (
    <div>
      <LiveBattleFeed />
    </div>
  );
}
```

## Usage Examples

### Subscribe to Current Battle

```typescript
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

function MyComponent() {
  const [battle, setBattle] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel('my-battle-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
        },
        (payload) => {
          setBattle(payload.new);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return <div>Battle: {battle?.prompt}</div>;
}
```

### Listen for New Votes

```typescript
useEffect(() => {
  const channel = supabase
    .channel('votes-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
      },
      (payload) => {
        console.log('New vote:', payload.new);
        // Update UI
      }
    )
    .subscribe();

  return () => channel.unsubscribe();
}, []);
```

## Performance Considerations

### Rate Limiting

Supabase Realtime has rate limits:
- **Free tier**: 200 concurrent connections
- **Pro tier**: 500 concurrent connections

Set `eventsPerSecond` limit:

```typescript
export const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Max events per second
    },
  },
});
```

### Connection Management

Unsubscribe when component unmounts:

```typescript
useEffect(() => {
  const channel = supabase.channel('...');
  // ... setup

  return () => {
    channel.unsubscribe(); // Clean up!
  };
}, []);
```

### Filtering Events

Only listen to specific events:

```typescript
.on('postgres_changes', {
  event: 'INSERT',        // Only INSERTs
  schema: 'public',
  table: 'votes',
  filter: 'battleId=eq.123' // Only specific battle
}, handler)
```

## Troubleshooting

### Real-time not working

1. **Check replication is enabled**:
   - Supabase Dashboard → Database → Replication
   - Toggle on for `battles` and `votes` tables

2. **Verify credentials**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **Check browser console**:
   - Should see "SUBSCRIBED" status
   - No CORS errors

4. **Test connection**:
   ```typescript
   const { data, error } = await supabase
     .from('battles')
     .select('*')
     .limit(1);

   console.log('Connection test:', { data, error });
   ```

### Connection drops

- **Free tier limitation**: Connections timeout after 30 minutes of inactivity
- **Solution**: Implement reconnection logic:

```typescript
channel.on('system', { event: 'DISCONNECTED' }, () => {
  console.log('Disconnected, reconnecting...');
  setTimeout(() => channel.subscribe(), 5000);
});
```

### High latency

- **Issue**: Slow real-time updates
- **Solutions**:
  - Choose Supabase region closest to users
  - Reduce `eventsPerSecond` to lower load
  - Use database indexes on filtered columns

## Security

### Row Level Security (RLS)

Enable RLS for tables:

```sql
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow all to read battles
CREATE POLICY "Battles are viewable by everyone"
ON battles FOR SELECT
USING (true);

-- Allow authenticated users to insert votes
CREATE POLICY "Users can create votes"
ON votes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

### Secure API Keys

- ✅ Use `NEXT_PUBLIC_` prefix for client-side keys
- ✅ Use `anon` key (public, rate-limited)
- ❌ Never expose `service_role` key
- ✅ Use environment variables, never commit to git

## Monitoring

### Supabase Dashboard

View real-time metrics:
- **Database** → **Realtime** → Active connections
- **API** → Real-time requests per second
- **Logs** → Real-time errors

### Client-Side Monitoring

Track connection status:

```typescript
const [status, setStatus] = useState('disconnected');

channel
  .on('system', {}, (payload) => {
    setStatus(payload.status);
  })
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });
```

## Scaling

### Horizontal Scaling

For high traffic:

1. **Upgrade Supabase plan**: Pro or Enterprise
2. **Use connection pooling**: PgBouncer (included in Pro)
3. **Implement caching**: Redis for frequent queries
4. **CDN for static assets**: Vercel Edge Network

### Vertical Scaling

Optimize queries:

```typescript
// ❌ Bad: Fetches all columns
supabase.from('battles').select('*')

// ✅ Good: Only needed columns
supabase.from('battles').select('id, prompt, isRevealed')
```

## Alternative: WebSocket Server

If Supabase limits are reached, use custom WebSocket:

See: `bot/battle-bot.js` for WebSocket server implementation

Connect client:

```typescript
const ws = new WebSocket('ws://your-server:3001');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle updates
};
```

## Testing

### Unit Tests

Mock Supabase:

```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  },
}));
```

### Integration Tests

Use Supabase test project:

```bash
# Create test project
supabase init

# Start local Supabase
supabase start

# Run tests
npm test
```

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Support

For issues:
- Check Supabase [status page](https://status.supabase.com/)
- Join [Supabase Discord](https://discord.supabase.com/)
- File GitHub issue

## License

MIT
