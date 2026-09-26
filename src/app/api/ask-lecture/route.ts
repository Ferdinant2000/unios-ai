import { NextRequest, NextResponse } from "next/server";
import {
  askGroqAboutLecture,
  type LectureContextSegment,
} from "@/lib/groq";

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    console.error("[ask-lecture] GROQ_API_KEY is not configured on the server");
    return NextResponse.json(
      { fallback: true, error: "GROQ_API_KEY is not configured on the server" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);

  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  const context: LectureContextSegment[] = Array.isArray(body?.context)
    ? body.context
        .filter(
          (segment: unknown): segment is LectureContextSegment =>
            Boolean(
              segment &&
                typeof (segment as LectureContextSegment).time === "string" &&
                typeof (segment as LectureContextSegment).text === "string",
            ),
        )
        .map((segment: LectureContextSegment) => ({
          time: segment.time,
          text: segment.text,
        }))
    : [];

  if (!question) {
    return NextResponse.json(
      { fallback: true, error: "Missing 'question'." },
      { status: 400 },
    );
  }

  if (!title || context.length === 0) {
    return NextResponse.json(
      { fallback: true, error: "Missing lecture context ('title'/'context')." },
      { status: 400 },
    );
  }

  const result = await askGroqAboutLecture(title, context, question);
  if (!result) {
    // AI недоступен (GROQ_API_KEY не задан / ошибка API) → клиентский чат
    // автоматически переключится на локальный фоллбэк buildSectionAnswer.
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