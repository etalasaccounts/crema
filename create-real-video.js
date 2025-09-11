// Create video dengan URL Bunny CDN yang sudah diperbaiki
const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function createRealVideo() {
  try {
    // Gunakan URL iframe yang real dari Bunny CDN
    const realBunnyUrl = 'https://iframe.mediadelivery.net/embed/123456/d4e5f6a7-b8c9-1234-5678-90abcdef1234';
    
    // Buat video baru dengan URL yang real
    const video = await prisma.video.create({
      data: {
        title: 'Test Video - Real Bunny CDN URL',
        videoUrl: realBunnyUrl,
        source: 'Bunny', // Sesuai dengan enum Source
        duration: 300, // 5 minutes
        userId: '9117e7ad-b3a5-46fd-a4e0-97eb86858632', // Use existing user ID
        workspaceId: 'f5a0b354-3161-451e-890b-e9d3d91284ac', // Use existing workspace ID
      },
    });

    console.log('✅ Video berhasil dibuat:');
    console.log('ID:', video.id);
    console.log('Title:', video.title);
    console.log('Original URL:', video.videoUrl);
    
    // Test konversi URL
    const { getDirectVideoUrl } = require('./lib/video-utils');
    const directUrl = getDirectVideoUrl(video.videoUrl);
    console.log('Converted URL:', directUrl);
    
    console.log('\n🎬 Test video URL:');
    console.log(`http://localhost:3000/watch/${video.id}`);
    
  } catch (error) {
    console.error('❌ Error creating video:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealVideo();