# Tracks Folder

Place your real Suno AI MP3 files here:

- 1.mp3
- 2.mp3
- 3.mp3
- 4.mp3
- 5.mp3
- 6.mp3
- 7.mp3
- 8.mp3
- 9.mp3
- 10.mp3
- 11.mp3
- 12.mp3

The tracks are automatically loaded from `/public/tracks.json` which references these files.

## File Requirements

- Format: MP3
- Naming: Must match the filenames in tracks.json (1.mp3 through 12.mp3)
- Location: This folder (/public/tracks/)

## How It Works

1. Copy your MP3 files to this folder
2. The app loads track metadata from `/public/tracks.json`
3. Each track references a file like `/tracks/1.mp3`
4. The audio player will play these files directly

## Testing

After adding your files:

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Check browser console for any loading errors
4. Play tracks to verify they work

## Troubleshooting

**Track won't play:**
- Check filename matches exactly (case-sensitive)
- Verify file is valid MP3
- Check browser console for 404 errors

**No sound:**
- Check audio file isn't corrupted
- Try playing file directly by visiting http://localhost:3000/tracks/1.mp3
- Check browser audio settings
