"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronRight,
  Loader2,
  Presentation,
  Radio,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  Avatar,
  GlassCard,
  SectionLabel,
} from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  CLASSROOM_ANALYTICS,
  COURSES,
  PROFESSOR,
} from "@/lib/mock-hemis";
import type { User } from "@/types";
import { createLiveLecture } from "@/lib/live";
import { DEMO_TEACHER_ID, getCurrentUserId, isLiveConfigured } from "@/lib/firebase";
import RequireRole from "@/components/auth/RequireRole";

const COURSE_ROWS = [
  { courseId: "c1", students: 184, comprehension: 92 },
  { courseId: "c2", students: 156, comprehension: 84 },
  { courseId: "c3", students: 121, comprehension: 78 },
];

const STAT_ICONS = [Radio, Users, TrendingUp, BarChart3];

export default function ProfessorDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();

  const headerUser: User = user
    ? {
        role: "professor",
        name: user.name,
        hemisId: user.email ?? user.uid,
        avatar: (user.name || "?").slice(0, 2).toUpperCase(),
      }
    : PROFESSOR;

  const [firstName, ...lastNameParts] = headerUser.name.split(" ");

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [creating, setCreating] = useState(false);
  const [profileId, setProfileId] = useState(DEMO_TEACHER_ID);

  useEffect(() => {
    if (isLiveConfigured) {
      let active = true;
      getCurrentUserId().then((id) => {
        if (active) setProfileId(id);
      });
      return () => {
        active = false;
      };
    }
    return undefined;
  }, []);

  async function handleCreateLecture(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || creating) return;
    setCreating(true);
    try {
      const id = await createLiveLecture({
        title,
        topic,
        teacherName: headerUser.name,
      });
      setModalOpen(false);
      router.push(`/professor/live/${id}`);
    } finally {
      setCreating(false);
    }
  }

  const statLabels = [
    t("activeCourses"),
    t("studentsOnline"),
    t("avgComprehension"),
    t("lecturesHeld"),
  ];
  const statValues = [String(COURSES.length), "184", "92%", "12"];
  const confusedTopics = [
    t("topicCrossPrice"),
    t("topicGradientVanishing"),
    t("topicBatchSize"),
  ];

  return (
    <RequireRole role="professor">
      <main className="min-h-screen">
        <Header user={headerUser} />

        <div className="mx-auto w-full max-w-6xl px-6 pb-20">
          <section className="flex flex-col gap-6 pt-8 md:flex-row md:items-end md:justify-between">
            <FadeIn>
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  {t("professor")}
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  {firstName} <span className="text-gradient">{lastNameParts.join(" ")}</span>
                </h1>
                <p className="mt-2 text-sm text-slate-400 dark:text-zinc-500">
                  {headerUser.hemisId}
                </p>
              </div>
            </FadeIn>
          <FadeIn delay={0.05}>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/professor/${profileId}`}
                className="btn-ghost !py-2.5"
              >
                <UserRound className="h-4 w-4" />
                {t("profilePage")}
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary !py-2.5"
              >
                <Presentation className="h-4 w-4" />
                {t("startLecture")}
              </button>
            </div>
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
                  {t("analyticsHeading")} · {t("neuralNetworks")}
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
                  {confusedTopics.map((topic) => (
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

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="glass-strong w-full max-w-md rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {t("startLecture")}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label={t("cancel")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-purple-500/40 hover:text-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  {t("lectureTitleLabel")}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("lectureTitlePlaceholder")}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  {t("lectureTopicLabel")}
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t("lectureTopicPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={creating || !title.trim() || !topic.trim()}
                className="btn-primary w-full !py-3"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Radio className="h-4 w-4" />
                )}
                {t("createLecture")}
              </button>
            </form>
          </div>
        </div>
      )}
      </main>
    </RequireRole>
  );
}