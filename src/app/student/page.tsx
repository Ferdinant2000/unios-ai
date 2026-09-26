"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  GraduationCap,
  Library,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  ArrowUpRight,
} from "lucide-react";
import {
  GlassCard,
  SectionLabel,
} from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthStore } from "@/stores/authStore";
import { COURSES, LECTURES, getLecturesByCourse } from "@/lib/mock-hemis";

const STAT_ICONS = [BookOpen, Clock, CheckCircle2, MessageSquareText];

interface CourseWithTitle {
  id: string;
  title: string;
  code: string;
  professorName: string;
}

interface StudentAnalytics {
  courseProgress: { courseId: string; progress: number; completedLectures: number; totalLectures: number }[];
  lectureCompletion: { lectureId: string; completed: boolean; progress: number }[];
  quizPerformance: { quizId: string; score: number; topic: string; weakTopics: string[] }[];
  attendance: { courseId: string; rate: number; total: number; present: number }[];
  recommendations: { id: string; type: string; title: string; message: string; priority: "high" | "medium" | "low" }[];
  upcomingLectures: { lectureId: string; title: string; date: string; courseId: string }[];
  recentActivity: { type: string; title: string; timestamp: string }[];
}

export default function StudentDashboard() {
  const { t } = useLanguage();
  const { user: student, isAuthenticated } = useAuthStore();
  const recentLectures = [...LECTURES].slice(0, 3);
  
  // The student from authStore has firstName/lastName, not name
  const studentData = student as { firstName: string; lastName: string; name?: string; hemisId: string } | null;
  const firstName = studentData?.firstName || "";
  const lastName = studentData?.lastName || "";
  
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics/student");
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const statLabels = [
    t("subjectsCount"),
    t("lecturesListened"),
    t("avgScore"),
    t("questionsAsked"),
  ];
  const statValues = [
    String(COURSES.length),
    analytics ? String(analytics.lectureCompletion.filter(l => l.completed).length) : "0",
    analytics ? `${Math.round(analytics.quizPerformance.reduce((sum, q) => sum + q.score, 0) / analytics.quizPerformance.length)}%` : "0%",
    "14",
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
      case "medium": return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default: return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-4 w-4" />;
      case "medium": return <Lightbulb className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated || !student) {
    return null;
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden">
      <Header user={student as unknown as { name: string; hemisId: string; firstName: string; lastName: string }} />

      <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6">
        <section>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {t("goodDay")},
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {firstName} <span className="text-gradient">{lastName}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 dark:text-zinc-500">
            {studentData?.hemisId}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_ICONS.map((Icon, index) => (
            <FadeIn key={statLabels[index]} delay={index * 0.04}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/15 to-purple-600/15 text-indigo-500 dark:text-violet-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {statValues[index]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {statLabels[index]}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </section>

        {/* AI Recommendations */}
        {analytics && analytics.recommendations.length > 0 && (
          <section>
            <FadeIn>
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel icon={<Lightbulb className="h-3.5 w-3.5" />}>
                  {t("aiRecommendations")}
                </SectionLabel>
              </div>
            </FadeIn>
            <div className="space-y-3">
              {analytics?.recommendations.slice(0, 3).map((rec, index) => (
                <FadeIn key={rec.id} delay={index * 0.05}>
                  <GlassCard className={`border-l-4 ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${getPriorityColor(rec.priority).replace("border-", "bg-").replace("text-", "text-")}`}>
                        {getPriorityIcon(rec.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {rec.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                          {rec.message}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 mt-1" />
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        <section>
          <FadeIn>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel icon={<Library className="h-3.5 w-3.5" />}>
                {t("myCourses")}
              </SectionLabel>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                {t("coursesConnected", { count: 3, total: 3 })}
              </span>
            </div>
          </FadeIn>

          <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {COURSES.map((course, index) => {
              const lecture = getLecturesByCourse(course.id)[0];
              const typedCourse = course as unknown as CourseWithTitle;
              const progress = analytics?.courseProgress.find(p => p.courseId === course.id);
              const icons = [BookOpen, TrendingUp, Database];
              const Icon = icons[index % icons.length];
              return (
                <FadeIn key={course.id} delay={index * 0.05}>
                  <GlassCard className="group h-full w-full">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                        {typedCourse.code}
                      </span>
                    </div>
                    <h3 className="truncate pr-2 text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                      {typedCourse.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-slate-400 dark:text-zinc-500">
                      {typedCourse.professorName}
                    </p>
                    {progress && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-zinc-400">{t("courseProgress")}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{progress.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full dark:bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.progress}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                          {progress.completedLectures} / {progress.totalLectures} {t("lecturesCompleted")}
                        </p>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        {t("lecturesSynced", { count: getLecturesByCourse(course.id).length })}
                      </span>
                      {lecture && (
                        <Link
                          href={`/student/lecture/${lecture.id}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-indigo-500 transition-colors hover:text-indigo-400 dark:text-violet-300 dark:hover:text-violet-200"
                        >
                          {t("open")}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </GlassCard>
                </FadeIn>
              );
            })}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6 xl:col-span-5">
            <FadeIn>
              <SectionLabel icon={<Clock className="h-3.5 w-3.5" />}>
                {t("lastLectures")}
              </SectionLabel>
            </FadeIn>

            {recentLectures.map((lecture, index) => {
              const course = COURSES.find((c) => c.id === lecture.courseId) as CourseWithTitle | undefined;
              const completion = analytics?.lectureCompletion.find(l => l.lectureId === lecture.id);
              return (
                <FadeIn key={lecture.id} delay={index * 0.05}>
                  <Link
                    href={`/student/lecture/${lecture.id}`}
                    className="block w-full min-w-0"
                  >
                    <div className="flex w-full min-w-0 items-center justify-between gap-2.5 rounded-xl border border-slate-200/70 bg-white/60 p-3 backdrop-blur-sm transition-all duration-150 hover:scale-[1.01] hover:border-purple-500/40 active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.06] sm:p-4">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-300">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <p className="block w-full truncate text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                              {lecture.title}
                            </p>
                            {completion && (
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${completion.completed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                                {completion.completed ? t("completed") : `${completion.progress}%`}
                              </span>
                            )}
                          </div>
                          <p className="block w-full truncate text-[11px] text-slate-500 dark:text-zinc-400 sm:text-xs">
                            {course?.title} · {course?.code} · {lecture.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap pl-1 text-xs text-slate-400 dark:text-zinc-400">
                        <span>{t("fragments", { count: lecture.transcript.length })}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-6 xl:col-span-7">
            <div>
              <FadeIn>
                <SectionLabel icon={<TrendingUp className="h-3.5 w-3.5" />}>
                  {t("progress")}
                </SectionLabel>
              </FadeIn>
              <FadeIn delay={0.05}>
                <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/60 p-3.5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] sm:p-5">
                  <div className="flex h-40 w-full items-end justify-around px-1 pb-2 pt-6 sm:h-48">
                    {analytics?.quizPerformance.map((quiz, index) => (
                      <div
                        key={quiz.quizId}
                        className="flex h-full min-w-0 flex-1 flex-col items-center"
                      >
                        <span className="mb-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-400 sm:text-xs">
                          {quiz.score}%
                        </span>
                        <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                          <motion.div
                            className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-blue-600 via-indigo-600 to-purple-500 sm:max-w-[44px]"
                            style={{ height: `${quiz.score}%` }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                              duration: 0.6,
                              delay: 0.2 + index * 0.1,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                        <span className="mt-1.5 w-full truncate text-center text-[10px] font-bold text-slate-500 dark:text-zinc-400 sm:text-xs">
                          {quiz.topic.split(" ").slice(0, 2).join(" ")}
                        </span>
                      </div>
                    ))}
                    {!analytics?.quizPerformance.length && (
                      <>
                        <div key="ai" className="flex h-full min-w-0 flex-1 flex-col items-center">
                          <span className="mb-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-400 sm:text-xs">92%</span>
                          <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                            <motion.div className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-blue-600 via-indigo-600 to-purple-500 sm:max-w-[44px]" style={{ height: "92%" }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} />
                          </div>
                          <span className="mt-1.5 w-full truncate text-center text-[10px] font-bold text-slate-500 dark:text-zinc-400 sm:text-xs">AI</span>
                        </div>
                        <div key="eco" className="flex h-full min-w-0 flex-1 flex-col items-center">
                          <span className="mb-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-400 sm:text-xs">84%</span>
                          <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                            <motion.div className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-blue-600 via-indigo-600 to-purple-500 sm:max-w-[44px]" style={{ height: "84%" }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }} />
                          </div>
                          <span className="mt-1.5 w-full truncate text-center text-[10px] font-bold text-slate-500 dark:text-zinc-400 sm:text-xs">ECO</span>
                        </div>
                        <div key="db" className="flex h-full min-w-0 flex-1 flex-col items-center">
                          <span className="mb-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-400 sm:text-xs">78%</span>
                          <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                            <motion.div className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-blue-600 via-indigo-600 to-purple-500 sm:max-w-[44px]" style={{ height: "78%" }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }} />
                          </div>
                          <span className="mt-1.5 w-full truncate text-center text-[10px] font-bold text-slate-500 dark:text-zinc-400 sm:text-xs">DB</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Quiz Performance Details */}
            {analytics && analytics.quizPerformance.length > 0 && (
              <div>
                <FadeIn>
                  <SectionLabel icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                    {t("quizPerformance")}
                  </SectionLabel>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <GlassCard>
                    <div className="space-y-3">
                      {analytics?.quizPerformance.map((quiz, index) => (
                        <div key={quiz.quizId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${quiz.score >= 80 ? "bg-emerald-500/10" : quiz.score >= 60 ? "bg-amber-500/10" : "bg-rose-500/10"}`}>
                              <CheckCircle2 className={`h-4 w-4 ${quiz.score >= 80 ? "text-emerald-500" : quiz.score >= 60 ? "text-amber-500" : "text-rose-500"}`} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">{quiz.topic}</p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">{quiz.weakTopics.length > 0 ? t("weakTopics") + ": " + quiz.weakTopics.join(", ") : t("goodPerformance")}</p>
                            </div>
                          </div>
                          <span className={`font-bold text-lg ${quiz.score >= 80 ? "text-emerald-500" : quiz.score >= 60 ? "text-amber-500" : "text-rose-500"}`}>
                            {quiz.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </FadeIn>
              </div>
            )}

            {/* Upcoming Lectures */}
            {analytics && analytics.upcomingLectures.length > 0 && (
              <div>
                <FadeIn>
                  <SectionLabel icon={<Clock className="h-3.5 w-3.5" />}>
                    {t("upcomingLectures")}
                  </SectionLabel>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <GlassCard>
                    <div className="space-y-2">
                      {analytics?.upcomingLectures.map((lecture, index) => (
                        <Link key={lecture.lectureId} href={`/student/lecture/${lecture.lectureId}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-300">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">{lecture.title}</p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">{lecture.date}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  </GlassCard>
                </FadeIn>
              </div>
            )}

            {/* Recent Activity */}
            {analytics && analytics.recentActivity.length > 0 && (
              <div>
                <FadeIn>
                  <SectionLabel icon={<MessageSquareText className="h-3.5 w-3.5" />}>
                    {t("recentActivity")}
                  </SectionLabel>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <GlassCard>
                    <div className="space-y-2">
                      {analytics?.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <MessageSquareText className="h-3 w-3" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-zinc-300 flex-1">{activity.title}</p>
                          <span className="text-xs text-slate-400 dark:text-zinc-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </FadeIn>
              </div>
            )}
          </div>
        </section>

        <section>
          <FadeIn>
            <SectionLabel icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              {t("integration")}
            </SectionLabel>
          </FadeIn>
          <FadeIn delay={0.05}>
            <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/50 p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06]">
              <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="min-w-0 truncate text-sm font-bold text-slate-900 dark:text-white">
                    HEMIS
                  </p>
                </div>
                <span className="flex-shrink-0 whitespace-nowrap rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                  {t("syncedWithHemis")}
                </span>
              </div>
              <p className="w-full break-words text-xs leading-relaxed text-slate-500 dark:text-zinc-400 sm:text-sm">
                {t("hemisSyncText")} {t("lastSync")}.
              </p>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}