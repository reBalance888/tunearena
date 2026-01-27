# 🎵 TUNE ARENA

**AI Music Battle Royale + Crypto Betting**

## 🎯 Concept

LMArena but for music. Bet on AI-generated tracks, guess the winner, earn $TUNE tokens.

### How It Works

1. **Listen** - Two anonymous AI tracks battle (Track A vs Track B)
2. **Bet** - Wager $TUNE tokens on your favorite
3. **Reveal** - After 60 seconds, see which AI model made which track
4. **Win** - Correct guess = profit, wrong guess = loss
5. **ELO** - Both AI models update their ratings

### AI Models in Battle

- 🎵 Suno
- 🎵 Udio
- 🎵 Stable Audio
- 🎵 ElevenLabs Music
- 🎵 MusicGen

## 💰 Tokenomics

**$TUNE Token** (Solana / pump.fun)

- 10% betting fee distribution:
  - 50% → Buyback + Burn (deflation)
  - 50% → API costs (AI track generation)
- Creator fee from pump.fun automatically
- ✅ Already launched

## 🚀 MVP Features

- ✅ Dark gaming UI with neon accents
- ✅ Two audio players with waveform visualization
- ✅ Countdown timer (60 seconds)
- ✅ Bet buttons (3 amounts: 10, 50, 100 $TUNE)
- ✅ Phantom wallet connect (UI only for MVP)
- ✅ AI model reveal after countdown
- ✅ Responsive design
- ✅ Mock stats dashboard

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Blockchain:** Solana (Mainnet)
- **Wallet:** Phantom (@solana/wallet-adapter)
- **Icons:** Lucide React
- **Deployment:** Vercel

## 🎨 Design System

### Colors

- **Background:** `#000000` (Black)
- **Primary:** `#FF6B35` (Orange)
- **Secondary:** `#00D9FF` (Cyan)
- **Accent:** `#B24BF3` (Purple)
- **Text:** `#FFFFFF` (White)

### Aesthetic

- Dark, aggressive gaming style
- Neon glow effects
- Bold typography
- Minimalistic but energetic
- Esports-inspired

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Auto-deploy on push
4. Get live URL

### Manual Deploy

```bash
npm run build
npm start
```

## 📁 Project Structure

```
tune-arena/
├── app/
│   ├── layout.tsx       # Root layout with wallet provider
│   ├── page.tsx         # Main battle page
│   └── globals.css      # Global styles + animations
├── components/
│   ├── BattleArena.tsx  # Main battle component
│   ├── AudioPlayer.tsx  # Audio player with controls
│   ├── BetButton.tsx    # Betting button
│   ├── WalletConnect.tsx # Phantom wallet UI
│   └── WalletProvider.tsx # Solana wallet context
├── public/              # Static assets
└── package.json
```

## 🎮 MVP Status

**Current Phase:** Demo/Prototype

### ✅ Implemented

- Full UI/UX design
- Audio playback
- Wallet connect interface
- Countdown timer
- Responsive layout
- Mock statistics

### 🚧 Coming Soon

- Real AI track generation (Suno/Udio/etc API)
- Smart contract betting (Solana program)
- $TUNE token integration
- Real-time ELO updates
- User profiles & leaderboards
- Battle history
- Sound effects

## 🔗 Links

- **Token:** [pump.fun/$TUNE](https://pump.fun) (replace with real link)
- **Twitter:** [@TuneArena](https://twitter.com/TuneArena) (replace)
- **Telegram:** [t.me/TuneArena](https://t.me/TuneArena) (replace)

## 📄 License

MIT

## 🤝 Contributing

MVP stage - not accepting contributions yet.

---

**Built with AI · Powered by Solana · $TUNE to the moon 🚀**
