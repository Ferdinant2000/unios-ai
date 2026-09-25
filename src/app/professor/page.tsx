"use client";

import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Presentation,
  Radio,
  TrendingUp,
  Users,
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
  CLASSROOM_ANALYTICS,
  COURSES,
  PROFESSOR,
} from "@/lib/mock-hemis";

const COURSE_ROWS = [
  { courseId: "c1", students: 184, comprehension: 92 },
  { courseId: "c2", students: 156, comprehension: 84 },
  { courseId: "c3", students: 121, comprehension: 78 },
];

const STAT_ICONS = [Radio, Users, TrendingUp, BarChart3];

export default function ProfessorDashboard() {
  const { t } = useLanguage();

  const statLabels = [
    t("activeCourses"),
    t("studentsOnline"),
    t("avgComprehension"),
    t("lecturesHeld"),
  ];
  const statValues = [String(COURSES.length), "184", "92%", "12"];

  return (
    <main className="min-h-screen">
      <Header user={PROFESSOR} />

      <div className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="flex flex-col gap-6 pt-8 md:flex-row md:items-end md:justify-between">
          <FadeIn>
            <div>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {t("professor")}
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Акмал <span className="text-gradient">Рахимов</span>
              </h1>
              <p className="mt-2 text-sm text-slate-400 dark:text-zinc-500">
                {PROFESSOR.hemisId}
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <Link href="/professor/live/c1" className="btn-primary">
              <Presentation className="h-4 w-4" />
              {t("startLive")}
            </Link>
          </FadeIn>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_ICONS.map((Icon, index) => (
            <FadeIn key={statLabels[index]} delay={index * 0.04}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-purple-600/15 text-indigo-500 dark:text-violet-300">
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
              <SectionLabel icon={<BarChart3 className="h-3.5 w-3.5" />}>
                {t("manageCourses")}
              </SectionLabel>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                {t("syncedWithHemis")}
              </span>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {COURSES.map((course, index) => {
              const row = COURSE_ROWS.find((r) => r.courseId === course.id);
              return (
                <FadeIn key={course.id} delay={index * 0.05}>
                  <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {course.title}
                          </h3>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                            {course.code}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                          {course.professorName}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {row?.students}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                          {t("studentsLabel")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={
                            (row?.comprehension ?? 0) >= 85
                              ? "text-lg font-extrabold text-emerald-500 dark:text-emerald-300"
                              : "text-lg font-extrabold text-slate-900 dark:text-zinc-200"
                          }
                        >
                          {row?.comprehension}%
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                          {t("comprehensionLabel")}
                        </p>
                      </div>
                      <Link href={`/professor/live/${course.id}`} className="btn-ghost !py-2">
                        <Presentation className="h-4 w-4" />
                        {t("liveAnalytics")}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </GlassCard>
                </FadeIn>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <FadeIn>
            <SectionLabel icon={<TrendingUp className="h-3.5 w-3.5" />}>
              {t("analyticsHeading")}
            </SectionLabel>
          </FadeIn>
          <FadeIn delay={0.05}>
            <GlassCard className="mt-4 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("analyticsHeading")} · «Нейронные сети»
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-zinc-400">
                  {t("analyticsText")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-300">
                    {CLASSROOM_ANALYTICS.comprehensionRate}%
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                    {t("comprehensionBig")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CLASSROOM_ANALYTICS.confusedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}