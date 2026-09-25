"use client";

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
} from "lucide-react";
import {
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
  { label: "AI", percentage: 92, score: "92%" },
  { label: "ECO", percentage: 84, score: "84%" },
  { label: "DB", percentage: 78, score: "78%" },
];

const STAT_ICONS = [BookOpen, Clock, CheckCircle2, MessageSquareText];

export default function StudentDashboard() {
  const { t } = useLanguage();
  const recentLectures = [...LECTURES].slice(0, 3);
  const [firstName, ...lastNameParts] = STUDENT.name.split(" ");

  const statLabels = [
    t("subjectsCount"),
    t("lecturesListened"),
    t("avgScore"),
    t("questionsAsked"),
  ];
  const statValues = [String(COURSES.length), "6", "86%", "14"];
  const statIcons = STAT_ICONS;

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden">
      <Header user={STUDENT} />

      <div className="mx-auto w-full max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6">
        <section>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {t("goodDay")},
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {firstName} <span className="text-gradient">{lastNameParts.join(" ")}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 dark:text-zinc-500">
            {STUDENT.hemisId}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statIcons.map((Icon, index) => (
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
                        {course.code}
                      </span>
                    </div>
                    <h3 className="truncate pr-2 text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                      {course.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-slate-400 dark:text-zinc-500">
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

        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6 xl:col-span-5">
            <FadeIn>
              <SectionLabel icon={<Clock className="h-3.5 w-3.5" />}>
                {t("lastLectures")}
              </SectionLabel>
            </FadeIn>

            {recentLectures.map((lecture, index) => {
              const course = COURSES.find((c) => c.id === lecture.courseId);
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
                          <p className="block w-full truncate text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                            {lecture.title}
                          </p>
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
                    {GPA_BARS.map((bar, index) => (
                      <div
                        key={bar.label}
                        className="flex h-full min-w-0 flex-1 flex-col items-center"
                      >
                        <span className="mb-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-400 sm:text-xs">
                          {bar.score}
                        </span>
                        <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                          <motion.div
                            className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-blue-600 via-indigo-600 to-purple-500 sm:max-w-[44px]"
                            style={{ height: `${bar.percentage}%` }}
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
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            <div>
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}