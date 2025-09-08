import { getVideo, deleteVideo, updateVideoTitle } from "@/lib/db/videos";
import { NextResponse } from "next/server";

// Type
import { updateVideoTitleSchema } from "@/lib/validation/video";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { title } = updateVideoTitleSchema.parse(data);
    await updateVideoTitle(id, title);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = await getVideo(id);
    return NextResponse.json({ success: true, video });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get video" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteVideo(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
