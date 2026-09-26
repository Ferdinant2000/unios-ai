"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Clock, FolderOpen, Mic, Plus, Radio } from "lucide-react";
import { COURSES, getCourseById, PROFESSOR } from "@/lib/mock-hemis";
import { GlassCard, SectionLabel } from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import {
  DEMO_TEACHER_ID,
  getCurrentUserId,
  isLiveConfigured,
} from "@/lib/firebase";
import {
  createLiveLecture,
  subscribeLiveLecture,
  subscribeTeacherLectures,
  type LiveLecture,
} from "@/lib/live";
import LiveControlRoom from "../live/[id]/LiveControlRoom";

function isEnded(lecture: LiveLecture) {
  return lecture.status === "ended";
}

export default function ProfessorStudio() {
  const { t, lang } = useLanguage();

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [ended, setEnded] = useState<LiveLecture[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [current, setCurrent] = useState<LiveLecture | null>(null);

  const [courseId, setCourseId] = useState(COURSES[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const id = isLiveConfigured
        ? (await getCurrentUserId()) || DEMO_TEACHER_ID
        : DEMO_TEACHER_ID;
      if (!active) return;
      setTeacherId(id);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!teacherId) return;
    return subscribeTeacherLectures(teacherId, (lectures) => {
      setEnded(lectures.filter(isEnded));
    });
  }, [teacherId]);

  useEffect(() => {
    if (!currentId) return;
    return subscribeLiveLecture(currentId, setCurrent);
  }, [currentId]);

  const course = useMemo(() => getCourseById(courseId), [courseId]);

  const handleCreate = useCallback(async () => {
    if (creating) return;
    const trimmed = title.trim() || course?.title || t("recordLecture");
    setCreating(true);
    try {
      const id = await createLiveLecture({
        title: trimmed,
        topic: course?.title ?? "",
        teacherName: PROFESSOR.name,
      });
      setCurrentId(id);
    } finally {
      setCreating(false);
    }
  }, [creating, title, course, t]);

  const startFresh = useCallback(() => {
    setCurrentId(null);
    setCurrent(null);
  }, []);

  const formatDate = (value: number) =>
    new Date(value).toLocaleString(
      lang === "uz" ? "uz-UZ" : lang === "en" ? "en-US" : "ru-RU",
      { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
    );

  return (
    <main className="min-h-screen">
      <Header showBack user={PROFESSOR} />

      <div className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="flex flex-col gap-2 pt-8">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {t("teacherStudio")}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {t("recordLecture")}
          </h1>
        </section>

        {currentId && current ? (
          <div className="mt-8">
            <LiveControlRoom lectureId={currentId} lecture={current} />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href={`/student/lecture/${currentId}?teacher=1`} className="btn-ghost">
                <FolderOpen className="h-4 w-4" />
                {t("openInEditor")}
              </Link>
              <button onClick={startFresh} className="btn-ghost" type="button">
                <Plus className="h-4 w-4" />
                {t("newRecording")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <FadeIn>
                <SectionLabel icon={<Mic className="h-3.5 w-3.5" />}>
                  {t("newRecording")}
                </SectionLabel>
              </FadeIn>
              <FadeIn delay={0.05}>
                <GlassCard className="space-y-5">
                  <div>
                    <label
                      htmlFor="studio-course"
                      className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300"
                    >
                      {t("selectCourse")}
                    </label>
                    <select
                      id="studio-course"
                      value={courseId}
                      onChange={(event) => setCourseId(event.target.value)}
                      disabled={creating}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      {COURSES.map((courseItem) => (
                        <option key={courseItem.id} value={courseItem.id}>
                          {courseItem.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="studio-title"
                      className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300"
                    >
                      {t("recordingTitleLabel")}
                    </label>
                    <input
                      id="studio-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={course?.title ?? ""}
                      disabled={creating}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
                    />
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    type="button"
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      </span>
                    ) : (
                      <>
                        <Radio className="h-4 w-4" />
                        {t("startRecording")}
                      </>
                    )}
                  </button>
                </GlassCard>
              </FadeIn>
            </div>

            <div className="space-y-4 lg:col-span-7">
              <FadeIn>
                <SectionLabel icon={<Clock className="h-3.5 w-3.5" />}>
                  {t("recordedLectures")}
                </SectionLabel>
              </FadeIn>

              {ended.length === 0 ? (
                <FadeIn delay={0.05}>
                  <GlassCard>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      {t("noRecordingsYet")}
                    </p>
                  </GlassCard>
                </FadeIn>
              ) : (
                <div className="space-y-3">
                  {ended.map((lecture, index) => {
                    const courseItem = COURSES.find(
                      (item) => item.title === lecture.topic,
                    );
                    return (
                      <FadeIn key={lecture.id} delay={index * 0.04}>
                        <GlassCard className="flex items-center justify-between gap-3 p-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-500 dark:text-emerald-300">
                              <Check className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">
                                {lecture.title}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                                {courseItem?.code ?? lecture.topic} ·{" "}
                                {formatDate(lecture.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/student/lecture/${lecture.id}?teacher=1`}
                            className="btn-ghost !py-2 shrink-0"
                          >
                            {t("openInEditor")}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </GlassCard>
                      </FadeIn>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}