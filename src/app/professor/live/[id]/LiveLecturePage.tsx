"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  Wand2,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseById } from "@/lib/mock-hemis";
import { GlassCard } from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { PROFESSOR } from "@/lib/mock-hemis";

interface FeedEvent {
  id: number;
  text: string;
  time: string;
}

interface LiveAnalytics {
  activeStudents: number;
  engagement: number;
  questions: number;
  confusedTopics: { topic: string; percentage: number }[];
  comprehensionRate: number;
  energyLevel: number;
}

function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

async function fetchAnalytics(courseId: string): Promise<LiveAnalytics> {
  const res = await fetch(`/api/analytics/live?courseId=${courseId}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const data = await res.json();
  return data.analytics;
}

async function postAnalyticsAction(
  courseId: string,
  action: "join" | "leave" | "question" | "quiz_answer" | "topic_confused",
  topic?: string
) {
  await fetch("/api/analytics/live", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, action, topic }),
  });
}

export default function LiveLecturePageClient() {
  const params = useParams<{ id: string }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { t } = useLanguage();
  const course = useMemo(() => getCourseById(courseId), [courseId]);

  const [analytics, setAnalytics] = useState<LiveAnalytics | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [generating, setGenerating] = useState(false);
  const [sentQuiz, setSentQuiz] = useState(false);
  const [explained, setExplained] = useState(false);
  const [lastExplainTopic, setLastExplainTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [joinedStudents, setJoinedStudents] = useState<Array<{ id: string; name: string; avatar: string; joinedAt: string }>>([]);

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchAnalytics(courseId);
        setAnalytics(data);
        setFeed([
          { id: 1, text: t("feed1", { topic: t("topicGradientVanishing") }), time: nowTime() },
          { id: 2, text: t("feed6", { n: 18 }), time: nowTime() },
          { id: 3, text: t("feed7", { topic: "Cross-price elasticity" }), time: nowTime() },
        ]);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [courseId, t]);

  useEffect(() => {
    if (!analytics) return;
    
    const interval = setInterval(async () => {
      try {
        const data = await fetchAnalytics(courseId);
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to poll analytics:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [courseId, analytics]);

  if (!course) {
    return (
      <main className="min-h-screen">
        <Header showBack user={PROFESSOR} />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center">
            <p className="font-bold text-slate-900 dark:text-white">
              {t("courseNotFound")}
            </p>
            <Link href="/professor" className="btn-ghost mt-4">
              {t("backToProfessor")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header showBack user={PROFESSOR} />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-indigo-500 mb-4" />
            <p className="text-slate-500 dark:text-zinc-400">Loading live analytics...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="min-h-screen">
        <Header showBack user={PROFESSOR} />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center">
            <p className="font-bold text-slate-900 dark:text-white">
              Failed to load analytics
            </p>
          </div>
        </div>
      </main>
    );
  }

  const activeStudentsCount = analytics.activeStudents;
  const comprehension = analytics.comprehensionRate;
  const energized = analytics.energyLevel;

  const ringRadius = 62;
  const circumference = 2 * Math.PI * ringRadius;
  const comprehensionOffset = circumference * (1 - comprehension / 100);

  const currentTopic =
    comprehension > 90 ? t("topicBatchSize") : t("topicCrossPrice");

  const topics = analytics.confusedTopics.map((ct, index) => ({
    name: ct.topic,
    percentage: ct.percentage,
    meta: index === 0 ? t("wrongAnswers") : t("repeats"),
  }));

  async function fetchStudents() {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/lecture-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_students", sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setJoinedStudents(data.students || []);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  }

  const handleStartLecture = useCallback(async () => {
    try {
      const res = await fetch("/api/lecture-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          lectureId: "lec-eco-elasticity",
          professorId: "teacher-1",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.sessionId);
        setFeed((prev) => [
          { id: Date.now(), text: "Lecture started. Students can now join.", time: nowTime() },
          ...prev.slice(0, 5),
        ]);
        // Start polling for students
        const interval = setInterval(fetchStudents, 2000);
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error("Failed to start lecture:", error);
    }
  }, []);

  const handleGenerateExplanation = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setExplained(false);
    setLastExplainTopic(null);
    
    // Call AI explain API
    try {
      await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId: "lec-eco-elasticity", topic: currentTopic }),
      });
    } catch (error) {
      console.error("Failed to generate explanation:", error);
    }
    
    setTimeout(() => {
      setGenerating(false);
      setExplained(true);
      setLastExplainTopic(currentTopic);
      setFeed((prev) => [
        { id: Date.now(), text: t("feed9", { topic: currentTopic }), time: nowTime() },
        ...prev.slice(0, 5),
      ]);
    }, 2000);
  }, [generating, currentTopic, t]);

  const handleSendQuiz = useCallback(async () => {
    setSentQuiz(true);
    setFeed((prev) => [
      {
        id: Date.now(),
        text: t("feed8", { n: 5, m: 2 }),
        time: nowTime(),
      },
      ...prev.slice(0, 5),
    ]);
    await postAnalyticsAction(courseId, "quiz_answer");
    setTimeout(() => setSentQuiz(false), 4000);
  }, [t, courseId]);

  const integrationRows = [
    { label: t("recordLabel"), status: t("statusUploading"), tone: "text-slate-400 dark:text-zinc-400" },
    { label: t("transcriptLabel"), status: t("statusReady", { count: 4 }), tone: "text-emerald-500 dark:text-emerald-300" },
    { label: t("aiNotes"), status: t("statusUpdated"), tone: "text-emerald-500 dark:text-emerald-300" },
    { label: t("quizResults"), status: t("statusEndOfClass"), tone: "text-slate-400 dark:text-zinc-300" },
  ];

  interface CourseWithTitle {
  id: string;
  title: string;
  code: string;
  professorName: string;
}

  const typedCourse = course as unknown as CourseWithTitle;

  return (
    <main className="min-h-screen">
      <Header showBack user={PROFESSOR} />

      <div className="mx-auto w-full max-w-7xl px-6 pb-20">
        <FadeIn>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-500 dark:text-rose-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 animate-live-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                </span>
                {t("liveTag", { title: typedCourse.title })}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                <RefreshCw className="h-3 w-3 animate-spin" />
                {t("recording")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-zinc-400">
              <Activity className="h-4 w-4 text-emerald-500" />
              {t("audienceInfo", { n: activeStudentsCount > 185 ? 8 : 2 })}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="glass-strong mb-6 mt-5 flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/25 to-purple-600/25 text-indigo-500 dark:text-violet-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {activeStudentsCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {t("studentsOnline")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 dark:text-emerald-300">
              <Activity className="h-4 w-4" />
              {t("audienceInfo", { n: activeStudentsCount > 185 ? 8 : 2 })}
            </div>
          </div>
        </FadeIn>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <FadeIn>
              <GlassCard className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                <div className="relative h-44 w-44 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={ringRadius}
                      fill="none"
                      stroke="rgba(148,163,184,0.2)"
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
                        <stop offset="0%" stopColor="#0052FF" />
                        <stop offset="50%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                      {comprehension}%
                    </span>
                    <span className="mt-1 text-[11px] text-slate-400 dark:text-zinc-400">
                      {t("comprehensionWidget")}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {t("comprehensionWidget")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                    {t("comprehensionDesc")}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-6">
                    <div>
                      <p className="text-lg font-extrabold text-emerald-500 dark:text-emerald-300">
                        +3%
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                        {t("dynamics")}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {energized}%
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                        {t("energyGroup")}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.05}>
              <GlassCard>
                <div className="mb-4 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("confusedTopics")}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {topics.map((topic, index) => (
                    <li
                      key={topic.name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                            index === 0
                              ? "bg-rose-500/20 text-rose-500 dark:text-rose-300"
                              : "bg-amber-500/20 text-amber-500 dark:text-amber-300",
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 dark:text-zinc-200">
                            {topic.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full dark:bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-700"
                                style={{ width: `${topic.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 w-10 text-right">
                              {topic.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                        {topic.meta}
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.1}>
              <GlassCard>
                <div className="mb-4 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-indigo-500 dark:text-sky-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("aiEvents")}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {feed.map((event) => (
                    <li
                      key={event.id}
                      className="animate-fade-up flex items-start gap-3 text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <p className="flex-1 leading-relaxed text-slate-600 dark:text-zinc-300">
                        {event.text}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
                        {event.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </FadeIn>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <FadeIn>
              <GlassCard className="space-y-3 p-5" interactive={false}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500 dark:text-violet-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("liveTools")}
                  </h3>
                </div>

                {!sessionId ? (
                  <button
                    onClick={handleStartLecture}
                    className="btn-primary w-full"
                  >
                    <Users className="h-4 w-4" />
                    {t("startLecture")}
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl">
                      <UserCheck className="h-3 w-3" />
                      <span>{t("lectureLive")}</span>
                      <span className="ml-auto font-mono">{joinedStudents.length} {t("studentsInRoom")}</span>
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
                      {t("generateExplanation")}
                    </button>
                  </>
                )}

                {explained && (
                  <p className="animate-fade-up flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-600 dark:text-emerald-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {t("explanationSent", { topic: lastExplainTopic ?? "" })}
                  </p>
                )}

                <button
                  onClick={handleSendQuiz}
                  disabled={sentQuiz}
                  className={cn(
                    "w-full",
                    sentQuiz
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200"
                      : "btn-ghost",
                  )}
                >
                  {sentQuiz ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t("quizSent")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("sendQuiz")}
                    </>
                  )}
                </button>
                <p className="text-[11px] leading-relaxed text-slate-400 dark:text-zinc-500">
                  {t("quizHint")}
                </p>
              </GlassCard>
            </FadeIn>

            {/* Class Room - Students in session */}
            {sessionId && (
              <FadeIn delay={0.1}>
                <GlassCard className="space-y-3 p-5" interactive={false}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t("classRoom")}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {joinedStudents.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {joinedStudents.length > 0 ? (
                      joinedStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-white/5"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                            {student.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                              Joined: {new Date(student.joinedAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <UserCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-500 dark:text-zinc-400">
                        <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t("noStudentsYet")}</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </FadeIn>
            )}

            <FadeIn delay={0.05}>
              <GlassCard interactive={false}>
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("hemisIntegration")}
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-500 dark:text-zinc-400">
                  {integrationRows.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between"
                    >
                      <span>{row.label}</span>
                      <span className={row.tone}>{row.status}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </FadeIn>
          </aside>
        </section>
      </div>
    </main>
  );
}