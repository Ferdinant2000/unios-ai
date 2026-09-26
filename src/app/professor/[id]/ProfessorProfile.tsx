"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Archive, Clock, Presentation, Radio, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  subscribeTeacherLectures,
  type LiveLecture,
  type LiveStatus,
} from "@/lib/live";
import { GlassCard, SectionLabel, StatusPill } from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { PROFESSOR } from "@/lib/mock-hemis";
import type { TranslationKey } from "@/lib/translations";

const STATUS_KEYS: Record<LiveStatus, TranslationKey> = {
  waiting: "liveStatusWaiting",
  live: "liveStatusLive",
  ended: "liveStatusEnded",
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProfessorProfile() {
  const params = useParams<{ id: string }>();
  const teacherId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { t } = useLanguage();

  const [lectures, setLectures] = useState<LiveLecture[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const off = subscribeTeacherLectures(teacherId, (list) => {
      setLectures(list);
      setLoaded(true);
    });
    return off;
  }, [teacherId]);

  const ongoing = useMemo(
    () => lectures.filter((lecture) => lecture.status !== "ended"),
    [lectures],
  );
  const archive = useMemo(
    () => lectures.filter((lecture) => lecture.status === "ended"),
    [lectures],
  );

  return (
    <main className="min-h-screen">
      <Header showBack user={PROFESSOR} />

      <div className="mx-auto w-full max-w-5xl px-6 pb-20">
        <FadeIn>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {t("professor")} · {t("profilePage")}
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                {PROFESSOR.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400 dark:text-zinc-500">
                {PROFESSOR.hemisId}
              </p>
            </div>
            <Link href="/professor" className="btn-primary">
              <Presentation className="h-4 w-4" />
              {t("startLecture")}
            </Link>
          </div>
        </FadeIn>

        <section className="mt-8">
          <FadeIn>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel icon={<Zap className="h-3.5 w-3.5" />}>
                {t("ongoingLectures")}
              </SectionLabel>
              <span className="text-xs tabular-nums text-slate-400 dark:text-zinc-500">
                {ongoing.length}
              </span>
            </div>
          </FadeIn>

          {loaded && ongoing.length === 0 ? (
            <FadeIn>
              <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center dark:border-white/10">
                <p className="text-sm text-slate-400 dark:text-zinc-500">
                  {t("noOngoingLectures")}
                </p>
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-3">
              {ongoing.map((lecture, index) => (
                <FadeIn key={lecture.id} delay={index * 0.05}>
                  <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {lecture.title}
                        </h3>
                        <StatusPill
                          label={t(STATUS_KEYS[lecture.status])}
                          active={lecture.status === "live"}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                        {lecture.topic}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(lecture.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        href={`/student/lecture/${lecture.id}`}
                        className="btn-ghost !py-2"
                      >
                        <Radio className="h-4 w-4" />
                        {t("watchLive")}
                      </Link>
                      <Link
                        href={`/professor/live/${lecture.id}`}
                        className="btn-primary !py-2"
                      >
                        {t("enterStudio")}
                      </Link>
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <FadeIn>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel icon={<Archive className="h-3.5 w-3.5" />}>
                {t("archiveLectures")}
              </SectionLabel>
              <span className="text-xs tabular-nums text-slate-400 dark:text-zinc-500">
                {archive.length}
              </span>
            </div>
          </FadeIn>

          {loaded && archive.length === 0 ? (
            <FadeIn>
              <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center dark:border-white/10">
                <p className="text-sm text-slate-400 dark:text-zinc-500">
                  {t("noArchivedLectures")}
                </p>
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-3">
              {archive.map((lecture, index) => (
                <FadeIn key={lecture.id} delay={index * 0.05}>
                  <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={cn(
                            "font-bold",
                            "text-slate-700 dark:text-zinc-200",
                          )}
                        >
                          {lecture.title}
                        </h3>
                        <StatusPill label={t("liveStatusEnded")} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                        {lecture.topic}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(lecture.createdAt)}
                      </p>
                    </div>
                    <Link
                      href={`/student/lecture/${lecture.id}`}
                      className="btn-ghost shrink-0 !py-2"
                    >
                      <Archive className="h-4 w-4" />
                      {t("viewArchive")}
                    </Link>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}