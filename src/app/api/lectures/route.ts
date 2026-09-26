import { NextResponse } from "next/server";
import { LECTURES, getLecturesByCourse } from "@/lib/mock-hemis";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  if (courseId) {
    const lectures = getLecturesByCourse(courseId);
    return NextResponse.json({ lectures });
  }

  return NextResponse.json({ lectures: LECTURES });
}