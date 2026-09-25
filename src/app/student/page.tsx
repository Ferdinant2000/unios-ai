"use client";

import Link from "next/link";
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
} from "lucide-react";
import {
  Avatar,
  GlassCard,
  SectionLabel,
} from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import {
  COURSES,
  LECTURES,
  STUDENT,
  getLecturesByCourse,
} from "@/lib/mock-hemis";

const GPA_BARS = [
  { label: "AI", value: 74, score: "92%" },
  { label: "ECO", value: 62, score: "84%" },
  { label: "DB", value: 55, score: "78%" },
];

const WEEK_TALKS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STAT_ICONS = [BookOpen, Clock, CheckCircle2, MessageSquareText];

export default function StudentDashboard() {
  const { t } = useLanguage();
  const recentLectures = [...LECTURES].slice(0, 3);

  const statLabels = [
    t("subjectsCount"),
    t("lecturesListened"),
    t("avgScore"),
    t("questionsAsked"),
  ];
  const statValues = [String(COURSES.length), "6", "86%", "14"];
  const statIcons = STAT_ICONS;

  return (
    <main className="min-h-screen">
      <Header user={STUDENT} />

      <div className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="pt-8">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {t("goodDay")},
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Фирдавсбек <span className="text-gradient">Комолитдинов</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 dark:text-zinc-500">
            {STUDENT.hemisId}
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statIcons.map((Icon, index) => (
            <FadeIn key={statLabels[index]} delay={index * 0.04}>
              <GlassCard className="p-5">
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

        <section className="mt-10">
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

          <div className="grid gap-4 md:grid-cols-3">
            {COURSES.map((course, index) => {
              const lecture = getLecturesByCourse(course.id)[0];
              const icons = [BookOpen, TrendingUp, Database];
              const Icon = icons[index % icons.length];
              return (
                <FadeIn key={course.id} delay={index * 0.05}>
                  <GlassCard className="group h-full">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                        {course.code}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                      {course.professorName}
                    </p>
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

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <FadeIn>
              <SectionLabel icon={<Clock className="h-3.5 w-3.5" />}>
                {t("lastLectures")}
              </SectionLabel>
            </FadeIn>

            {recentLectures.map((lecture, index) => {
              const course = COURSES.find((c) => c.id === lecture.courseId);
              return (
                <FadeIn key={lecture.id} delay={index * 0.05}>
                  <Link href={`/student/lecture/${lecture.id}`}>
                    <GlassCard className="flex items-center gap-4 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-300">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {lecture.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
                          {course?.title} · {course?.code} · {lecture.date}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs text-slate-400 dark:text-zinc-400">
                        <span>{t("fragments", { count: lecture.transcript.length })}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </GlassCard>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          <div className="space-y-6">
            <div>
              <FadeIn>
                <SectionLabel icon={<TrendingUp className="h-3.5 w-3.5" />}>
                  {t("progress")}
                </SectionLabel>
              </FadeIn>
              <FadeIn delay={0.05}>
                <GlassCard className="mt-4 p-5">
                  <div className="flex h-32 items-end justify-around gap-3 border-b border-slate-200 pb-2 dark:border-white/10">
                    {GPA_BARS.map((bar) => (
                      <div key={bar.label} className="flex w-full flex-col items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400">
                          {bar.score}
                        </span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600/80 to-purple-500/80"
                          style={{ height: `${bar.value}%` }}
                        />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-around text-[11px] text-slate-400 dark:text-zinc-500">
                    {WEEK_TALKS.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>

            <div>
              <FadeIn>
                <SectionLabel icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                  {t("integration")}
                </SectionLabel>
              </FadeIn>
              <FadeIn delay={0.05}>
                <GlassCard className="mt-4 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar name={STUDENT.name} size="sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        HEMIS
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-300">
                        ● {t("syncedWithHemis")}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                    {t("hemisSyncText")} {t("lastSync")}.
                  </p>
                </GlassCard>
              </FadeIn>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}