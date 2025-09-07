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
  };
  workspace: {
    id: string;
    name: string;
  };
  _count?: {
    videoViews: number;
  };
}
