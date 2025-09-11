// Get existing user and workspace data
const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function getExistingData() {
  try {
    // Get existing video to use its user and workspace IDs
    const existingVideo = await prisma.video.findFirst({
      select: {
        userId: true,
        workspaceId: true,
        id: true,
        title: true
      }
    });
    
    if (existingVideo) {
      console.log('✅ Found existing video:');
      console.log('Video ID:', existingVideo.id);
      console.log('User ID:', existingVideo.userId);
      console.log('Workspace ID:', existingVideo.workspaceId);
      console.log('Title:', existingVideo.title);
    } else {
      console.log('❌ No existing videos found');
      
      // Get any user and workspace
      const user = await prisma.user.findFirst();
      const workspace = await prisma.workspace.findFirst();
      
      if (user && workspace) {
        console.log('✅ Found user and workspace:');
        console.log('User ID:', user.id);
        console.log('Workspace ID:', workspace.id);
      } else {
        console.log('❌ No users or workspaces found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getExistingData();