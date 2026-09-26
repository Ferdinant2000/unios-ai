import { NextRequest, NextResponse } from "next/server";

interface LiveAnalytics {
  activeStudents: number;
  engagement: number;
  questions: number;
  confusedTopics: { topic: string; percentage: number }[];
  comprehensionRate: number;
  energyLevel: number;
}

const SESSION_STORE = new Map<string, LiveAnalytics>();

function getSession(courseId: string): LiveAnalytics {
  if (!SESSION_STORE.has(courseId)) {
    SESSION_STORE.set(courseId, {
      activeStudents: 0,
      engagement: 0,
      questions: 0,
      confusedTopics: [
        { topic: "Cross-price elasticity", percentage: 72 },
        { topic: "Vanishing gradient", percentage: 41 },
        { topic: "Batch size", percentage: 28 },
      ],
      comprehensionRate: 92,
      energyLevel: 78,
    });
  }
  return SESSION_STORE.get(courseId)!;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId") ?? "c1";
  
  const session = getSession(courseId);
  
  return NextResponse.json({ analytics: session });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 }
    );
  }

  const { courseId, action, studentId, topic } = body as { 
    courseId?: string; 
    action: "join" | "leave" | "question" | "quiz_answer" | "topic_confused";
    studentId?: string;
    topic?: string;
  };

  const cid = courseId ?? "c1";
  const session = getSession(cid);

  switch (action) {
    case "join":
      session.activeStudents += 1;
      session.engagement = Math.min(100, session.engagement + 2);
      break;
    case "leave":
      session.activeStudents = Math.max(0, session.activeStudents - 1);
      break;
    case "question":
      session.questions += 1;
      session.engagement = Math.min(100, session.engagement + 1);
      break;
    case "quiz_answer":
      session.engagement = Math.min(100, session.engagement + 3);
      if (session.comprehensionRate < 95) {
        session.comprehensionRate += 1;
      }
      break;
    case "topic_confused":
      if (topic) {
        const existing = session.confusedTopics.find(t => t.topic === topic);
        if (existing) {
          existing.percentage = Math.min(100, existing.percentage + 5);
        } else {
          session.confusedTopics.push({ topic, percentage: 30 });
        }
        session.confusedTopics.sort((a, b) => b.percentage - a.percentage);
        if (session.confusedTopics.length > 5) {
          session.confusedTopics.pop();
        }
        session.comprehensionRate = Math.max(60, session.comprehensionRate - 2);
      }
      break;
  }

  SESSION_STORE.set(cid, session);
  
  return NextResponse.json({ analytics: session });
}