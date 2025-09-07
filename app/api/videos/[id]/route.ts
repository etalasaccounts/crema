import { getVideo, deleteVideo } from "@/lib/db/videos";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const video = await getVideo(params.id);
    return NextResponse.json({ success: true, video });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get video" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteVideo(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
