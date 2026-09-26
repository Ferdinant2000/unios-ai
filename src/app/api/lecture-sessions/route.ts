import { NextRequest, NextResponse } from "next/server";

interface Student {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
}

interface LectureSession {
  sessionId: string;
  lectureId: string;
  professorId: string;
  startTime: string;
  endTime?: string;
  status: "scheduled" | "live" | "ended";
  activeStudents: Student[];
  questions: number;
  engagement: number;
}

const SESSION_STORE = new Map<string, LectureSession>();

// Demo student data
const DEMO_STUDENTS: Record<string, { name: string; avatar: string }> = {
  "student-1": { name: "Ahmed Karimov", avatar: "AK" },
  "student-2": { name: "Malika Yusupova", avatar: "MY" },
  "student-3": { name: "Jasur Rahimov", avatar: "JR" },
  "student-4": { name: "Dilnoza Karimova", avatar: "DK" },
  "student-5": { name: "Bekzod Alimov", avatar: "BA" },
  "student-6": { name: "Shahnoza Toshpulatova", avatar: "ST" },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = SESSION_STORE.get(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, lectureId, professorId, studentId, sessionId } = body as {
    action: "start" | "end" | "join" | "leave" | "question" | "get_students";
    lectureId?: string;
    professorId?: string;
    studentId?: string;
    sessionId?: string;
  };

  switch (action) {
    case "start": {
      if (!lectureId || !professorId) {
        return NextResponse.json(
          { error: "lectureId and professorId required" },
          { status: 400 }
        );
      }

      const newSessionId = `session-${Date.now()}`;
      const session: LectureSession = {
        sessionId: newSessionId,
        lectureId,
        professorId,
        startTime: new Date().toISOString(),
        status: "live",
        activeStudents: [],
        questions: 0,
        engagement: 100,
      };

      SESSION_STORE.set(newSessionId, session);
      return NextResponse.json({ session });
    }

    case "end": {
      if (!sessionId) {
        return NextResponse.json(
          { error: "sessionId required" },
          { status: 400 }
        );
      }

      const session = SESSION_STORE.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      session.status = "ended";
      session.endTime = new Date().toISOString();
      SESSION_STORE.set(sessionId, session);
      return NextResponse.json({ session });
    }

    case "join": {
      if (!sessionId || !studentId) {
        return NextResponse.json(
          { error: "sessionId and studentId required" },
          { status: 400 }
        );
      }

      const session = SESSION_STORE.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const existingIndex = session.activeStudents.findIndex(s => s.id === studentId);
      if (existingIndex === -1) {
        const studentInfo = DEMO_STUDENTS[studentId] || { name: "Unknown Student", avatar: "US" };
        session.activeStudents.push({
          id: studentId,
          name: studentInfo.name,
          avatar: studentInfo.avatar,
          joinedAt: new Date().toISOString(),
        });
        session.engagement = Math.min(100, session.engagement + 5);
      }

      SESSION_STORE.set(sessionId, session);
      return NextResponse.json({ session });
    }

    case "leave": {
      if (!sessionId || !studentId) {
        return NextResponse.json(
          { error: "sessionId and studentId required" },
          { status: 400 }
        );
      }

      const session = SESSION_STORE.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      session.activeStudents = session.activeStudents.filter((s) => s.id !== studentId);
      session.engagement = Math.max(0, session.engagement - 5);
      SESSION_STORE.set(sessionId, session);
      return NextResponse.json({ session });
    }

    case "question": {
      if (!sessionId) {
        return NextResponse.json(
          { error: "sessionId required" },
          { status: 400 }
        );
      }

      const session = SESSION_STORE.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      session.questions += 1;
      SESSION_STORE.set(sessionId, session);
      return NextResponse.json({ session });
    }

    case "get_students": {
      if (!sessionId) {
        return NextResponse.json(
          { error: "sessionId required" },
          { status: 400 }
        );
      }

      const session = SESSION_STORE.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      return NextResponse.json({ students: session.activeStudents });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}