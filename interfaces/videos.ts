export interface VideoComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  videoId: string;
  parentId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  replies?: VideoComment[];
}

export interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  workspace: {
    id: string;
    name: string;
  };
  _count?: {
    videoViews: number;
  };
  comments?: VideoComment[];
}
