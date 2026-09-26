"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  Radio,
  Square,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addActiveMinutes,
  joinLiveLecture,
  markSectionListened,
  subscribeAttendees,
  subscribeSections,
  type LiveAttendee,
  type LiveLecture,
  type LiveSection,
} from "@/lib/live";
import { getCurrentUserId } from "@/lib/firebase";
import { speakText, stopSpeaking } from "@/lib/tts";
import { GlassCard, StatusPill } from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { STUDENT } from "@/lib/mock-hemis";
import type { TranslationKey } from "@/lib/translations";

function statusKey(status: LiveLecture["status"]): TranslationKey {
  if (status === "live") return "liveStatusLive";
  if (status === "ended") return "liveStatusEnded";
  return "liveStatusWaiting";
}

export default function LiveStudentView({
  lectureId,
  lecture,
}: {
  lectureId: string;
  lecture: LiveLecture;
}) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const studentName = user?.name ?? STUDENT.name;

  const [studentId, setStudentId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [sections, setSections] = useState<LiveSection[]>([]);
  const [attendees, setAttendees] = useState<LiveAttendee[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const listenedRef = useRef(new Set<string>());
  const initialSyncRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const self = useMemo(
    () => attendees.find((attendee) => attendee.id === studentId) ?? null,
    [attendees, studentId],
  );

  const live = lecture.status === "live";

  useEffect(() => {
    let active = true;
    getCurrentUserId().then((id) => {
      if (!active) return;
      setStudentId(id);
      joinLiveLecture(lectureId, studentName).then(() => {
        if (active) setJoined(true);
      });
    });
    return () => {
      active = false;
      stopSpeaking();
    };
  }, [lectureId]);

  useEffect(() => {
    if (!studentId) return;
    const off = subscribeSections(lectureId, (list) => {
      setSections(list);
      if (!initialSyncRef.current) {
        initialSyncRef.current = true;
        list.forEach((section) => listenedRef.current.add(section.id));
        return;
      }
      list.forEach((section) => {
        if (!listenedRef.current.has(section.id)) {
          listenedRef.current.add(section.id);
          void markSectionListened(lectureId, studentId);
        }
      });
    });
    return off;
  }, [lectureId, studentId]);

  useEffect(() => {
    const off = subscribeAttendees(lectureId, setAttendees);
    return off;
  }, [lectureId]);

  useEffect(() => {
    if (!studentId || !joined || !live) return;
    const timer = window.setInterval(() => {
      void addActiveMinutes(lectureId, studentId, 1);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [lectureId, studentId, joined, live]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sections]);

  const toggleSpeak = useCallback(
    (sectionId: string, text: string) => {
      if (speakingId === sectionId) {
        stopSpeaking();
        setSpeakingId(null);
        return;
      }
      const ok = speakText(text, lang);
      if (ok) setSpeakingId(sectionId);
    },
    [speakingId, lang],
  );

  const hintKey: TranslationKey = live
    ? "lectureLiveHint"
    : lecture.status === "ended"
      ? "lectureEndedHint"
      : "lectureNotStartedHint";

  return (
    <main className="min-h-screen">
      <Header showBack user={STUDENT} />

      <div className="mx-auto w-full max-w-4xl px-6 pb-20">
        <FadeIn>
          <div className="glass-strong mt-8 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-sky-300">
                    <Radio className="h-3 w-3" />
                    {t("liveTag", { title: lecture.title })}
                  </span>
                  <StatusPill
                    label={t(statusKey(lecture.status))}
                    active={live}
                  />
                  {joined && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("attendanceFixed")}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                  {lecture.title}
                </h1>
                <p className="mt-1 text-sm text-slate-400 dark:text-zinc-500">
                  {lecture.topic}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-zinc-500">
                  <span>{lecture.teacherName}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(lecture.createdAt).toLocaleDateString([], {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 gap-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-center">
                  <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                    {self?.activeMinutes ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {t("activeMinutesShort")}
                  </p>
                </div>
                <div className="w-px bg-slate-200 dark:bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold tabular-nums text-indigo-500 dark:text-violet-300">
                    {self?.listenedSectionsCount ?? 0}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {t("listenedSectionsShort")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            <Activity className="h-4 w-4 shrink-0 text-indigo-500" />
            {t(hintKey)}
          </div>
        </FadeIn>

        <section className="mt-8">
          <FadeIn>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                {t("liveSections")}
                <span className="ml-2 font-mono tabular-nums">
                  {sections.length}
                </span>
              </p>
              {speakingId && (
                <button
                  onClick={() => {
                    stopSpeaking();
                    setSpeakingId(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-300"
                >
                  <Square className="h-3 w-3 fill-current" />
                  {t("stopSound")}
                </button>
              )}
            </div>
          </FadeIn>

          <div className="mt-3 space-y-3">
            {sections.length === 0 ? (
              <FadeIn>
                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-white/10">
                  <p className="text-sm text-slate-400 dark:text-zinc-500">
                    {t("noSectionsYet")}
                  </p>
                </div>
              </FadeIn>
            ) : (
              sections.map((section, index) => (
                <FadeIn key={section.id} delay={Math.min(index * 0.03, 0.3)}>
                  <div
                    className={cn(
                      "glass flex flex-col gap-2 p-4 sm:flex-row sm:items-start",
                      index === sections.length - 1 &&
                        "border-blue-500/40 bg-blue-500/5",
                    )}
                  >
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-white">
                      #{index + 1}
                    </span>
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                      {section.text}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
                        {new Date(section.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() => toggleSpeak(section.id, section.text)}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 active:scale-95",
                          speakingId === section.id
                            ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20"
                            : "border border-slate-200 bg-white text-slate-500 hover:border-purple-500/40 hover:text-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
                        )}
                        aria-label={t("listen")}
                        title={t("listen")}
                      >
                        {speakingId === section.id ? (
                          <Square className="h-4 w-4 fill-current" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ))
            )}
            <div ref={endRef} />
          </div>
        </section>

        {lecture.status === "ended" && sections.length > 0 && (
          <FadeIn delay={0.1}>
            <div className="mt-8 text-center">
              <Link href={`/student`} className="btn-ghost">
                {t("backToDashboard")}
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </main>
  );
}