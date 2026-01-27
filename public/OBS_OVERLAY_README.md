# OBS Stream Overlay Setup Guide

## Overview

This HTML overlay provides real-time battle visualization for streaming on platforms like Twitch, YouTube, etc. using OBS Studio.

## Features

- **Live Battle Info**: Current battle number and prompt
- **Countdown Timer**: Real-time 60-second countdown
- **Track Cards**: Shows betting totals for Track A and Track B
- **Activity Feed**: Real-time betting activity from viewers
- **Winner Reveal**: Animated reveal with ELO changes
- **Global Stats**: Total battles, live viewers, prize pool

## OBS Studio Setup

### 1. Add Browser Source

1. Open OBS Studio
2. Click **+** in Sources panel
3. Select **Browser**
4. Name it "Tune Arena Overlay"
5. Configure settings:

```
URL: file:///C:/path/to/tuneArena/public/obs-overlay.html
(Or use http://localhost:3000/obs-overlay.html if running dev server)

Width: 1920
Height: 1080
FPS: 30
```

6. Check these options:
   - ✅ Shutdown source when not visible
   - ✅ Refresh browser when scene becomes active

### 2. Positioning

The overlay is designed for **1920x1080** resolution and should be positioned as a full-screen overlay on top of your main content.

**Recommended Layer Order (top to bottom):**
1. Tune Arena Overlay (this HTML file)
2. Webcam
3. Game/Content capture
4. Background

### 3. Transparency

The overlay has a transparent background, so it will blend perfectly with your stream content below.

## WebSocket Integration

### Production Mode

To receive real-time updates from the battle bot:

1. Uncomment the `connect()` call in the script
2. Update `WS_URL` to your WebSocket server address
3. Comment out `simulateDemo()`

```javascript
// Uncomment for production:
connect();

// Comment out for production:
// simulateDemo();
```

### Demo Mode

The overlay includes a demo mode that simulates battles without a WebSocket connection. This is enabled by default for testing.

## WebSocket Message Format

The overlay expects messages in this format:

### Battle Start
```json
{
  "type": "battle_start",
  "battleNumber": 248,
  "prompt": "Epic Orchestral Soundtrack with Choir"
}
```

### Countdown Update
```json
{
  "type": "countdown",
  "time": 45
}
```

### Bet Placed
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

### Winner Reveal
```json
{
  "type": "reveal",
  "trackAName": "Suno",
  "trackBName": "Udio",
  "winner": "Suno",
  "eloGain": 15
}
```

### Stats Update
```json
{
  "type": "stats",
  "totalBattles": "24.7K",
  "liveViewers": "1,234",
  "prizePool": "$890K"
}
```

## Customization

### Colors

Edit the CSS to match your branding:

```css
/* Primary color (Track A) */
#FF6B35

/* Secondary color (Track B) */
#00D9FF

/* Accent color (Countdown, etc.) */
#B24BF3

/* Winner gold */
#FFD700
```

### Fonts

The overlay uses Inter font. To change:

```css
body {
  font-family: 'Your Font', sans-serif;
}
```

### Layout

Adjust positions in CSS:

```css
.battle-info { top: 20px; }      /* Battle info bar */
.countdown { top: 140px; }        /* Countdown timer */
.tracks-container { bottom: 80px; } /* Track cards */
.activity-feed { top: 250px; }   /* Bet feed */
.stats-bar { bottom: 20px; }     /* Stats bar */
```

## Troubleshooting

### Overlay not showing in OBS

- Verify the file path is correct
- Check "Shutdown source when not visible" is unchecked while testing
- Right-click source → Properties → Refresh

### WebSocket not connecting

- Check WebSocket server is running
- Verify `WS_URL` is correct
- Check browser console in OBS (right-click source → Interact)

### Text is cut off

- Ensure OBS source dimensions are 1920x1080
- Check zoom level is 100% in source properties

### Performance issues

- Lower FPS to 15-20 in source settings
- Disable hardware acceleration in OBS if needed
- Limit activity feed to 5 items (edit `while (feed.children.length > 5)`)

## Tips for Streaming

1. **Test First**: Always test in a private stream before going live
2. **Activity Feed**: Consider muting bet notifications in chat to avoid spam
3. **Winner Reveal**: Time your commentary to match the 5-second reveal animation
4. **Mobile**: This overlay is NOT mobile-responsive (designed for 1920x1080 only)
5. **Backup**: Keep a screenshot of the overlay in case of connection issues

## Advanced: Multiple Scenes

Create different scenes for different phases:

- **Pre-Battle**: Show countdown at 60s, no bets yet
- **Betting Phase**: Full overlay with activity feed
- **Reveal**: Zoom in on winner card, hide bet feed
- **Post-Battle**: Show final stats, leaderboard

Switch between scenes using OBS Studio Mix or Scene Switcher plugin.

## Integration with Automated Bot

See `../bot/battle-bot.js` for the automated battle bot that sends WebSocket updates to this overlay.

## Support

For issues or questions:
- Check the browser console for errors (OBS → Right-click source → Interact → F12)
- Verify WebSocket messages format matches expected structure
- Test with demo mode first before connecting to live bot

## License

MIT - Feel free to customize and use in your streams!
