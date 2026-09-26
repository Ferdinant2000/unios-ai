import { NextRequest, NextResponse } from "next/server";
import { getLectureById } from "@/lib/mock-hemis";
import { askGroqAboutLecture } from "@/lib/groq";

interface TranscriptSegment {
  time: string;
  text: string;
}

interface LectureType {
  id: string;
  title: string;
  transcript: TranscriptSegment[];
  summary: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
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

  const { lectureId } = body as { lectureId?: unknown };

  if (typeof lectureId !== "string" || !lectureId.trim()) {
    return NextResponse.json(
      { error: "lectureId is required" },
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

  const systemPrompt = `Ты — экспертный AI для генерации учебных квизов.
  
Создай 5 вопросов по материалу лекции. Каждый вопрос должен иметь:
- question: текст вопроса
- options: массив из 4 вариантов ответа
- correctAnswer: индекс правильного ответа (0-3)
- explanation: краткое объяснение почему ответ правильный
- topic: к какой теме лекции относится вопрос

Формат ответа - ТОЛЬКО JSON массив:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "...",
    "topic": "..."
  },
  ...
]

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
        { role: "user", content: "Сгенерируй 5 вопросов для квиза по этой лекции" },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    
    let questions: QuizQuestion[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found");
      }
    } catch {
      // Fallback questions if AI fails
      questions = generateFallbackQuiz(lecture);
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    const fallbackQuestions = generateFallbackQuiz(lecture);
    return NextResponse.json({ questions: fallbackQuestions });
  }
}

function generateFallbackQuiz(lecture: { id: string; title: string; transcript: { time: string; text: string }[] }): QuizQuestion[] {
  const topics = lecture.transcript.map(t => {
    const words = t.text.split(' ').slice(0, 8).join(' ');
    return words;
  });

  if (lecture.id.includes("elasticity")) {
    return [
      {
        question: "Как рассчитывается коэффициент эластичности спроса по цене?",
        options: ["E = %ΔP / %ΔQ", "E = %ΔQ / %ΔP", "E = ΔQ / ΔP", "E = P × Q"],
        correctAnswer: 1,
        explanation: "Эластичность — это отношение процентного изменения количества к процентному изменению цены.",
        topic: "Price elasticity formula"
      },
      {
        question: "Что означает E > 1?",
        options: ["Спрос неэластичен", "Спрос эластичен", "Спрос единично эластичен", "Спрос абсолютно неэластичен"],
        correctAnswer: 1,
        explanation: "Если коэффициент эластичности больше 1, спрос считается эластичным — малые изменения цены вызывают большие изменения спроса.",
        topic: "Elasticity interpretation"
      },
      {
        question: "Cross-price elasticity > 0 указывает на то, что товары:",
        options: ["Комплементы", "Субституты", "Независимы", "Товары роскоши"],
        correctAnswer: 1,
        explanation: "Положительная перекрестная эластичность означает, что товары взаимозаменяемы (субституты).",
        topic: "Cross-price elasticity"
      },
      {
        question: "Income elasticity для товаров первой необходимости:",
        options: ["Высокая (>1)", "Низкая (0<E<1)", "Отрицательная", "Нулевая"],
        correctAnswer: 1,
        explanation: "Товары первой необходимости имеют малую эластичность по доходу (0<E<1).",
        topic: "Income elasticity"
      },
      {
        question: "Что показывает cross-price elasticity?",
        options: ["Реакцию спроса на изменение цены того же товара", "Реакцию спроса на изменение цены другого товара", "Реакцию предложения на изменение цены", "Реакцию дохода на изменение цены"],
        correctAnswer: 1,
        explanation: "Перекрестная эластичность измеряет, как изменение цены одного товара влияет на спрос на другой.",
        topic: "Cross-price elasticity definition"
      }
    ];
  }

  if (lecture.id.includes("neural")) {
    return [
      {
        question: "Почему ReLU предпочтительнее Sigmoid для скрытых слоёв глубоких сетей?",
        options: ["ReLU быстрее вычисляется", "Sigmoid вызывает затухание градиента", "ReLU даёт более точные предсказания", "Sigmoid не работает с батчами"],
        correctAnswer: 1,
        explanation: "Sigmoid сжимает значения в (0,1), и при последовательном перемножении градиентов в глубоких сетях они затухают до нуля. ReLU линейна для положительных значений и не имеет этой проблемы.",
        topic: "Vanishing gradient"
      },
      {
        question: "Что такое переобучение (overfitting)?",
        options: ["Модель слишком простая", "Модель запоминает тренировочные данные вместо обобщения", "Модель не обучается вовсе", "Модель обучается слишком быстро"],
        correctAnswer: 1,
        explanation: "Переобучение — это когда модель идеально работает на тренировочных данных, но плохо обобщается на новые.",
        topic: "Overfitting"
      },
      {
        question: "Какую роль играет learning rate в градиентном спуске?",
        options: ["Определяет размер батча", "Определяет шаг обновления весов", "Определяет число эпох", "Определяет функцию потерь"],
        correctAnswer: 1,
        explanation: "Learning rate — это величина шага, на которую сдвигаются веса в сторону антиградиента.",
        topic: "Gradient descent"
      },
      {
        question: "Как работает dropout?",
        options: ["Удаляет слои из сети", "Случайно отключает нейроны во время обучения", "Уменьшает learning rate", "Добавляет шум к весам"],
        correctAnswer: 1,
        explanation: "Dropout случайно обнуляет выходы нейронов во время обучения, заставляя сеть не полагаться на отдельные нейроны.",
        topic: "Dropout regularization"
      },
      {
        question: "Что такое batch size?",
        options: ["Число эпох обучения", "Количество примеров до обновления весов", "Размер скрытого слоя", "Количество классов"],
        correctAnswer: 1,
        explanation: "Batch size определяет, сколько обучающих примеров сеть обрабатывает перед обновлением весов.",
        topic: "Batch size"
      }
    ];
  }

  if (lecture.id.includes("db") || lecture.id.includes("sql")) {
    return [
      {
        question: "Какая нормальная форма требует атомарности значений?",
        options: ["1НФ", "2НФ", "3НФ", "НФ Бойса-Кодда"],
        correctAnswer: 0,
        explanation: "Первая нормальная форма (1НФ) требует, чтобы все значения атрибутов были атомарными (неделимыми).",
        topic: "1NF"
      },
      {
        question: "Что устраняет вторая нормальная форма?",
        options: ["Транзитивную зависимость", "Частичную зависимость", "Многозначные зависимости", "Избыточность данных"],
        correctAnswer: 1,
        explanation: "2НФ устраняет частичную зависимость неключевых атрибутов от составного ключа.",
        topic: "2NF"
      },
      {
        question: "Какая операция SQL используется для выборки данных?",
        options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
        correctAnswer: 2,
        explanation: "SELECT — основная команда для выборки данных из таблиц.",
        topic: "SQL basics"
      },
      {
        question: "Что такое транзитивная зависимость?",
        options: ["A → B и B → C, значит A → C", "Ключ зависит от неключевого атрибута", "Неключевой атрибут зависит от другого неключевого", "Атрибут зависит от части ключа"],
        correctAnswer: 2,
        explanation: "Транзитивная зависимость — когда неключевой атрибут зависит от другого неключевого атрибута.",
        topic: "3NF"
      },
      {
        question: "Какая НФ устраняет транзитивные зависимости?",
        options: ["1НФ", "2НФ", "3НФ", "4НФ"],
        correctAnswer: 2,
        explanation: "Третья нормальная форма (3НФ) устраняет транзитивные зависимости неключевых атрибутов.",
        topic: "3NF"
      }
    ];
  }

  // Generic fallback
  const typedLecture = lecture as LectureType;
  return [
    {
      question: `Какая главная тема лекции "${typedLecture.title}"?`,
      options: [typedLecture.summary[0] ?? "Тема 1", "Тема 2", "Тема 3", "Тема 4"],
      correctAnswer: 0,
      explanation: typedLecture.summary[0] ?? "Это основная тема лекции.",
      topic: "Main topic"
    },
    {
      question: "Сколько фрагментов в транскрипте этой лекции?",
      options: [String(lecture.transcript.length), String(lecture.transcript.length + 1), String(lecture.transcript.length - 1), "Неизвестно"],
      correctAnswer: 0,
      explanation: `В лекции ${lecture.transcript.length} фрагментов транскрипта.`,
      topic: "Lecture structure"
    },
    {
      question: "Какой временной диапазон охватывает лекция?",
      options: [lecture.transcript[lecture.transcript.length - 1]?.time ?? "00:00", "00:00", "30:00", "60:00"],
      correctAnswer: 0,
      explanation: `Последний фрагмент на ${lecture.transcript[lecture.transcript.length - 1]?.time ?? "00:00"}.`,
      topic: "Time range"
    },
    {
      question: "Что означает AI-конспект?",
      options: ["Автоматическая запись", "Структурированная выжимка ключевых идей", "Полный текст", "Перевод"],
      correctAnswer: 1,
      explanation: "AI-конспект — это структурированная выжимка ключевых идей лекции.",
      topic: "AI Summary"
    },
    {
      question: "Для чего нужен Ask the Lecture?",
      options: ["Для записи звука", "Для задавания вопросов к материалу лекции", "Для оценки", "Для расписания"],
      correctAnswer: 1,
      explanation: "Ask the Lecture позволяет студентам задавать вопросы и получать ответы с привязкой к таймкодам.",
      topic: "AI Assistant"
    }
  ];
}