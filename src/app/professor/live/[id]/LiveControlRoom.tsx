"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ClipboardCopy,
  Mic,
  Radio,
  Square,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addLiveSection,
  setLiveLectureStatus,
  subscribeAttendees,
  subscribeSections,
  type LiveAttendee,
  type LiveLecture,
  type LiveSection,
} from "@/lib/live";
import { createSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/speech";
import { createMicRecorder, isRecorderSupported } from "@/lib/recorder";
import { GlassCard, SectionLabel } from "@/components/primitives";
import QrCode from "@/components/ui/QrCode";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { PROFESSOR } from "@/lib/mock-hemis";
import { stopSpeaking } from "@/lib/tts";
import type { TranslationKey } from "@/lib/translations";

const AUTO_FLUSH_MS = 15_000;

function statusKey(status: LiveLecture["status"]): TranslationKey {
  if (status === "live") return "liveStatusLive";
  if (status === "ended") return "liveStatusEnded";
  return "liveStatusWaiting";
}

export default function LiveControlRoom({
  lectureId,
  lecture,
}: {
  lectureId: string;
  lecture: LiveLecture;
}) {
  const { t, lang } = useLanguage();

  const joinUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://unios-ai.vercel.app";
    const base = process.env.NEXT_PUBLIC_QR_URL || origin;
    return `${base}/student/lecture/${lectureId}`;
  }, [lectureId]);

  const [attendees, setAttendees] = useState<LiveAttendee[]>([]);
  const [sections, setSections] = useState<LiveSection[]>([]);

  const [recording, setRecording] = useState(false);
  const [draft, setDraft] = useState("");
  const [sttError, setSttError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const bufferRef = useRef("");
  const flushTimerRef = useRef<number | null>(null);
  const recorderRef = useRef<{
    stop: () => Promise<{ dataUrl: string; durationMs: number } | null>;
  } | null>(null);
  const recordingActiveRef = useRef(false);

  const speechLang =
    lang === "uz" ? "uz-UZ" : lang === "en" ? "en-US" : "ru-RU";

  useEffect(() => {
    return () => {
      stopSpeaking();
      recognitionRef.current?.stop();
      recorderRef.current?.stop();
      if (flushTimerRef.current) window.clearInterval(flushTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const offAttendees = subscribeAttendees(lectureId, setAttendees);
    const offSections = subscribeSections(lectureId, setSections);
    return () => {
      offAttendees();
      offSections();
    };
  }, [lectureId]);

  // Создаёт сессию записи микрофона для текущего окна flush'а
  const startWindowRecorder = useCallback(async () => {
    if (!recordingActiveRef.current) return;
    if (!isRecorderSupported()) return;
    const recorder = await createMicRecorder();
    recorderRef.current = recorder;
  }, []);

  /**
   * Сбрасывает буфер распознанной речи в секцию. Если в этот момент
   * активен микрофон — к секции прикрепляется аудиосегмент с точным
   * таймстампом и длительностью.
   */
  const flushBufferWithAudio = useCallback(
    async (restartWindow: boolean) => {
      const text = bufferRef.current.trim();
      const recorder = recorderRef.current;
      let audioUrl: string | null = null;
      let duration: number | undefined;

      if (recorder) {
        const result = await recorder.stop();
        recorderRef.current = null;
        if (result && result.dataUrl.length <= 900_000) {
          audioUrl = result.dataUrl;
          duration = result.durationMs;
        }
      }

      if (text) {
        await addLiveSection(lectureId, { text, audioUrl, duration });
      }

      bufferRef.current = "";
      setDraft("");

      if (restartWindow && recordingActiveRef.current) {
        await startWindowRecorder();
      }
    },
    [lectureId, startWindowRecorder],
  );

  const stopRecognition = useCallback(async () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (flushTimerRef.current) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    recordingActiveRef.current = false;
    await flushBufferWithAudio(false);
    setRecording(false);
  }, [flushBufferWithAudio]);

  const startRecognition = useCallback(() => {
    setSttError(null);
    if (!isSpeechRecognitionSupported()) {
      setSttError(t("sttUnsupported"));
      return;
    }
    const handle = createSpeechRecognition({
      lang: speechLang,
      onRecognized: (segment) => {
        if (segment.isFinal && segment.text.trim()) {
          if (bufferRef.current) bufferRef.current += " ";
          bufferRef.current += segment.text.trim();
          setDraft(bufferRef.current);
        }
      },
      onError: (error) => {
        if (error === "not-allowed" || error === "service-not-allowed") {
          setSttError(t("micAccessDenied"));
          recognitionRef.current = null;
          setRecording(false);
        }
      },
    });
    if (!handle) {
      setSttError(t("sttUnsupported"));
      return;
    }
    recognitionRef.current = handle;
    recordingActiveRef.current = true;
    setRecording(true);
    void startWindowRecorder();
    flushTimerRef.current = window.setInterval(() => {
      void flushBufferWithAudio(true);
    }, AUTO_FLUSH_MS);
  }, [speechLang, t, flushBufferWithAudio, startWindowRecorder]);

  const endLesson = useCallback(async () => {
    await stopRecognition();
    await setLiveLectureStatus(lectureId, "ended");
  }, [lectureId, stopRecognition]);

  const copyJoinLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть заблокирован — показать ссылку в поле
    }
  }, [joinUrl]);

  const live = lecture.status === "live";
  const ended = lecture.status === "ended";

  return (
    <main className="min-h-screen">
      <Header showBack user={PROFESSOR} />

      <div className="mx-auto w-full max-w-6xl px-6 pb-20">
        <FadeIn>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold",
                    live
                      ? "border-rose-500/40 bg-rose-500/15 text-rose-500 dark:text-rose-300"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-2 w-2",
                      live && "animate-live-ping rounded-full bg-rose-400",
                    )}
                  >
                    {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />}
                    <span className={cn("relative inline-flex h-2 w-2 rounded-full", live ? "bg-rose-400" : "bg-amber-400")} />
                  </span>
                  {t("liveTag", { title: lecture.title })}
                </span>
                <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-500 dark:text-violet-300">
                  {t(statusKey(lecture.status))}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                {lecture.title}
              </h1>
              <p className="mt-1 text-sm text-slate-400 dark:text-zinc-500">
                {lecture.topic}
              </p>
            </div>

            {!ended && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                  <Users className="h-4 w-4 text-indigo-500" />
                  {attendees.length}
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                    {t("joinedStudents")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {lecture.status === "waiting" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
            <FadeIn>
              <GlassCard className="flex flex-col items-center gap-4 p-8 text-center" interactive={false}>
                <div className="rounded-2xl bg-white p-4 shadow-lg shadow-slate-900/10 dark:bg-white">
                  <QrCode value={joinUrl} size={180} className="rounded-xl" />
                </div>
                <div className="max-w-xs">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {t("waitingRoomTitle")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                    {t("scanQrToJoin")}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  <button onClick={copyJoinLink} className="btn-ghost w-full !py-2.5">
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                    {copied ? t("linkCopied") : t("copyLink")}
                  </button>
                  <Link href={joinUrl} target="_blank" className="btn-primary w-full !py-2.5">
                    <Radio className="h-4 w-4" />
                    {t("watchLive")}
                  </Link>
                </div>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.05}>
              <div className="space-y-4">
                <GlassCard className="flex min-h-[320px] flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <SectionLabel icon={<Users className="h-3.5 w-3.5" />}>
                      {t("joinedStudents")}
                    </SectionLabel>
                    <span className="text-xs tabular-nums text-slate-400 dark:text-zinc-500">
                      {attendees.length}
                    </span>
                  </div>
                  {attendees.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-white/10">
                      <p className="max-w-[240px] text-sm text-slate-400 dark:text-zinc-500">
                        {t("noStudentsYet")}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {attendees.map((attendee, index) => (
                        <li
                          key={attendee.id}
                          className="animate-fade-up flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.04]"
                          style={{ animationDelay: `${index * 40}ms` }}
                        >
                          <span className="text-xs font-bold text-slate-400">
                            {index + 1}
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 font-bold text-indigo-500 dark:text-violet-300">
                            {attendee.studentName.charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-zinc-200">
                            {attendee.studentName}
                          </span>
                          <span className="text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
                            {new Date(attendee.joinedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassCard>

                <FadeIn delay={0.1}>
                  <GlassCard className="flex flex-col gap-4" interactive={false}>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      {t("waitForStudents")}
                    </p>
                    <button
                      onClick={() => void setLiveLectureStatus(lectureId, "live")}
                      className="btn-primary w-full !py-3 text-base"
                    >
                      <Radio className="h-5 w-5" />
                      {t("startLesson")}
                    </button>
                  </GlassCard>
                </FadeIn>
              </div>
            </FadeIn>
          </div>
        )}

        {live && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <FadeIn>
                <GlassCard className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <SectionLabel icon={<Mic className="h-3.5 w-3.5" />}>
                      {t("liveBroadcast")}
                    </SectionLabel>
                    <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-500 dark:text-rose-300">
                      <Square className="h-3 w-3 fill-current" />
                      {t("recording")}
                    </span>
                  </div>

                  <button
                    onClick={recording ? stopRecognition : startRecognition}
                    className={cn(
                      "w-full !py-3.5 text-base",
                      recording
                        ? "border border-rose-500/40 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300"
                        : "btn-primary",
                    )}
                  >
                    {recording ? (
                      <>
                        <Square className="h-5 w-5 fill-current" />
                        {t("stopRecordingBtn")}
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5" />
                        {t("startRecognition")}
                      </>
                    )}
                  </button>

                  {sttError && (
                    <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-300">
                      {sttError}
                    </p>
                  )}

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                      {t("recognizedText")}
                    </p>
                    <div className="min-h-[140px] rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200">
                      {draft || (
                        <span className="select-none text-slate-300 dark:text-zinc-600">
                          {t("noSectionsYet")}
                        </span>
                      )}
                      {recording && (
                        <span
                          className="ml-1 inline-block h-3.5 w-[3px] animate-pulse rounded-full bg-rose-500 align-middle"
                          title="rec"
                        />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => void flushBufferWithAudio(true)}
                    disabled={!draft.trim()}
                    className="btn-ghost w-full disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                    {t("saveSection")}
                  </button>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.05}>
                <div className="flex items-center justify-between">
                  <SectionLabel>{t("liveSections")}</SectionLabel>
                  <span className="text-xs tabular-nums text-slate-400 dark:text-zinc-500">
                    {t("sectionsCount", { n: sections.length })}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {sections.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center dark:border-white/10">
                      <p className="text-sm text-slate-400 dark:text-zinc-500">
                        {t("noSectionsYet")}
                      </p>
                    </div>
                  ) : (
                    sections.map((section, index) => (
                      <FadeIn key={section.id} delay={Math.min(index * 0.05, 0.4)}>
                        <div className="glass p-4">
                          <span className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-slate-400 to-slate-500 px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-white dark:from-slate-600 dark:to-slate-700">
                            #{index + 1} ·{" "}
                            {new Date(section.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                            {section.text}
                          </p>
                        </div>
                      </FadeIn>
                    ))
                  )}
                </div>
              </FadeIn>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <FadeIn>
                <GlassCard className="space-y-4 p-5" interactive={false}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-500 dark:text-violet-300" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t("joinedStudents")}
                    </h3>
                  </div>
                  {attendees.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      {t("noStudentsYet")}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {attendees.map((attendee) => (
                        <li
                          key={attendee.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-zinc-200">
                            {attendee.studentName}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-emerald-500 dark:text-emerald-300">
                            {attendee.listenedSectionsCount}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.05}>
                <GlassCard interactive={false}>
                  <button
                    onClick={() => void endLesson()}
                    className="btn-ghost w-full border-rose-500/40 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    {t("endLesson")}
                  </button>
                </GlassCard>
              </FadeIn>
            </aside>
          </div>
        )}

        {ended && (
          <div className="mt-8">
            <FadeIn>
              <GlassCard className="flex flex-col items-center gap-5 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-500 dark:text-emerald-300">
                  <Check className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t("lessonSummaryTitle")}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                    {t("liveStatusEnded")} · {t("sectionsCount", { n: sections.length })} ·{" "}
                    {t("joinedStudents")}: {attendees.length}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href={`/professor/${lecture.teacherId}`} className="btn-ghost">
                    {t("backToProfile")}
                  </Link>
                  <Link href={`/student/lecture/${lectureId}`} className="btn-ghost">
                    {t("viewArchive")}
                  </Link>
                  <Link href="/professor" className="btn-primary">
                    <Radio className="h-4 w-4" />
                    {t("startLecture")}
                  </Link>
                </div>
              </GlassCard>
            </FadeIn>
          </div>
        )}
      </div>
    </main>
  );
}