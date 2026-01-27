# Tune Arena Automated Battle Bot

24/7 automated bot that runs AI music battles continuously.

## Features

- **Automated Battles**: Runs continuously with 2-minute breaks between battles
- **Random Selection**: Picks random prompts and AI models for each battle
- **60s Countdown**: Standard battle duration
- **WebSocket Broadcasting**: Sends real-time updates to OBS overlay and web clients
- **ELO Calculation**: Automatically updates AI model rankings
- **Logging**: Comprehensive logging to file and console
- **Graceful Shutdown**: Handles SIGINT/SIGTERM cleanly

## Flow

```
1. Pick random prompt from list
2. Select two different AI models
3. Generate Track A (random AI)
4. Generate Track B (different AI)
5. Broadcast battle start
6. Count down from 60 to 0
7. Collect votes/bets (simulated)
8. Reveal winner
9. Update ELO
10. Broadcast stats
11. Sleep 2 minutes
12. Repeat
```

## Installation

```bash
cd bot
npm install
```

## Configuration

Edit `battle-bot.js` to change settings:

```javascript
const CONFIG = {
  PORT: 3001,                      // WebSocket port
  COUNTDOWN_TIME: 60,              // Battle duration (seconds)
  SLEEP_BETWEEN_BATTLES: 120,     // Break between battles (seconds)
  LOG_FILE: 'battle-bot.log',     // Log file path
  PROMPTS_FILE: 'prompts.json',   // Prompts file
};
```

## Running

### Development (with auto-restart)

```bash
npm run dev
```

### Production

```bash
npm start
```

### As PM2 Service

```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start battle-bot.js --name tune-arena-bot

# View logs
pm2 logs tune-arena-bot

# Stop bot
pm2 stop tune-arena-bot

# Restart bot
pm2 restart tune-arena-bot

# Auto-start on boot
pm2 startup
pm2 save
```

## WebSocket API

### Server → Client Messages

#### Battle Start
```json
{
  "type": "battle_start",
  "battleNumber": 248,
  "prompt": "Dark Phonk Beat with Heavy Bass"
}
```

#### Countdown
```json
{
  "type": "countdown",
  "time": 45
}
```

#### Bet Placed
```json
{
  "type": "bet_placed",
  "wallet": "ABC123...XYZ789",
  "amount": 50,
  "track": "Track A",
  "totalA": 350,
  "totalB": 280,
  "bettorsA": 12,
  "bettorsB": 8
}
```

#### Winner Reveal
```json
{
  "type": "reveal",
  "trackAName": "Suno",
  "trackBName": "Udio",
  "winner": "Suno",
  "eloGain": 15
}
```

#### Stats Update
```json
{
  "type": "stats",
  "totalBattles": "24,947",
  "liveViewers": "1,234",
  "prizePool": "$890,000"
}
```

## Adding Custom Prompts

Edit `prompts.json`:

```json
{
  "prompts": [
    "Your custom prompt here",
    "Another prompt",
    "..."
  ]
}
```

## Logging

Logs are written to:
- Console (stdout)
- `battle-bot.log` file

Log format:
```
[2025-01-27T12:34:56.789Z] [INFO] Starting Battle #248
[2025-01-27T12:34:56.890Z] [INFO] Prompt: "Dark Phonk Beat with Heavy Bass"
[2025-01-27T12:34:56.991Z] [INFO] Track A: Suno (ELO: 1542)
```

View live logs:
```bash
npm run logs
# or
tail -f battle-bot.log
```

## Error Handling

The bot includes automatic error recovery:
- **Generation Failed**: Waits 10s and retries
- **WebSocket Error**: Removes client, continues
- **Fatal Error**: Logs, waits 10s, retries battle loop

## Integration with Real AI APIs

To integrate real music generation:

1. Add API keys to environment variables
2. Replace `generateTrack()` function:

```javascript
async function generateTrack(aiModel, prompt) {
  switch (aiModel.name) {
    case 'Suno':
      return await callSunoAPI(prompt);
    case 'Udio':
      return await callUdioAPI(prompt);
    // ... other models
  }
}
```

3. Implement API clients for each service
4. Handle rate limiting and API errors

## Production Deployment

### Security

- Run bot as non-root user
- Use firewall to restrict WebSocket port
- Enable TLS/WSS for production
- Add authentication for WebSocket connections

### Monitoring

Use PM2 or similar process manager:

```bash
# Monitor CPU/memory
pm2 monit

# View detailed info
pm2 show tune-arena-bot

# Set up alerts
pm2 install pm2-server-monit
```

### Backup

Bot state is transient, but consider backing up:
- `battle-bot.log` - for analytics
- `prompts.json` - custom prompts
- ELO data (if persisting to file)

## Testing

Connect a test client:

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001');

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});
```

Or use OBS overlay (`../public/obs-overlay.html`) with:
```javascript
const WS_URL = 'ws://localhost:3001';
```

## Troubleshooting

### Bot won't start

- Check if port 3001 is already in use: `netstat -an | findstr 3001`
- Verify Node.js version: `node --version` (requires 18+)
- Check logs for errors

### WebSocket clients not connecting

- Verify bot is running: `pm2 list`
- Check firewall rules
- Test with `telnet localhost 3001`

### High memory usage

- Reduce client limit
- Clear old logs: `> battle-bot.log`
- Restart bot: `pm2 restart tune-arena-bot`

## Future Improvements

- [ ] Real AI music generation integration
- [ ] Database persistence for battles
- [ ] User authentication for WebSocket
- [ ] Rate limiting for bets
- [ ] Multiple concurrent battles
- [ ] Admin API for control panel
- [ ] Prometheus metrics endpoint
- [ ] Docker container

## License

MIT
