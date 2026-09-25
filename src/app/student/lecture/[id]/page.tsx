"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
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
import { GlassCard } from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { STUDENT } from "@/lib/mock-hemis";

const PLAY_EXTRA_SECONDS = 8 * 60;

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
  const { t } = useLanguage();

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
    const last = timeToSeconds(
      lecture.transcript[lecture.transcript.length - 1]?.time ?? "00:00",
    );
    return last + PLAY_EXTRA_SECONDS;
  }, [lecture]);

  const seekTo = useCallback((timecode: string) => {
    setCurrentTime(timeToSeconds(timecode));
    setPlaying(true);
  }, []);

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
        setCurrentTime((prev) => {
          if (prev + 1 >= duration) {
            setPlaying(false);
            return duration;
          }
          return prev + 1;
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
          text: t("chatGreeting", { title: lecture.title }),
        },
      ]);
    }
  }, [lecture, t]);

  if (!lecture) {
    return (
      <main className="min-h-screen">
        <Header showBack user={STUDENT} />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center">
            <p className="font-bold text-slate-900 dark:text-white">
              {t("lectureNotFound")}
            </p>
            <Link href="/student" className="btn-ghost mt-4">
              {t("backToDashboard")}
            </Link>
          </div>
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
  const suggestedQuestions = [t("sugQ1"), t("sugQ2"), t("sugQ3")];

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
          text: data.answer ?? t("answerFallback"),
          timestampRef: data.timestampRef,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: t("errorMsg"),
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
      <Header showBack user={STUDENT} />

      <div className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0 space-y-6">
            <FadeIn>
              <div className="glass-strong p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-sky-300">
                        <BookOpen className="h-3 w-3" />
                        {course?.title} · {course?.code}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-500 dark:text-violet-300">
                        <Sparkles className="h-3 w-3" />
                        {t("aiListening")}
                      </span>
                    </div>
                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                      {lecture.title}
                    </h1>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      {lecture.date} · {formatTime(duration)} · {course?.professorName}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setPlaying((prev) => !prev)}
                    aria-label={playing ? "Pause" : "Play"}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-150 hover:scale-[1.04] active:scale-95"
                  >
                    {playing ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="ml-0.5 h-6 w-6" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div onClick={onProgressClick} className="group relative h-12 cursor-pointer">
                      <div className="flex h-full items-center gap-[3px]">
                        {WAVEFORM_BARS.map((height, i) => (
                          <span
                            key={i}
                            className={cn(
                              "flex-1 rounded-full transition-colors",
                              i < activeBars
                                ? "bg-gradient-to-t from-blue-500 to-purple-500"
                                : "bg-slate-200 group-hover:bg-slate-300 dark:bg-white/10 dark:group-hover:bg-white/20",
                            )}
                            style={{
                              height: `${height}%`,
                              ...(playing && i < activeBars
                                ? { animation: `wave 1s ease-in-out ${i * 0.04}s infinite` }
                                : {}),
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-slate-500 dark:text-zinc-400">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-slate-400 dark:text-zinc-500">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  {t("playerHint")}
                </p>
              </GlassCard>
            </FadeIn>

            <section>
              <FadeIn>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  <FileText className="h-3.5 w-3.5" />
                  {t("transcript")}
                </div>
              </FadeIn>
              <div className="space-y-3">
                {lecture.transcript.map((segment, index) => {
                  const active = index === activeIndex;
                  return (
                    <FadeIn key={segment.time} delay={index * 0.04}>
                      <button
                        onClick={() => seekTo(segment.time)}
                        className={cn(
                          "glass block w-full p-4 text-left",
                          active
                            ? "border-blue-500/50 bg-blue-500/10"
                            : "hover:border-purple-500/40 hover:bg-white/70 dark:hover:bg-white/[0.08]",
                        )}
                      >
                        <span
                          className={cn(
                            "mb-1.5 inline-flex items-center gap-1 rounded-md bg-gradient-to-r px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-white",
                            active
                              ? "from-blue-600 to-purple-600"
                              : "from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700",
                          )}
                        >
                          <Play className="h-3 w-3" />
                          {segment.time}
                        </span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                          {segment.text}
                        </p>
                      </button>
                    </FadeIn>
                  );
                })}
              </div>
            </section>

            <section>
              <FadeIn>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("summary")}
                </div>
              </FadeIn>
              <FadeIn delay={0.05}>
                <GlassCard className="bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-5">
                  <ul className="space-y-3">
                    {lecture.summary.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-slate-600 dark:text-zinc-200"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </FadeIn>
            </section>
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-[calc(100dvh-6rem)]">
            <FadeIn delay={0.1}>
              <GlassCard className="flex h-full min-h-[560px] flex-col p-0" interactive={false}>
                <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-purple-500/20">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t("askLecture")}
                      </h2>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {t("aiHelperSubtitle", { count: lecture.transcript.length })}
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
                            ? "rounded-br-md bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200",
                        )}
                      >
                        <p>{message.text}</p>
                        {message.timestampRef && (
                          <button
                            onClick={() => seekTo(message.timestampRef!)}
                            className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md shadow-purple-500/20 transition-transform active:scale-95"
                          >
                            <Play className="h-3 w-3" />
                            {t("fragmentAt", { time: message.timestampRef })}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && typingShown ? (
                    <div className="animate-fade-up flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.06]">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="typing-dot h-2 w-2 rounded-full bg-indigo-400"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div ref={chatEndRef} />
                </div>

                <div className="space-y-2 border-t border-slate-200 px-5 py-3 dark:border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => sendQuestion(question)}
                        disabled={loading}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition-all duration-150 hover:scale-[1.015] hover:border-purple-500/40 hover:text-indigo-500 active:scale-[0.98] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white"
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
                      placeholder={t("askPlaceholder")}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      aria-label={t("send")}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20 transition-all duration-150 hover:scale-[1.04] active:scale-95 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </GlassCard>
            </FadeIn>
          </aside>
        </div>
      </div>
    </main>
  );
}