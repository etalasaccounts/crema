import { db } from "@/lib/db";

export async function getVideos() {
  return db.video.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          videoViews: true,
        },
      },
    },
  });
}

export async function getVideo(id: string) {
  return db.video.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function deleteVideo(id: string) {
  return db.video.delete({
    where: {
      id,
    },
  });
}
