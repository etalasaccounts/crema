// Split into server and client components
// This is the server component that receives the params
import VideoPreviewClient from "@/app/preview/[id]/client";

export default function VideoPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <VideoPreviewClient videoId={params.id} />
    </>
  );
}
