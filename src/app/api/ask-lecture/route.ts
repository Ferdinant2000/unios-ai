import { NextRequest, NextResponse } from "next/server";
import { getLectureById } from "@/lib/mock-hemis";
import { askGroqAboutLecture } from "@/lib/groq";

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

  const { question, lectureId } = body as { question?: unknown; lectureId?: unknown };

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json(
      { error: "Параметр question обязателен и должен быть непустой строкой" },
      { status: 400 },
    );
  }

  if (typeof lectureId !== "string" || !lectureId.trim()) {
    return NextResponse.json(
      { error: "Параметр lectureId обязателен и должен быть непустой строкой" },
      { status: 400 },
    );
  }

  const lecture = getLectureById(lectureId);
  if (!lecture) {
    return NextResponse.json(
      { error: "Лекция не найдена" },
      { status: 404 },
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