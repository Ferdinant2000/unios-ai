import { NextRequest, NextResponse } from "next/server";
import { getLectureById } from "@/lib/mock-hemis";
import { askGroqAboutLecture } from "@/lib/groq";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  const lectureId =
    typeof body?.lectureId === "string" ? body.lectureId.trim() : "";

  if (!question || !lectureId) {
    return NextResponse.json(
      { fallback: true, error: "Missing 'question' or 'lectureId'." },
      { status: 400 },
    );
  }

  const lecture = getLectureById(lectureId);
  if (!lecture) {
    return NextResponse.json(
      { fallback: true, error: "Lecture not found." },
      { status: 404 },
    );
  }

  const result = await askGroqAboutLecture(lecture, question);
  if (!result) {
    // AI недоступен (GROQ_API_KEY не задан / ошибка API) → клиентский чат
    // автоматически переключится на локальный мок buildLectureAnswer.
    return NextResponse.json(
      { fallback: true, error: "Groq AI unavailable." },
      { status: 200 },
    );
  }

  return NextResponse.json({
    answer: result.answer,
    timestampRef: result.timestampRef,
  });
}