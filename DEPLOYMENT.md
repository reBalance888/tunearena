# 🚀 Deployment Guide - Tune Arena MVP

## Quick Deploy to Vercel (5 minutes)

### 1️⃣ Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "🎵 Initial Tune Arena MVP"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/tune-arena.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your `tune-arena` repository
5. Click "Deploy" (no configuration needed)
6. Get your live URL: `https://tune-arena.vercel.app`

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### 3️⃣ Post-Deployment

Your MVP is now live! ✅

**Share:**
- Screenshot the battle page
- Post on Twitter: "🎵 TUNE ARENA is LIVE! Bet on AI music battles. $TUNE launching soon 🚀"
- Share in Telegram
- Update links in README.md

---

## Alternative: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=.next
```

---

## Alternative: Deploy to GitHub Pages

**Note:** GitHub Pages doesn't support Next.js API routes, so this is limited.

```bash
# Add to next.config.js
output: 'export',
images: { unoptimized: true }

# Build
npm run build

# Deploy out/ folder to gh-pages branch
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open browser
http://localhost:3000
```

---

## Environment Variables (Optional)

No environment variables required for MVP!

Optional (for custom RPC):
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## Post-Launch Checklist

- ✅ MVP deployed
- ✅ Screenshot taken
- ✅ Twitter announcement
- ✅ Telegram announcement
- ✅ URL shared
- ⬜ Real tracks added (Phase 2)
- ⬜ Smart contract integration (Phase 2)
- ⬜ $TUNE token connection (Phase 2)

---

## Troubleshooting

**Build fails on Vercel:**
- Check Node.js version (use 18.x or 20.x)
- Run `npm run build` locally first
- Check build logs for errors

**Wallet not connecting:**
- This is expected in MVP (UI only)
- Real wallet integration in Phase 2

**Audio not playing:**
- Check track URLs in `components/BattleArena.tsx`
- Replace with your own tracks or public URLs

---

## Next Steps (Phase 2)

1. Add real AI-generated tracks (Suno/Udio API)
2. Implement smart contract betting
3. Connect $TUNE token
4. Add user profiles & leaderboards
5. Real-time ELO updates
6. Battle history

---

**Need help?** Open an issue on GitHub

**Built with AI · Deployed in minutes · $TUNE to the moon 🚀**
