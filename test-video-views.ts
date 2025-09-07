import { db } from "@/lib/db";
import { trackVideoView, getVideoViewerCount } from "@/lib/db/videoViews";

async function testVideoViews() {
  try {
    // Create a test video if it doesn't exist
    const testVideo = await db.video.findFirst({
      where: {
        title: "Test Video",
      },
    });

    let videoId: string;
    let userId: string;
    
    if (!testVideo) {
      // Create a test user first
      const testUser = await db.user.create({
        data: {
          email: "test@example.com",
          password: "password",
          name: "Test User",
          phone: "1234567890",
        },
      });
      
      userId = testUser.id;

      // Create a test workspace
      const testWorkspace = await db.workspace.create({
        data: {
          name: "Test Workspace",
          userId: testUser.id,
        },
      });

      // Create a test video
      const video = await db.video.create({
        data: {
          title: "Test Video",
          videoUrl: "https://example.com/test-video.mp4",
          userId: testUser.id,
          workspaceId: testWorkspace.id,
        },
      });

      videoId = video.id;
    } else {
      videoId = testVideo.id;
      userId = testVideo.userId;
    }

    // Track some views
    console.log("Tracking view for authenticated user...");
    await trackVideoView(videoId, userId); // Authenticated user
    
    console.log("Tracking view for unauthenticated user...");
    await trackVideoView(videoId, null); // Unauthenticated user
    
    console.log("Tracking duplicate view for unauthenticated user...");
    await trackVideoView(videoId, null); // Should not create duplicate
  
    // Get viewer count
    const viewerCount = await getVideoViewerCount(videoId);
    console.log(`Viewer count: ${viewerCount}`);
    
    console.log("Test completed successfully!");
    
    // Clean up test data (optional)
    // await db.videoView.deleteMany({ where: { videoId } });
    // await db.video.delete({ where: { id: videoId } });
    // await db.workspace.delete({ where: { id: testWorkspace.id } });
    // await db.user.delete({ where: { id: userId } });
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testVideoViews();