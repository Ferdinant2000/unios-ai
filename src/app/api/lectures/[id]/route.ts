import { NextResponse } from "next/server";
import { getLectureById } from "@/lib/mock-hemis";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const lecture = getLectureById(id);

  if (!lecture) {
    return NextResponse.json(
      { error: "Lecture not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ lecture });
}