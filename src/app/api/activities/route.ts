import { NextRequest, NextResponse } from "next/server";

interface Activity {
  id: string;
  userId: string;
  courseId?: string;
  lectureId?: string;
  type: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const ACTIVITY_STORE: Activity[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");
  const lectureId = searchParams.get("lectureId");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  let activities = [...ACTIVITY_STORE].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (userId) {
    activities = activities.filter((a) => a.userId === userId);
  }
  if (courseId) {
    activities = activities.filter((a) => a.courseId === courseId);
  }
  if (lectureId) {
    activities = activities.filter((a) => a.lectureId === lectureId);
  }
  if (type) {
    activities = activities.filter((a) => a.type === type);
  }

  return NextResponse.json({ activities: activities.slice(0, limit) });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, courseId, lectureId, type, metadata } = body as {
    userId: string;
    courseId?: string;
    lectureId?: string;
    type: string;
    metadata?: Record<string, unknown>;
  };

  if (!userId || !type) {
    return NextResponse.json(
      { error: "userId and type are required" },
      { status: 400 }
    );
  }

  const activity: Activity = {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    courseId,
    lectureId,
    type,
    timestamp: new Date().toISOString(),
    metadata,
  };

  ACTIVITY_STORE.unshift(activity);

  if (ACTIVITY_STORE.length > 10000) {
    ACTIVITY_STORE.pop();
  }

  return NextResponse.json({ activity });
}