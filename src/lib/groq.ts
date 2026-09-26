import Groq from "groq-sdk";

// Модель выбирается из списка, доступного ключу GROQ_API_KEY
// (GET https://api.groq.com/openai/v1/models). llama-3.3-70b-versatile
// для этого аккаунта недоступен (404 model_not_found); gpt-oss-20b — есть.
const GROQ_MODEL = "openai/gpt-oss-20b";

export interface LectureContextSegment {
  time: string;
  text: string;
}

export async function askGroqAboutLecture(
  title: string,
  context: LectureContextSegment[],
  question: string,
): Promise<{ answer: string; timestampRef?: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const transcriptContext = context
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

Транскрипция лекции "${title}":
${transcriptContext}`;

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) return null;

    const timestampMatch = answer.match(/\[(\d{2}:\d{2})\]/);
    return {
      answer,
      timestampRef: timestampMatch ? timestampMatch[1] : undefined,
    };
  } catch (error) {
    console.error("Groq API error:", error);
    return null;
  }
}