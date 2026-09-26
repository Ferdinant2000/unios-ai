/**
 * Демо-архив для презентаций: если для лекции нет ни live-записи, ни моков,
 * ни сохранённых секций — страница архива всё равно получает наполненный
 * транскрипт (3–4 секции про ИИ на русском/узбекском/английском) и синтезированное
 * демо-аудио, чтобы ни в коем случае не остаться пустой.
 */

import type { LiveLecture, LiveSection } from "@/lib/live";
import { DEMO_TEACHER_ID } from "@/lib/firebase";
import type { Lang } from "@/lib/translations";

interface DemoSegment {
  time: string;
  text: string;
}

const DEMO_SEGMENTS: Record<Lang, DemoSegment[]> = {
  ru: [
    {
      time: "00:00",
      text: "Добро пожаловать на демонстрационную лекцию по искусственному интеллекту. Искусственный интеллект — это область компьютерных наук, которая изучает создание систем, способных выполнять задачи, требующие человеческого интеллекта: понимание речи, распознавание образов и принятие решений.",
    },
    {
      time: "00:47",
      text: "Машинное обучение — ключевой раздел искусственного интеллекта. Модель учится на примерах: вместо явных правил система находит закономерности в данных. Чем больше качественных примеров, тем точнее прогноз модели.",
    },
    {
      time: "01:38",
      text: "Нейронные сети моделируют обработку информации по аналогии с мозгом. Слои нейронов последовательно преобразуют данные: первый слой извлекает простые признаки, а глубокие слои — сложные абстракции, например смысл предложения.",
    },
    {
      time: "02:31",
      text: "Генеративный искусственный интеллект создаёт новый контент: текст, изображения, речь и музыку. Такие модели обучаются на огромных массивах данных и отвечают на вопросы почти как человек. В этой системе ИИ-помощник анализирует лекцию и отвечает по её содержанию.",
    },
  ],
  uz: [
    {
      time: "00:00",
      text: "Assalomu alaykum! Bu sun'iy intellektga oid namoyish darsidir. Sun'iy intellekt — bu kompyuter fanlarining inson aqli talab qilinadigan vazifalarni bajaradigan tizimlarni o'rganuvchi sohasi: nutqni tushunish, tasvirni aniqlash va qaror qabul qilish.",
    },
    {
      time: "00:47",
      text: "Mashinaviy o'rganish — sun'iy intellektning asosiy bo'limi. Model misollar asosida o'rganadi: aniq qoidalar o'rniga tizim ma'lumotlardagi qonuniyatlarni topadi. Qancha sifatli misol ko'rsa, model prognozi shuncha aniq bo'ladi.",
    },
    {
      time: "01:38",
      text: "Neyron tarmoqlar axborotni qayta ishlashni miya misolida modellashtiradi. Neyronlar qatlamlari ma'lumotlarni ketma-ket o'zgartiradi: birinchi qatlam oddiy belgilarni, chuqur qatlamlar esa murakkab abstraksiyalarni, masalan gapning ma'nosini ajratadi.",
    },
    {
      time: "02:31",
      text: "Generativ sun'iy intellekt yangi kontent yaratadi: matn, rasm, nutq va musiqa. Bunday modellar katta ma'lumotlar to'plamida o'rganadi va savollarga deyarli insondek javob beradi. Bu tizimda AI yordamchisi ma'ruzani tahlil qilib, uning mazmuni bo'yicha javob beradi.",
    },
  ],
  en: [
    {
      time: "00:00",
      text: "Welcome to this demo lecture on artificial intelligence. Artificial intelligence is the branch of computer science that studies systems able to perform tasks requiring human intelligence: speech understanding, pattern recognition, and decision making.",
    },
    {
      time: "00:47",
      text: "Machine learning is a key part of artificial intelligence. Instead of explicit rules, the model learns patterns from data. The more quality examples it sees, the more accurate its predictions become.",
    },
    {
      time: "01:38",
      text: "Neural networks process information similarly to the brain. Layers of neurons transform data step by step: the first layer extracts simple features, while deeper layers build complex abstractions such as the meaning of a sentence.",
    },
    {
      time: "02:31",
      text: "Generative AI creates new content: text, images, speech, and music. Trained on huge data sets, these models answer questions almost like a human. In this app the AI assistant reads the lecture and answers based on its content.",
    },
  ],
};

const DEMO_TITLES: Record<Lang, string> = {
  ru: "Демо-лекция: искусственный интеллект",
  uz: "Demo ma'ruza: sun'iy intellekt",
  en: "Demo lecture: Artificial Intelligence",
};

const DEMO_TEACHERS: Record<Lang, string> = {
  ru: "др. Акмал Рахимов",
  uz: "dr. Akmal Rahimov",
  en: "Dr. Akmal Rakhimov",
};

/** Секунды таймкодов → миллисекунды от начала лекции (для таймлайна плеера). */
function secondsToMs(time: string): number {
  const [minutes = "0", seconds = "0"] = time.split(":");
  return (Number(minutes) * 60 + Number(seconds)) * 1000;
}

/**
 * Синтез демо-аудио: короткая двухтональная мелодия в формате WAV (PCM 8-bit).
 * Возвращает Data URL, который можно подставить в <audio> сразу, без сети.
 */
export function demoToneDataUrl(seed = 0, seconds = 2.4, sampleRate = 8000): string {
  const n = Math.floor(seconds * sampleRate);
  const buffer = new ArrayBuffer(44 + n);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + n, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 1, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeStr(36, "data");
  view.setUint32(40, n, true);

  const base = 392 + (seed % 4) * 55;
  const notes = [base, base * 1.25, base * 1.5, base * 2];
  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const noteIndex = Math.min(Math.floor(t / 0.55), notes.length - 1);
    const envelope = Math.max(0, Math.min(1, t * 10, (seconds - t) * 10));
    const value =
      128 + Math.round(115 * envelope * Math.sin(2 * Math.PI * notes[noteIndex] * t));
    view.setUint8(44 + i, value);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

export interface DemoArchive {
  lecture: LiveLecture;
  sections: LiveSection[];
}

/** Строит демо-архив для лекции без записанного контента. */
export function buildDemoArchive(lectureId: string, lang: Lang): DemoArchive {
  const lecture: LiveLecture = {
    id: lectureId,
    title: DEMO_TITLES[lang],
    topic: DEMO_TITLES[lang],
    teacherId: DEMO_TEACHER_ID,
    teacherName: DEMO_TEACHERS[lang],
    status: "ended",
    createdAt: 0,
  };

  const sections: LiveSection[] = DEMO_SEGMENTS[lang].map((segment, index) => {
    const timestamp = secondsToMs(segment.time);
    const nextTimestamp = secondsToMs(
      DEMO_SEGMENTS[lang][index + 1]?.time ?? "99:59",
    );
    const audioUrl = demoToneDataUrl(index);
    return {
      id: `demo-${index}`,
      text: segment.text,
      audioUrl,
      timestamp,
      order: index,
      duration: Math.max(nextTimestamp - timestamp, 12_000),
    };
  });

  return { lecture, sections };
}

/**
 * Нормализует сохранённую секцию. Принимает как записи live.ts (audioUrl),
 * так и записанные в старое зеркало { audioBase64 } — для совместимости.
 */
export function normalizeSection(
  raw: Partial<LiveSection> & { audioBase64?: string | null },
): LiveSection | null {
  if (!raw || typeof raw.text !== "string" || typeof raw.id !== "string") return null;
  const timestamp = typeof raw.timestamp === "number" ? raw.timestamp : 0;
  return {
    id: raw.id,
    text: raw.text,
    audioUrl: raw.audioUrl ?? raw.audioBase64 ?? null,
    timestamp,
    order: typeof raw.order === "number" ? raw.order : timestamp,
    duration: typeof raw.duration === "number" ? raw.duration : undefined,
  };
}