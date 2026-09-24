"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Pause,
  Play,
  Send,
  Sparkles,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COURSES,
  formatTime,
  getLectureById,
  timeToSeconds,
} from "@/lib/mock-hemis";
import type { ChatMessage } from "@/types";
import { GlassCard, StatusPill } from "@/components/primitives";

const PLAY_EXTRA_SECONDS = 8 * 60;

const SUGGESTED_QUESTIONS = [
  "Почему мы используем ReLU вместо Sigmoid?",
  "Что такое переобучение?",
  "Как работает градиентный спуск?",
];

const WAVEFORM_BARS = Array.from({ length: 28 }, (_, i) => {
  const h = 24 + Math.abs(Math.sin(i * 1.7) * 66 + Math.cos(i * 0.9) * 22);
  return Math.round(h);
});

function useTypingIndicator(active: boolean) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), 250);
    return () => clearTimeout(timer);
  }, [active]);
  return shown;
}

export default function LecturePage() {
  const params = useParams<{ id: string }>();
  const lectureId = Array.isArray(params.id) ? params.id[0] : params.id;

  const lecture = useMemo(() => getLectureById(lectureId), [lectureId]);

  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingShown = useTypingIndicator(loading);

  const duration = useMemo(() => {
    if (!lecture) return 0;
    const last = timeToSeconds(lecture.transcript[lecture.transcript.length - 1]?.time ?? "00:00");
    return last + PLAY_EXTRA_SECONDS;
  }, [lecture]);

  const seekTo = useCallback(
    (timecode: string) => {
      setCurrentTime(timeToSeconds(timecode));
      setPlaying(true);
    },
    [],
  );

  const scrollChat = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollChat();
  }, [messages, loading, scrollChat]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(
      () =>
        setCurrentTime((t) => {
          if (t + 1 >= duration) {
            setPlaying(false);
            return duration;
          }
          return t + 1;
        }),
      1000,
    );
    return () => clearInterval(interval);
  }, [playing, duration]);

  useEffect(() => {
    if (lecture) {
      setMessages([
        {
          id: "greeting",
          sender: "ai",
          text: `Привет! Я ИИ-помощник по лекции «${lecture.title}». Я слушал занятие вместе с тобой и помню каждый фрагмент. Задай вопрос по материалу, а я укажу точный таймкод.`,
        },
      ]);
    }
  }, [lecture]);

  if (!lecture) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="glass p-8 text-center">
          <p className="text-white">Лекция не найдена</p>
          <Link href="/student" className="btn-ghost mt-4">
            <ArrowLeft className="h-4 w-4" /> Вернуться на дашборд
          </Link>
        </div>
      </main>
    );
  }

  const course = COURSES.find((c) => c.id === lecture.courseId);
  const safeLecture = lecture;
  const activeIndex = lecture.transcript.reduce((acc, seg, i) => {
    return timeToSeconds(seg.time) <= currentTime ? i : acc;
  }, -1);
  const progress = Math.min(currentTime / duration, 1);
  const activeBars = Math.floor(progress * WAVEFORM_BARS.length);

  async function sendQuestion(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "user", text: question },
    ]);
    setLoading(true);
    try {
      const res = await fetch("/api/ask-lecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lectureId: safeLecture.id }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: data.answer ?? "Не удалось получить ответ.",
          timestampRef: data.timestampRef,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: "Что-то пошло не так. Попробуй ещё раз.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setCurrentTime(ratio * duration);
    setPlaying(true);
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-6 pb-20">
        <header className="flex items-center justify-between py-6">
          <Link href="/student" className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Дашборд студента
          </Link>
          <StatusPill label="ИИ: слушает лекцию" active />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0 space-y-6">
            <div className="glass-strong p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-300">
                    <BookOpen className="h-3 w-3" />
                    {course?.title} · {course?.code}
                  </span>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                    {lecture.title}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="h-3.5 w-3.5" />
                    {lecture.date} · {formatTime(duration)} · преподаватель {course?.professorName}
                  </p>
                </div>
              </div>
            </div>

            <GlassCard className="p-5">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Пауза" : "Воспроизвести"}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white transition-all hover:brightness-110 active:scale-95"
                >
                  {playing ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="ml-0.5 h-6 w-6" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    onClick={onProgressClick}
                    className="group relative h-12 cursor-pointer"
                  >
                    <div className="flex h-full items-center gap-[3px]">
                      {WAVEFORM_BARS.map((height, i) => (
                        <span
                          key={i}
                          className={cn(
                            "flex-1 rounded-full transition-colors",
                            i < activeBars
                              ? "bg-violet-400"
                              : "bg-white/10 group-hover:bg-white/20",
                          )}
                          style={{
                            height: `${height}%`,
                            ...(playing && i < activeBars
                              ? {
                                  animation: `wave 1s ease-in-out ${i * 0.04}s infinite`,
                                }
                              : {}),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-zinc-400">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-zinc-500">{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
                <MousePointerClick className="h-3.5 w-3.5" />
                Демо-плеер: прогресс воспроизводится автоматически. Кликай по
                таймкодам транскрипта, чтобы перемотать.
              </p>
            </GlassCard>

            <section>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                <FileText className="h-3.5 w-3.5" />
                Транскрипт лекции
              </div>
              <div className="space-y-3">
                {lecture.transcript.map((segment, index) => {
                  const active = index === activeIndex;
                  return (
                    <button
                      key={segment.time}
                      onClick={() => seekTo(segment.time)}
                      className={cn(
                        "glass block w-full p-4 text-left transition-all",
                        active
                          ? "border-violet-400/40 bg-violet-500/10"
                          : "hover:border-white/20 hover:bg-white/[0.08]",
                      )}
                    >
                      <span
                        className={cn(
                          "mb-1.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
                          active
                            ? "bg-violet-500/20 text-violet-200"
                            : "bg-white/10 text-zinc-300",
                        )}
                      >
                        <Play className="h-3 w-3" />
                        {segment.time}
                      </span>
                      <p className="text-sm leading-relaxed text-zinc-300">
                        {segment.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                <Sparkles className="h-3.5 w-3.5" />
                AI-конспект лекции
              </div>
              <GlassCard className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 p-5">
                <ul className="space-y-3">
                  {lecture.summary.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-200">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
            <GlassCard className="flex h-full min-h-[560px] flex-col p-0">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Ask the Lecture
                    </h2>
                    <p className="text-xs text-zinc-500">
                      ИИ-помощник · знает {lecture.transcript.length} фрагмента
                    </p>
                  </div>
                </div>
              </div>

              <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "animate-fade-up flex",
                      message.sender === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.sender === "user"
                          ? "rounded-br-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                          : "rounded-bl-md border border-white/10 bg-white/[0.06] text-zinc-200",
                      )}
                    >
                      <p>{message.text}</p>
                      {message.timestampRef && (
                        <button
                          onClick={() => seekTo(message.timestampRef!)}
                          className="mt-2 inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/15 px-2.5 py-1 text-[11px] font-medium text-violet-200 transition-colors hover:bg-violet-500/25"
                        >
                          <Play className="h-3 w-3" />
                          Фрагмент на {message.timestampRef}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {loading &&
                  typingShown ? (
                    <div className="animate-fade-up flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="typing-dot h-2 w-2 rounded-full bg-violet-300"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                <div ref={chatEndRef} />
              </div>

              <div className="space-y-2 border-t border-white/10 px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      onClick={() => sendQuestion(question)}
                      disabled={loading}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-violet-400/40 hover:text-white disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendQuestion(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Спроси о лекции…"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-400/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Отправить"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </GlassCard>
          </aside>
        </div>
      </div>
    </main>
  );
}