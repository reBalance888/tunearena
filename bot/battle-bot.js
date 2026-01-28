/**
 * Automated Battle Bot for Tune Arena
 *
 * Runs 24/7 to:
 * 1. Pick random prompt
 * 2. Generate Track A (random AI)
 * 3. Generate Track B (different AI)
 * 4. Start 60 second countdown
 * 5. Collect votes/bets
 * 6. Reveal winner
 * 7. Update ELO
 * 8. Sleep 2 minutes
 * 9. Repeat
 */

const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  PORT: 3001,
  COUNTDOWN_TIME: 60, // seconds
  SLEEP_BETWEEN_BATTLES: 120, // seconds (2 minutes)
  LOG_FILE: path.join(__dirname, 'battle-bot.log'),
  PROMPTS_FILE: path.join(__dirname, 'prompts.json'),
};

// AI Models available for battles
const AI_MODELS = [
  { name: 'Suno', elo: 1542 },
  { name: 'Udio', elo: 1489 },
  { name: 'Stable Audio', elo: 1435 },
  { name: 'ElevenLabs Music', elo: 1398 },
  { name: 'MusicGen', elo: 1356 },
  { name: 'AudioCraft', elo: 1312 },
];

// WebSocket server
let wss;
let clients = new Set();

// Battle state
let currentBattle = null;
let battleNumber = 247;
let isRunning = false;

// Logging
async function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}\n`;
  console.log(logLine.trim());

  try {
    await fs.appendFile(CONFIG.LOG_FILE, logLine);
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Load prompts from file
async function loadPrompts() {
  try {
    const data = await fs.readFile(CONFIG.PROMPTS_FILE, 'utf8');
    const { prompts } = JSON.parse(data);
    return prompts;
  } catch (error) {
    log(`Failed to load prompts: ${error.message}`, 'WARN');
    // Fallback prompts
    return [
      'Dark Phonk Beat with Heavy Bass',
      'Epic Orchestral Soundtrack with Choir',
      'Lo-fi Chill Hop for Studying',
      'Aggressive Trap Beat with 808s',
      'Ambient Space Music with Synths',
      'Upbeat Pop Song with Catchy Melody',
      'Heavy Metal Guitar Riff',
      'Smooth Jazz Piano Solo',
    ];
  }
}

// Pick random AI model
function pickRandomAI(exclude = null) {
  const available = AI_MODELS.filter((ai) => ai.name !== exclude?.name);
  return available[Math.floor(Math.random() * available.length)];
}

// Pick random prompt
function pickRandomPrompt(prompts) {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// Generate track URL (placeholder - replace with real AI generation)
async function generateTrack(aiModel, prompt) {
  log(`Generating track: ${aiModel.name} - "${prompt}"`, 'INFO');

  // Simulate generation delay
  await sleep(2000);

  // In production, call actual AI music API here
  // For now, return placeholder
  return {
    url: `https://example.com/tracks/${aiModel.name.toLowerCase()}-${Date.now()}.mp3`,
    duration: 30, // seconds
  };
}

// Sleep utility
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Calculate ELO change
function calculateELO(winnerElo, loserElo, K = 32) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWinner));
  const newLoserElo = Math.round(loserElo + K * (0 - expectedLoser));

  return {
    winner: newWinnerElo,
    loser: newLoserElo,
    change: newWinnerElo - winnerElo,
  };
}

// Main battle loop
async function runBattle() {
  try {
    battleNumber++;
    log(`\n${'='.repeat(60)}`, 'INFO');
    log(`Starting Battle #${battleNumber}`, 'INFO');
    log(`${'='.repeat(60)}`, 'INFO');

    // 1. Pick random prompt
    const prompts = await loadPrompts();
    const prompt = pickRandomPrompt(prompts);
    log(`Prompt: "${prompt}"`, 'INFO');

    // 2. Pick two different AI models
    const trackA = pickRandomAI();
    const trackB = pickRandomAI(trackA);
    log(`Track A: ${trackA.name} (ELO: ${trackA.elo})`, 'INFO');
    log(`Track B: ${trackB.name} (ELO: ${trackB.elo})`, 'INFO');

    // 3. Generate tracks (simulated)
    log('Generating tracks...', 'INFO');
    const [trackAData, trackBData] = await Promise.all([
      generateTrack(trackA, prompt),
      generateTrack(trackB, prompt),
    ]);

    log('Tracks generated successfully', 'INFO');

    // 4. Initialize battle
    currentBattle = {
      battleNumber,
      prompt,
      trackA: { ...trackA, ...trackAData, votes: 0 },
      trackB: { ...trackB, ...trackBData, votes: 0 },
      startTime: Date.now(),
      isRevealed: false,
    };

    // Broadcast battle start
    broadcast({
      type: 'battle_start',
      battleNumber,
      prompt,
    });

    // 5. Countdown (60 seconds)
    log('Starting countdown...', 'INFO');
    for (let time = CONFIG.COUNTDOWN_TIME; time >= 0; time--) {
      broadcast({
        type: 'countdown',
        time,
      });

      // Simulate some votes during countdown
      if (time % 10 === 0 && time > 0) {
        simulateVote();
      }

      await sleep(1000);
    }

    // 6. Reveal winner (random for now)
    const winner = Math.random() > 0.5 ? trackA : trackB;
    const loser = winner === trackA ? trackB : trackA;

    log(`Winner: ${winner.name}`, 'INFO');

    // Calculate ELO changes
    const eloChanges = calculateELO(winner.elo, loser.elo);
    winner.elo = eloChanges.winner;
    loser.elo = eloChanges.loser;

    log(`ELO Change: ${winner.name} +${eloChanges.change}, ${loser.name} ${eloChanges.change}`, 'INFO');

    currentBattle.isRevealed = true;
    currentBattle.winner = winner.name;

    // Broadcast reveal
    broadcast({
      type: 'reveal',
      trackAName: trackA.name,
      trackBName: trackB.name,
      winner: winner.name,
      eloGain: eloChanges.change,
    });

    // 7. Update stats
    broadcast({
      type: 'stats',
      totalBattles: `${(24700 + battleNumber).toLocaleString()}`,
      liveViewers: `${Math.floor(Math.random() * 2000) + 500}`,
      prizePool: `$${Math.floor(Math.random() * 100000) + 800000}`,
    });

    log(`Battle #${battleNumber} completed`, 'INFO');

    // 8. Sleep before next battle
    log(`Sleeping for ${CONFIG.SLEEP_BETWEEN_BATTLES} seconds...`, 'INFO');
    await sleep(CONFIG.SLEEP_BETWEEN_BATTLES * 1000);
  } catch (error) {
    log(`Battle failed: ${error.message}`, 'ERROR');
    log(error.stack, 'ERROR');

    // Wait a bit before retrying
    await sleep(10000);
  }
}

// Simulate a vote (for demo purposes)
function simulateVote() {
  if (!currentBattle || currentBattle.isRevealed) return;

  const track = Math.random() > 0.5 ? 'Track A' : 'Track B';

  if (track === 'Track A') {
    currentBattle.trackA.votes = (currentBattle.trackA.votes || 0) + 1;
  } else {
    currentBattle.trackB.votes = (currentBattle.trackB.votes || 0) + 1;
  }

  broadcast({
    type: 'vote_placed',
    track,
    totalA: currentBattle.trackA.votes || 0,
    totalB: currentBattle.trackB.votes || 0,
  });
}

// Initialize WebSocket server
function initWebSocket() {
  wss = new WebSocket.Server({ port: CONFIG.PORT });

  wss.on('connection', (ws) => {
    clients.add(ws);
    log(`Client connected (Total: ${clients.size})`, 'INFO');

    // Send current battle state to new client
    if (currentBattle) {
      ws.send(
        JSON.stringify({
          type: 'battle_start',
          battleNumber: currentBattle.battleNumber,
          prompt: currentBattle.prompt,
        })
      );
    }

    ws.on('close', () => {
      clients.delete(ws);
      log(`Client disconnected (Total: ${clients.size})`, 'INFO');
    });

    ws.on('error', (error) => {
      log(`WebSocket error: ${error.message}`, 'ERROR');
      clients.delete(ws);
    });
  });

  log(`WebSocket server started on port ${CONFIG.PORT}`, 'INFO');
}

// Graceful shutdown
function shutdown() {
  log('Shutting down battle bot...', 'INFO');
  isRunning = false;

  // Close all WebSocket connections
  clients.forEach((client) => {
    client.close();
  });

  wss.close(() => {
    log('WebSocket server closed', 'INFO');
    process.exit(0);
  });
}

// Main entry point
async function main() {
  log('='.repeat(60), 'INFO');
  log('TUNE ARENA AUTOMATED BATTLE BOT', 'INFO');
  log('='.repeat(60), 'INFO');
  log(`Version: 1.0.0`, 'INFO');
  log(`Port: ${CONFIG.PORT}`, 'INFO');
  log(`Countdown: ${CONFIG.COUNTDOWN_TIME}s`, 'INFO');
  log(`Sleep Between Battles: ${CONFIG.SLEEP_BETWEEN_BATTLES}s`, 'INFO');
  log('='.repeat(60), 'INFO');

  // Initialize WebSocket server
  initWebSocket();

  // Handle signals
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Run battle loop
  isRunning = true;
  while (isRunning) {
    try {
      await runBattle();
    } catch (error) {
      log(`Fatal error: ${error.message}`, 'ERROR');
      log(error.stack, 'ERROR');
      await sleep(10000); // Wait 10s before retry
    }
  }
}

// Start the bot
if (require.main === module) {
  main().catch((error) => {
    log(`Failed to start bot: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = { main, log, broadcast };
