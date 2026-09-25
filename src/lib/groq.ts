import Groq from "groq-sdk";
import type { Lecture } from "@/types";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return new Groq({ apiKey });
}

export async function askGroqAboutLecture(
  lecture: Lecture,
  question: string,
): Promise<{ answer: string; timestampRef?: string }> {
  const groq = getGroqClient();
  const transcriptContext = lecture.transcript
    .map((seg) => `[${seg.time}] ${seg.text}`)
    .join("\n\n");

  const systemPrompt = `Ты — экспертный AI-тьютор для университета, специализирующийся на помощи студентам в освоении учебного материала.

ТВОЯ РОЛЬ:
- Объясняй сложные концепции простым языком, используя аналогии и примеры
- Помогай студентам связывать новые знания с уже известными
- Задавай наводящие вопросы для развития критического мышления
- Структурируй ответы: определение → суть → пример → применение
- Адаптируй сложность под уровень студента (по умолчанию — бакалавриат)

ПРАВИЛА:
1. Основывайся на транскрипции лекции, но можешь дополнять знаниями из предметной области
2. Если вопрос выходит за рамки лекции — честно укажи это, но всё равно дай полезный ответ
3. ОБЯЗАТЕЛЬНО указывай таймкод [MM:SS] из транскрипции, если ответ основан на лекции
4. Тон: поддерживающий, академичный, но доступный

ФОРМАТ ОТВЕТА:
[MM:SS] Краткий прямой ответ (если есть в лекции) или "Вне лекции:" + ответ
💡 Развёрнутое объяснение с примером/аналогией
🔗 Связь с другими темами лекции (если есть)
❓ Наводящий вопрос для самопроверки

Транскрипция лекции "${lecture.title}":
${transcriptContext}

Краткий конспект:
${lecture.summary.join("\n")}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const answer = completion.choices[0]?.message?.content ?? "Не удалось получить ответ от AI.";

    const timestampMatch = answer.match(/\[(\d{2}:\d{2})\]/);
    const timestampRef = timestampMatch ? timestampMatch[1] : undefined;

    return { answer, timestampRef };
  } catch (error) {
    console.error("Groq API error:", error);
    return {
      answer: "Произошла ошибка при обращении к AI. Попробуйте позже.",
      timestampRef: undefined,
    };
  }
}