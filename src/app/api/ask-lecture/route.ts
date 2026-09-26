import { NextRequest, NextResponse } from "next/server";
import { getLectureById } from "@/lib/mock-hemis";
import { askGroqAboutLecture } from "@/lib/groq";

interface TranscriptSegment {
  time: string;
  text: string;
}

interface LectureLike {
  id: string;
  title: string;
  transcript: TranscriptSegment[];
  summary: string[];
}

function isSegment(value: unknown): value is TranscriptSegment {
  if (!value || typeof value !== "object") return false;
  const seg = value as TranscriptSegment;
  return typeof seg.text === "string" && typeof seg.time === "string";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Неверный JSON в теле запроса" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Тело запроса должно быть объектом" },
      { status: 400 },
    );
  }

  const { question, lectureId, title, context } = body as {
    question?: unknown;
    lectureId?: unknown;
    title?: unknown;
    context?: unknown;
  };

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json(
      { error: "Параметр question обязателен и должен быть непустой строкой" },
      { status: 400 },
    );
  }

  let lecture: LectureLike | null = null;

  if (typeof lectureId === "string" && lectureId.trim()) {
    const mockLecture = getLectureById(lectureId);
    if (!mockLecture) {
      return NextResponse.json(
        { error: "Лекция не найдена" },
        { status: 404 },
      );
    }
    lecture = mockLecture;
  } else if (Array.isArray(context) && typeof title === "string" && title.trim()) {
    const transcript = context.filter(isSegment);
    if (transcript.length === 0) {
      return NextResponse.json(
        { error: "Передан пустой контекст лекции" },
        { status: 400 },
      );
    }
    lecture = {
      id: typeof lectureId === "string" ? lectureId : "live",
      title,
      transcript,
      summary: [],
    };
  } else {
    return NextResponse.json(
      { error: "Укажите lectureId или title+context" },
      { status: 400 },
    );
  }

  try {
    const { answer, timestampRef } = await askGroqAboutLecture(lecture, question.trim());
    return NextResponse.json({ answer, timestampRef });
  } catch (error) {
    console.error("Groq API error:", error);
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json(
      { error: `Ошибка AI: ${message}` },
      { status: 500 },
    );
  }
}