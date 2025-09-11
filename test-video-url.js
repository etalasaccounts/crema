// Test script untuk membuat video dengan URL Bunny CDN yang benar
const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function createTestVideo() {
  try {
    // Contoh URL Bunny CDN yang benar berdasarkan dokumentasi
    const testVideoUrl = 'https://iframe.mediadelivery.net/embed/123456/abcd1234-5678-90ef-ghij-klmnopqrstuv';
    
    console.log('Creating test video with URL:', testVideoUrl);
    
    // Buat user dummy jika belum ada
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          active_workspace: 'test-workspace-id'
        }
      });
    }
    
    // Buat workspace dummy jika belum ada
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          id: 'test-workspace-id',
          name: 'Test Workspace',
          ownerId: user.id
        }
      });
    }
    
    // Buat video test
    const video = await prisma.video.create({
      data: {
        title: 'Test Video - Bunny CDN',
        videoUrl: testVideoUrl,
        userId: user.id,
        workspaceId: workspace.id,
        source: 'Bunny',
        duration: 120 // 2 menit
      }
    });
    
    console.log('Test video created:', video);
    console.log('Video ID for testing:', video.id);
    
  } catch (error) {
    console.error('Error creating test video:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestVideo();