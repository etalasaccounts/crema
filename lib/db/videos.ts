import { db } from "@/lib/db";

export async function getVideos(userId: string) {
  return db.video.findMany({
    where: {
      userId: userId,
    },
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

export async function updateVideoTitle(id: string, title: string) {
  return db.video.update({
    where: {
      id,
    },
    data: {
      title,
    },
  });
}

export async function getVideoWithComments(id: string) {
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
      comments: {
        where: {
          parentId: null, // Only top-level comments
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc", // Replies ordered oldest first
            },
          },
        },
      },
    },
  });
}
