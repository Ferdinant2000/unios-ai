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
      { error: "Параметры question и lectureId обязательны." },
      { status: 400 },
    );
  }

  const lecture = getLectureById(lectureId);
  if (!lecture) {
    return NextResponse.json(
      { error: "Лекция не найдена." },
      { status: 404 },
    );
  }

  const { answer, timestampRef } = await askGroqAboutLecture(lecture, question);

  return NextResponse.json({ answer, timestampRef });
}