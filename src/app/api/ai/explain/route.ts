import { NextRequest, NextResponse } from "next/server";
import { getLectureById } from "@/lib/mock-hemis";

interface TranscriptSegment {
  time: string;
  text: string;
}

interface ExplainResponse {
  simpleExplanation: string;
  example: string;
  commonMistake: string;
  analogy: string;
  keyPoints: string[];
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

  const { lectureId, topic } = body as { lectureId?: unknown; topic?: unknown };

  if (typeof lectureId !== "string" || !lectureId.trim()) {
    return NextResponse.json(
      { error: "lectureId is required" },
      { status: 400 }
    );
  }

  if (typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json(
      { error: "topic is required" },
      { status: 400 }
    );
  }

  const lecture = getLectureById(lectureId);
  if (!lecture) {
    return NextResponse.json(
      { error: "Lecture not found" },
      { status: 404 }
    );
  }

  const transcriptContext = (lecture.transcript as TranscriptSegment[])
    .map((seg) => `[${seg.time}] ${seg.text}`)
    .join("\n\n");

  const systemPrompt = `Ты — экспертный преподаватель, объясняющий сложные темы простым языком.
  
Создай объяснение для темы "${topic}" на основе материала лекции.
Формат ответа - ТОЛЬКО JSON:
{
  "simpleExplanation": "Простое объяснение сути темы (2-3 предложения)",
  "example": "Конкретный пример из жизни или практики",
  "commonMistake": "Частая ошибка студентов по этой теме",
  "analogy": "Аналогия для лучшего понимания",
  "keyPoints": ["Ключевой момент 1", "Ключевой момент 2", "Ключевой момент 3"]
}

Транскрипция лекции "${lecture.title}":
${transcriptContext}

Краткий конспект:
${lecture.summary.join("\n")}`;

  try {
    const groq = (await import("groq-sdk")).default;
    const client = new groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Объясни тему: ${topic}` },
      ],
      temperature: 0.3,
      max_tokens: 1536,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    
    let explanation: ExplainResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        explanation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON object found");
      }
    } catch {
      explanation = generateFallbackExplanation(topic, lecture);
    }

    return NextResponse.json(explanation);
  } catch (error) {
    console.error("Explain generation error:", error);
    const fallbackExplanation = generateFallbackExplanation(topic, lecture);
    return NextResponse.json(fallbackExplanation);
  }
}

function generateFallbackExplanation(topic: string, lecture: { id: string; title: string }): ExplainResponse {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes("cross-price") || lowerTopic.includes("перекрёстн") || lowerTopic.includes("cross price")) {
    return {
      simpleExplanation: "Перекрестная эластичность показывает, как изменение цены одного товара влияет на спрос на другой товар. Положительное значение — товары-заменители (субституты), отрицательное — товары-дополнения (комплементы).",
      example: "Если цена на кофе вырастет, спрос на чай (заменитель) увеличится — cross-price elasticity > 0. Если цена на принтеры упадёт, спрос на картриджи (дополнение) вырастет — cross-price elasticity < 0.",
      commonMistake: "Студенты часто путают знак: думают, что положительное значение означает комплементы. Запоминай: субституты — плюс (конкуренты), комплементы — минус (друзья).",
      analogy: "Как две команды в спорте: если одна усилилась (цена выросла), болельщики могут перейти к другой — это субституты. А как ботинки и шнурки: дешевеют ботинки — больше покупают шнурки — это комплементы.",
      keyPoints: [
        "E_xy > 0 → субституты (заменители)",
        "E_xy < 0 → комплементы (дополнения)",
        "E_xy = 0 → независимые товары",
        "Формула: E_xy = %ΔQ_x / %ΔP_y"
      ]
    };
  }

  if (lowerTopic.includes("gradient") || lowerTopic.includes("затухан") || lowerTopic.includes("vanishing")) {
    return {
      simpleExplanation: "Проблема затухания градиента возникает в глубоких сетях при использовании функций активации вроде Sigmoid: градиенты становятся настолько малыми, что веса в первых слоях практически не обновляются.",
      example: "Представь 100-слойную сеть с Sigmoid. Градиент на 1-м слое — это произведение 100 малых чисел (<1). Результат стремится к нулю — сеть перестаёт учиться на ранних слоях.",
      commonMistake: "Думают, что проблема только в Sigmoid. Tanh тоже страдает, хотя и в меньшей степени. ReLU решает это для положительных значений, но имеет проблему 'мёртвых нейронов'.",
      analogy: "Как игра в 'испорченный телефон': сообщение передаётся через 100 человек. Каждый немного искажает, и в конце получается бессмыслица. ReLU — это когда люди просто повторят то, что услышали (если это положительно) или промолчат (если отрицательно).",
      keyPoints: [
        "Sigmoid/Tanh сжимают градиенты в (0,1)",
        "Произведение множества <1 → 0",
        "ReLU: градиент = 1 для x > 0",
        "Решения: ReLU, BatchNorm, Residual connections, LSTM/GRU"
      ]
    };
  }

  if (lowerTopic.includes("batch") && lowerTopic.includes("size")) {
    return {
      simpleExplanation: "Batch size — это количество обучающих примеров, которые сеть обрабатывает перед обновлением весов. Малый батч — шумные, но частые обновления. Большой батч — стабильные, но редкие обновления и больше памяти.",
      example: "При batch_size=32 сеть обновляет веса после каждого 32 примеров. При batch_size=1 (SGD) — после каждого примера (очень шумно). При batch_size=всё_датасет — один шаг на эпоху (как градиентный спуск).",
      commonMistake: "Считают, что чем больше батч, тем лучше. На самом деле слишком большие батчи ухудшают обобщающую способность (generalization gap) и требуют больше памяти GPU.",
      analogy: "Как учитель проверяет домашние задания: можно проверять по одному (быстро реагирует на ошибки, но тратит много времени) или собирать все сразу (экономит время, но пропускает индивидуальные проблемы). Оптимально — небольшие группы.",
      keyPoints: [
        "Малый батч: больше шума, лучше generalization, меньше памяти",
        "Большой батч: стабильнее, быстрее на GPU, хуже generalization",
        "Типичные значения: 32, 64, 128, 256",
        "Learning rate часто масштабируют пропорционально batch size"
      ]
    };
  }

  if (lowerTopic.includes("elasticity") || lowerTopic.includes("эластичност")) {
    return {
      simpleExplanation: "Эластичность спроса измеряет, насколько чувствителен спрос к изменению цены. Формула: E = %ΔQ / %ΔP. Если |E| > 1 — спрос эластичный (чувствителен), если |E| < 1 — неэластичный.",
      example: "Лекарства от диабета: цена выросла на 10%, спрос упал на 2% → E = 0.2 (неэластичный, люди купят в любом случае). Рестораны: цена выросла на 10%, посещаемость упала на 15% → E = 1.5 (эластичный, можно пойти готовить дома).",
      commonMistake: "Забывают модуль при интерпретации. E = -1.5 тоже значит эластичный спрос (знак просто показывает обратную связь цены и спроса).",
      analogy: "Резина: тянешь слабо (цена) — сильно растягивается (спрос) = эластичный. Тянешь канат: тянешь сильно — почти не растягивается = неэластичный.",
      keyPoints: [
        "E = %ΔQ / %ΔP",
        "|E| > 1 — эластичный спрос",
        "|E| < 1 — неэластичный спрос",
        "|E| = 1 — единичная эластичность",
        "Доход = P × Q: при эластичном спросе повышение цены снижает доход"
      ]
    };
  }

  interface LectureType {
  id: string;
  title: string;
  transcript: TranscriptSegment[];
  summary: string[];
}

// Generic fallback
  const typedLecture = lecture as LectureType;
  return {
    simpleExplanation: `Тема "${topic}" из лекции "${typedLecture.title}" касается ключевых концепций данного курса. Это фундаментальная идея, которая связывает несколько тем лекции.`,
    example: `Например, в контексте лекции "${typedLecture.title}" это проявляется через практические кейсы, разобранные преподавателем.`,
    commonMistake: "Часто студенты заучивают определение, но не понимают сути механизма. Попробуй объяснить своими словами, не глядя в конспект.",
    analogy: "Представь это как строительные блоки: каждый новый концепт опирается на предыдущие, как этажи здания.",
    keyPoints: [
      `Основная идея: ${typedLecture.summary[0] ?? topic}`,
      `Связано с: ${typedLecture.summary[1] ?? "другими темами лекции"}`,
      "Практика: решай задачи по этой теме для закрепления"
    ]
  };
}