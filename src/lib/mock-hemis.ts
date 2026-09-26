import type {
  User,
  Course,
} from "@/types";

interface TranscriptSegment {
  time: string;
  text: string;
}

interface Lecture {
  id: string;
  courseId: string;
  title: string;
  date: string;
  audioUrl: string;
  transcript: TranscriptSegment[];
  summary: string[];
}

interface ClassroomAnalytics {
  connectedStudents: number;
  comprehensionRate: number;
  confusedTopics: string[];
}

export const STUDENT = {
  role: "student",
  name: "Фирдавсбек Комолитдинов",
  hemisId: "HEMIS-2024-00451",
  avatar: "ФК",
};

export const PROFESSOR = {
  role: "professor",
  name: "Акмал Рахимов",
  hemisId: "HEMIS-TC-1102",
  avatar: "АР",
};

export const COURSES = [
  {
    id: "c1",
    title: "Искусственный Интеллект",
    code: "AI-401",
    professorName: "др. Акмал Рахимов",
  },
  {
    id: "c2",
    title: "Экономика",
    code: "ECO-210",
    professorName: "др. Нодира Юсупова",
  },
  {
    id: "c3",
    title: "Базы данных",
    code: "DB-310",
    professorName: "проф. Бахром Умаров",
  },
];

export const LECTURES: Lecture[] = [
  {
    id: "lec-ai-neural",
    courseId: "c1",
    title: "Нейронные сети: архитектура, обучение и регуляризация",
    date: "22 сентября 2026",
    audioUrl: "",
    transcript: [
      {
        time: "00:00",
        text: "Добро пожаловать на лекцию о нейронных сетях. Сегодня разберём путь от перцептрона до глубоких архитектур. Начнём с вопроса: чем нейросеть отличается от классических алгоритмов машинного обучения? Ключевая идея — модель сама извлекает признаки из данных, а не полагается на ручную инженерию признаков.",
      },
      {
        time: "05:12",
        text: "Рассмотрим функции активации. Sigmoid преобразует значение в диапазон (0, 1), но при большом количестве слоёв её градиент затухает — это проблема исчезающего градиента. Поэтому на практике для скрытых слоёв используют ReLU: она линейна для положительных значений и зануляет отрицательные, что ускоряет обучение и уходит от saturation.",
      },
      {
        time: "12:40",
        text: "Обучение сети — это минимизация функции потерь методом градиентного спуска. Мы двигаем веса в сторону антиградиента с шагом, который называется скоростью обучения (learning rate). Слишком большой шаг — модель расходится, слишком маленький — долго сходится. Batch size определяет, сколько примеров сеть видит до обновления весов.",
      },
      {
        time: "24:16",
        text: "Главный враг нейросетей — переобучение: модель запоминает тренировочные данные вместо обобщения на новые. Боремся регуляризацией: dropout случайно отключает нейроны во время обучения, L2-регуляризация штрафует большие веса, а early stopping останавливает обучение, когда ошибка на валидационной выборке перестаёт падать.",
      },
    ],
    summary: [
      "Нейросети автоматически извлекают признаки, в отличие от классических МО-алгоритмов.",
      "Sigmoid вызывает затухание градиента в глубоких сетях; ReLU — стандарт для скрытых слоёв.",
      "Градиентный спуск минимизирует функцию потерь; learning rate и batch size — ключевые гиперпараметры.",
      "Переобучение лечится dropout, L2-регуляризацией и early stopping.",
    ],
  },
  {
    id: "lec-ai-ml-intro",
    courseId: "c1",
    title: "Введение в машинное обучение: задачи и типы",
    date: "15 сентября 2026",
    audioUrl: "",
    transcript: [
      {
        time: "00:00",
        text: "Машинное обучение — это область ИИ, где система учится принимать решения на основе данных, а не явных правил. Различают обучение с учителем, без учителя и с подкреплением.",
      },
      {
        time: "09:30",
        text: "Регрессия и классификация — основные задачи обучения с учителем. В обучении без учителя мы ищем скрытые структуры, например кластеризация студентов по группам знаний.",
      },
    ],
    summary: [
      "МО учится на данных, а не на явных правилах.",
      "Три типа обучения: с учителем, без учителя и с подкреплением.",
      "Классификация и регрессия — базовые задачи надзорного обучения.",
    ],
  },
  {
    id: "lec-eco-elasticity",
    courseId: "c2",
    title: "Эластичность спроса и предложения",
    date: "20 сентября 2026",
    audioUrl: "",
    transcript: [
      {
        time: "00:00",
        text: "Эластичность показывает, насколько сильно реагирует спрос на изменение цены. Коэффициент эластичности E = %ΔQ / %ΔP. Если E > 1 — спрос эластичный.",
      },
      {
        time: "08:30",
        text: "Cross-price elasticity измеряет, как изменение цены одного товара влияет на спрос на другой. Положительное значение означает, что товары взаимозаменяемы (субституты), отрицательное — они взаимодополняющие (комплементы).",
      },
      {
        time: "19:45",
        text: "Income elasticity показывает реакцию спроса на изменение дохода потребителя. Товары первой необходимости имеют малую эластичность по доходу, предметы роскоши — высокую.",
      },
    ],
    summary: [
      "Эластичность — реакция спроса на изменение цены (E = %ΔQ / %ΔP).",
      "Cross-price elasticity > 0 — субституты, < 0 — комплементы.",
      "Income elasticity разделяет товары первой необходимости и предметы роскоши.",
    ],
  },
  {
    id: "lec-db-sql",
    courseId: "c3",
    title: "SQL и нормализация баз данных",
    date: "18 сентября 2026",
    audioUrl: "",
    transcript: [
      {
        time: "00:00",
        text: "SQL — декларативный язык запросов к реляционным базам данных. Основные операции: SELECT, INSERT, UPDATE, DELETE.",
      },
      {
        time: "14:05",
        text: "Нормализация устраняет избыточность и аномалии обновления. Первая нормальная форма требует атомарности значений, вторая — устранения частичной зависимости, третья — транзитивной зависимости.",
      },
    ],
    summary: [
      "SQL — декларативный язык работы с реляционными БД.",
      "Нормализация (1-3 НФ) убирает избыточность и аномалии.",
    ],
  },
];

export const CLASSROOM_ANALYTICS: ClassroomAnalytics = {
  connectedStudents: 184,
  comprehensionRate: 92,
  confusedTopics: ["Cross-price elasticity", "Затухание градиента", "Batch size"],
};

export function getCourseById(id: string) {
  return COURSES.find((course) => course.id === id);
}

export function getLectureById(id: string) {
  return LECTURES.find((lecture) => lecture.id === id);
}

export function getLecturesByCourse(courseId: string) {
  return LECTURES.filter((lecture) => lecture.courseId === courseId);
}

export function timeToSeconds(time: string): number {
  const [minutes = "0", seconds = "0"] = time.split(":");
  return Number(minutes) * 60 + Number(seconds);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const STOP_WORDS = new Set([
  "это",
  "что",
  "как",
  "почему",
  "зачем",
  "какой",
  "какая",
  "какие",
  "когда",
  "где",
  "на",
  "в",
  "по",
  "с",
  "и",
  "не",
  "о",
  "об",
  "про",
  "для",
  "ли",
  "он",
  "она",
  "они",
  "мы",
  "вы",
  "ты",
  "его",
  "её",
  "мне",
  "меня",
  "такое",
  "есть",
  "можно",
  "помогите",
  "расскажите",
  "объясните",
  "пожалуйста",
  "значит",
  "бывает",
  "делается",
  "работает",
  "используется",
  "пожалуйста",
  "скажи",
  "могу",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function findBestTranscriptMatch(
  lecture: Lecture,
  question: string,
): TranscriptSegment {
  const queryWords = tokenize(question);
  if (queryWords.length === 0) {
    return lecture.transcript[lecture.transcript.length - 1];
  }

  let best: { segment: TranscriptSegment; score: number } | null = null;

  for (const segment of lecture.transcript) {
    const segmentWords = new Set(tokenize(segment.text));
    const score = queryWords.reduce(
      (acc, word) => acc + (segmentWords.has(word) ? 1 : 0),
      0,
    );
    if (best === null || score > best.score) {
      best = { segment, score };
    }
  }

  return best?.segment ?? lecture.transcript[0];
}

export function buildSectionAnswer(
  section: { topic: string; transcript: string },
  question: string,
): { answer: string; timestampRef?: string } {
  const answer = `Based on the "${section.topic}" section: ${section.transcript.slice(0, 200)}...`;
  return { answer, timestampRef: "00:00" };
}

export function buildLectureAnswer(
  lecture: Lecture,
  question: string,
): { answer: string; timestampRef: string } {
  const match = findBestTranscriptMatch(lecture, question);
  const firstChar =
    match.text.charAt(0).toLowerCase() + match.text.slice(1);

  const answer =
    `На ${match.time} профессор объяснил, что ${firstChar} ` +
    `Основной тезис конспекта: ${lecture.summary[0]}. ` +
    `Если нужны детали по другому фрагменту лекции — уточни таймкод или тему.`;

  return { answer, timestampRef: match.time };
}