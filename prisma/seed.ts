/**
 * Prisma seed script
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create AI models
  const models = [
    { name: 'Suno', elo: 1542 },
    { name: 'Udio', elo: 1489 },
    { name: 'Stable Audio', elo: 1435 },
    { name: 'ElevenLabs Music', elo: 1398 },
    { name: 'MusicGen', elo: 1356 },
    { name: 'AudioCraft', elo: 1312 },
    { name: 'Mubert', elo: 1278 },
    { name: 'Soundraw', elo: 1245 },
  ];

  for (const modelData of models) {
    const model = await prisma.aIModel.upsert({
      where: { name: modelData.name },
      update: {},
      create: modelData,
    });
    console.log(`✅ Created model: ${model.name}`);
  }

  // Initialize global stats
  await prisma.globalStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      totalBattles: 0,
      tuneBurned: BigInt(0),
      totalVolume: BigInt(0),
    },
  });
  console.log('✅ Initialized global stats');

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
