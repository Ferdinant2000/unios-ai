"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Pause,
  Play,
  Send,
  Sparkles,
  MousePointerClick,
  Maximize2,
  Minimize2,
  X,
  HelpCircle,
  Award,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COURSES,
  formatTime,
  getLectureById,
  timeToSeconds,
} from "@/lib/mock-hemis";
import { GlassCard } from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { STUDENT } from "@/lib/mock-hemis";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestampRef?: string;
}

interface CourseWithTitle {
  id: string;
  title: string;
  code: string;
  professorName: string;
}

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
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic: string;
  }>>([]);
  const [quizState, setQuizState] = useState<"idle" | "loading" | "active" | "results">("idle");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    correct: number;
    total: number;
    incorrectTopics: string[];
  } | null>(null);
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

  // Join live lecture session when student opens the page
  useEffect(() => {
    const joinSession = async () => {
      try {
        // Check if there's an active session for this lecture
        const res = await fetch("/api/lecture-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            lectureId,
            studentId: "student-1",
          }),
        });
        if (res.ok) {
          console.log("Joined live lecture session");
        }
      } catch (error) {
        console.log("No active live session for this lecture");
      }
    };
    joinSession();
  }, [lectureId]);

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

  const course = COURSES.find((c) => c.id === lecture.courseId) as CourseWithTitle | undefined;
  const safeLecture = lecture;
  const activeIndex = (lecture.transcript as { time: string; text: string }[]).reduce((acc: number, seg: { time: string; text: string }, i: number) => {
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
      const res = await fetch("/api/ask-lecture/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lectureId: safeLecture.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error ?? t("errorMsg");
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: errorMsg,
          },
        ]);
        return;
      }
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

  async function generateQuiz() {
    setQuizState("loading");
    try {
      const res = await fetch("/api/ai/quiz/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId: safeLecture.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate quiz");
      }
      setQuizQuestions(data.questions);
      setQuizState("active");
      setQuizAnswers({});
      setCurrentQuizQuestion(0);
      setQuizResults(null);
    } catch {
      setQuizState("idle");
    }
  }

  function answerQuizQuestion(questionIndex: number, answerIndex: number) {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
    if (questionIndex < quizQuestions.length - 1) {
      setCurrentQuizQuestion(questionIndex + 1);
    } else {
      calculateQuizResults();
    }
  }

  function calculateQuizResults() {
    let correct = 0;
    const incorrectTopics: string[] = [];
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) {
        correct++;
      } else {
        incorrectTopics.push(q.topic);
      }
    });
    const score = Math.round((correct / quizQuestions.length) * 100);
    setQuizResults({ score, correct, total: quizQuestions.length, incorrectTopics });
    setQuizState("results");
  }

  function restartQuiz() {
    setQuizState("idle");
    setQuizQuestions([]);
    setQuizAnswers({});
    setCurrentQuizQuestion(0);
    setQuizResults(null);
  }

  function goToQuestion(index: number) {
    setCurrentQuizQuestion(index);
  }

  function onProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setCurrentTime(ratio * duration);
    setPlaying(true);
  }

  return (
    <>
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
              <GlassCard>
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setPlaying((prev) => !prev)}
                    aria-label={playing ? t("pause") : t("play")}
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
                {(lecture.transcript as { time: string; text: string }[]).map((segment, index) => {
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
                    {(lecture.summary as string[]).map((point, i) => (
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

            <section>
              <FadeIn>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {t("quiz")}
                </div>
              </FadeIn>
              {quizState === "idle" && (
                <FadeIn delay={0.05}>
                  <GlassCard className="text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto text-indigo-500 dark:text-violet-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {t("quizTitle")}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                      {t("quizDescription")}
                    </p>
                    <button
                      onClick={generateQuiz}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        <>
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          {t("quizGenerating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {t("generateQuiz")}
                        </>
                      )}
                    </button>
                  </GlassCard>
                </FadeIn>
              )}
              {quizState === "loading" && (
                <FadeIn delay={0.05}>
                  <GlassCard className="text-center py-8">
                    <RotateCcw className="h-12 w-12 mx-auto text-indigo-500 animate-spin mb-4" />
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      {t("quizGenerating")}
                    </p>
                  </GlassCard>
                </FadeIn>
              )}
              {quizState === "active" && (
                <FadeIn delay={0.05}>
                  <GlassCard>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold">
                          {currentQuizQuestion + 1} / {quizQuestions.length}
                        </div>
                        <span className="text-sm text-slate-500 dark:text-zinc-400">
                          {t("quizQuestion")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {quizQuestions.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => goToQuestion(i)}
                            className={`h-2 w-2 rounded-full transition-colors ${
                              i === currentQuizQuestion
                                ? "bg-indigo-500"
                                : quizAnswers[i] !== undefined
                                ? "bg-emerald-500"
                                : "bg-slate-200 dark:bg-white/10"
                            }`}
                            aria-label={`Question ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mb-6">
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {quizQuestions[currentQuizQuestion]?.question}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {quizQuestions[currentQuizQuestion]?.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => answerQuizQuestion(currentQuizQuestion, i)}
                          disabled={quizAnswers[currentQuizQuestion] !== undefined}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            quizAnswers[currentQuizQuestion] !== undefined
                              ? i === quizQuestions[currentQuizQuestion].correctAnswer
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : i === quizAnswers[currentQuizQuestion]
                                ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : "border-slate-200 bg-white dark:bg-white/5"
                              : "border-slate-200 bg-white hover:border-purple-500/40 hover:bg-purple-500/5 dark:border-white/10 dark:bg-white/5 dark:hover:border-purple-500/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-sm font-bold">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {quizAnswers[currentQuizQuestion] !== undefined && i === quizQuestions[currentQuizQuestion].correctAnswer && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            )}
                            {quizAnswers[currentQuizQuestion] !== undefined && i === quizAnswers[currentQuizQuestion] && i !== quizQuestions[currentQuizQuestion].correctAnswer && (
                              <span className="h-5 w-5 text-rose-500">✕</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {quizAnswers[currentQuizQuestion] !== undefined && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
                        <p className="text-sm text-slate-600 dark:text-zinc-300">
                          <strong>{t("explanation")}:</strong> {quizQuestions[currentQuizQuestion]?.explanation}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                          {t("topic")}: {quizQuestions[currentQuizQuestion]?.topic}
                        </p>
                      </div>
                    )}
                  </GlassCard>
                </FadeIn>
              )}
              {quizState === "results" && quizResults && (
                <FadeIn delay={0.05}>
                  <GlassCard>
                    <div className="text-center py-6">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="h-24 w-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="8"
                            className="dark:stroke-white/10"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke={
                              quizResults.score >= 80
                                ? "#22c55e"
                                : quizResults.score >= 60
                                ? "#f59e0b"
                                : "#ef4444"
                            }
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 * (1 - quizResults.score / 100)}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {quizResults.score}%
                          </span>
                        </div>
                      </div>
                      <h3 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
                        {t("quizComplete")}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                        {t("quizScore", { correct: quizResults.correct, total: quizResults.total })}
                      </p>
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-emerald-500" />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {t("correctAnswers")}
                          </span>
                        </div>
                        <span className="text-lg font-extrabold text-emerald-500">
                          {quizResults.correct} / {quizResults.total}
                        </span>
                      </div>
                      {quizResults.incorrectTopics.length > 0 && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <p className="font-semibold text-rose-600 dark:text-rose-300 mb-2">
                            {t("topicsToReview")}
                          </p>
                          <ul className="space-y-1">
                            {quizResults.incorrectTopics.map((topic, i) => (
                              <li key={i} className="text-sm text-rose-600 dark:text-rose-300 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={restartQuiz}
                        className="btn-ghost flex-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t("retakeQuiz")}
                      </button>
                      <button
                        onClick={() => setQuizState("idle")}
                        className="btn-primary flex-1"
                      >
                        <Sparkles className="h-4 w-4" />
                        {t("backToLecture")}
                      </button>
                    </div>
                  </GlassCard>
                </FadeIn>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-[calc(100dvh-6rem)]">
            <FadeIn delay={0.1}>
              <GlassCard className="flex h-full min-h-[560px] flex-col p-0" interactive={false}>
                <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-2">
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
                    <button
                      onClick={() => setIsChatFullscreen(!isChatFullscreen)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                      aria-label={isChatFullscreen ? "Свернуть чат" : "Развернуть чат на весь экран"}
                    >
                      {isChatFullscreen ? <Minimize2 className="h-5 w-5 text-slate-500" /> : <Maximize2 className="h-5 w-5 text-slate-500" />}
                    </button>
                  </div>
                </div>

                {!isChatFullscreen && (
                  <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  {messages.map((message) => {
                    const isLong = message.sender === "ai" && message.text.length > 500;
                    const isExpanded = expandedMessageId === message.id;
                    return (
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
                          <div className="flex items-start justify-between gap-2">
                            <p className="flex-1">{isExpanded ? message.text : (isLong ? message.text.slice(0, 500) + "…" : message.text)}</p>
                            {isLong && (
                              <button
                                onClick={() => setExpandedMessageId(isExpanded ? null : message.id)}
                                className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                aria-label={isExpanded ? "Свернуть" : "Развернуть"}
                              >
                                {isExpanded ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
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
                    );
                  })}

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
              )}

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
    {isChatFullscreen && (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950" onClick={() => setIsChatFullscreen(false)}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
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
          <button
            onClick={() => setIsChatFullscreen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Свернуть чат"
          >
            <Minimize2 className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((message) => {
            const isLong = message.sender === "ai" && message.text.length > 500;
            const isExpanded = expandedMessageId === message.id;
            return (
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
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1">{isExpanded ? message.text : (isLong ? message.text.slice(0, 500) + "…" : message.text)}</p>
                    {isLong && (
                      <button
                        onClick={() => setExpandedMessageId(isExpanded ? null : message.id)}
                        className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                        aria-label={isExpanded ? "Свернуть" : "Развернуть"}
                      >
                        {isExpanded ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
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
            );
          })}
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
        <div className="space-y-2 border-t border-slate-200 px-5 py-3 dark:border-white/10 bg-white dark:bg-slate-900">
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
      </div>
    )}
    {expandedMessageId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setExpandedMessageId(null)}>
        <div
          className="glass-strong w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
            <h3 className="font-bold text-slate-900 dark:text-white">Развернутый ответ</h3>
            <button
              onClick={() => setExpandedMessageId(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none">
            {messages.find((m) => m.id === expandedMessageId)?.text.split("\n").map((paragraph, i) => (
              <p key={i} className="whitespace-pre-wrap">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
  );
}