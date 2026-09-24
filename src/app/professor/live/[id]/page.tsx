"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSES, getCourseById } from "@/lib/mock-hemis";
import { GlassCard, StatusPill } from "@/components/primitives";

const FEED_TEMPLATES = [
  "AI определил: студенты не поняли «{topic}» и задали вопросы повторно",
  "Уровень энергии аудитории {dir} 3% за последние 30 секунд",
  "ИИ сгенерировал уточняющий конспект для параграфа «{topic}»",
  "Обнаружена активность в чате Ask the Lecture — 12 сообщений за минуту",
];

interface FeedEvent {
  id: number;
  text: string;
  time: string;
}

export default function LiveLecturePage() {
  const params = useParams<{ id: string }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const course = useMemo(() => getCourseById(courseId), [courseId]);

  const [students, setStudents] = useState(184);
  const [comprehension, setComprehension] = useState(92);
  const [energized, setEnergized] = useState(78);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [generating, setGenerating] = useState(false);
  const [sentQuiz, setSentQuiz] = useState(false);
  const [explained, setExplained] = useState(false);
  const [lastExplainTopic, setLastExplainTopic] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    setFeed(
      [
        "AI зафиксировал снижение понимания после параграфа «Затухание градиента»",
        "18 студентов открыли конспект лекции в приложении",
        "Преподаватель перешёл к теме Cross-price elasticity",
      ].map((text, i) => ({ id: i, text, time })),
    );
  }, []);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setStudents(
        (s) => Math.max(160, Math.min(210, s + Math.round(Math.random() * 4 - 2))),
      );
      setComprehension((c) =>
        Math.max(78, Math.min(99, c + Math.round(Math.random() * 2 - 1))),
      );
      setEnergized((e) =>
        Math.max(40, Math.min(100, e + Math.round(Math.random() * 6 - 3))),
      );

      if (tick % 3 === 0) {
        const template =
          FEED_TEMPLATES[tick % FEED_TEMPLATES.length];
        const topic =
          comprehension > 90
            ? "Batch size"
            : "Cross-price elasticity";
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes(),
        ).padStart(2, "0")}`;
        const text = template
          .replace("{topic}", topic)
          .replace("{dir}", Math.random() > 0.5 ? "снизился" : "вырос");
        setFeed((prev) => [
          { id: Date.now(), text, time },
          ...prev.slice(0, 5),
        ]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [comprehension]);

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="glass p-8 text-center">
          <p className="text-white">Курс не найден</p>
          <Link href="/professor" className="btn-ghost mt-4">
            <ArrowLeft className="h-4 w-4" /> На панель преподавателя
          </Link>
        </div>
      </main>
    );
  }

  const ringRadius = 62;
  const circumference = 2 * Math.PI * ringRadius;
  const comprehensionOffset =
    circumference * (1 - comprehension / 100);

  function handleGenerateExplanation() {
    if (generating) return;
    setGenerating(true);
    setExplained(false);
    setLastExplainTopic(null);
    setTimeout(() => {
      setGenerating(false);
      setExplained(true);
      setLastExplainTopic(
        comprehension > 90
          ? "Batch size"
          : "Cross-price elasticity",
      );
      const now = new Date();
      setFeed((prev) => [
        {
          id: Date.now(),
          text: `Мини-пояснение по теме «${comprehension > 90 ? "Batch size" : "Cross-price elasticity"}» отправлено студентам`,
          time: `${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes(),
          ).padStart(2, "0")}`,
        },
        ...prev.slice(0, 5),
      ]);
    }, 2000);
  }

  function handleSendQuiz() {
    setSentQuiz(true);
    const now = new Date();
    setFeed((prev) => [
      {
        id: Date.now(),
        text: "Итоговый квиз отправлен в HEMIS: 5 вопросов, таймер 2 минуты",
        time: `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes(),
        ).padStart(2, "0")}`,
      },
      ...prev.slice(0, 5),
    ]);
    setTimeout(() => setSentQuiz(false), 4000);
  }

  const topics = [
    "Cross-price elasticity",
    "Затухание градиента",
    "Batch size",
  ];

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-6 pb-20">
        <header className="flex items-center justify-between py-6">
          <Link
            href="/professor"
            className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Панель преподавателя
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 animate-live-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
              </span>
              LIVE · {course.title}
            </span>
            <StatusPill label="Аудиозапись идёт" active />
          </div>
        </header>

        <div className="glass-strong mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 text-violet-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold tabular-nums text-white">
                {students}
              </p>
              <p className="text-xs text-zinc-400">студентов онлайн</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <Activity className="h-4 w-4 text-emerald-300" />
            Аудитория +{students > 185 ? 8 : 2} за последние 5 минут
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <GlassCard className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={ringRadius}
                    fill="none"
                    stroke="url(#liveGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={comprehensionOffset}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="liveGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#e879f9" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tabular-nums text-white">
                    {comprehension}%
                  </span>
                  <span className="mt-1 text-[11px] text-zinc-400">
                    понимание
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white">
                  % Понимания аудитории
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  ИИ анализирует вопросы студентов, скорость ответов в
                  квизах и внимание на таймкодах. Чем выше — тем лучше
                  усвоен материал.
                </p>
                <div className="mt-4 flex flex-wrap gap-6">
                  <div>
                    <p className="text-lg font-bold text-emerald-300">
                      +3% за 5 мин
                    </p>
                    <p className="text-[11px] text-zinc-500">динамика</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {energized}%
                    </p>
                    <p className="text-[11px] text-zinc-500">энергия группы</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-amber-300" />
                <h3 className="text-sm font-semibold text-white">
                  Проблемные концепты, выявленные ИИ
                </h3>
              </div>
              <ul className="space-y-3">
                {topics.map((topic, index) => (
                  <li
                    key={topic}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          index === 0
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-zinc-200">{topic}</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      {index === 0 ? "31% ответили неверно" : "много повторов"}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-sky-300" />
                <h3 className="text-sm font-semibold text-white">
                  AI-события в реальном времени
                </h3>
              </div>
              <ul className="space-y-3">
                {feed.map((event) => (
                  <li
                    key={event.id}
                    className="animate-fade-up flex items-start gap-3 text-sm"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    <p className="flex-1 leading-relaxed text-zinc-300">
                      {event.text}
                    </p>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500">
                      {event.time}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <GlassCard className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">
                  Live-инструменты
                </h3>
              </div>

              <button
                onClick={handleGenerateExplanation}
                disabled={generating}
                className="btn-primary w-full disabled:opacity-60"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Сгенерировать мини-пояснение (2 мин)
              </button>

              {explained && (
                <p className="animate-fade-up flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 text-xs text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  Мини-пояснение по теме «{lastExplainTopic}» доставлено 184
                  студентам и закреплено в HEMIS.
                </p>
              )}

              <button
                onClick={handleSendQuiz}
                disabled={sentQuiz}
                className={cn(
                  "w-full",
                  sentQuiz
                    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "btn-ghost",
                )}
              >
                {sentQuiz ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Квиз отправлен в HEMIS
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Отправить Квиз в HEMIS
                  </>
                )}
              </button>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Квиз из 5 вопросов автоматически собран из тем, где
                понимание аудитории ниже 70%.
              </p>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-300" />
                <h3 className="text-sm font-semibold text-white">
                  Интеграция HEMIS
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-center justify-between">
                  <span>Запись лекции</span>
                  <span className="text-emerald-300">загружается</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Транскрипт</span>
                  <span className="text-emerald-300">готов · 4 фрагмента</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Конспект AI</span>
                  <span className="text-emerald-300">обновлён</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Результаты квизов</span>
                  <span className="text-zinc-500">в конце пары</span>
                </li>
              </ul>
            </GlassCard>
          </aside>
        </section>
      </div>
    </main>
  );
}