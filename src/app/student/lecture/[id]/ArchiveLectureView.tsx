"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  FileText,
  MousePointerClick,
  Pause,
  Play,
  Rewind,
  FastForward,
  Gauge,
  Pencil,
  Save,
  Trash2,
  Mic,
  Square,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildSectionAnswer,
  formatTime,
  timeToSeconds,
} from "@/lib/mock-hemis";
import type { AskLectureResponse, ChatMessage } from "@/types";
import { GlassCard } from "@/components/primitives";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { useLanguage } from "@/context/LanguageContext";
import { STUDENT } from "@/lib/mock-hemis";
import type { LiveLecture, LiveSection } from "@/lib/live";
import {
  buildLocalArchive,
  deleteLiveSection,
  markSectionListened,
  subscribeLiveLecture,
  subscribeSections,
  updateLiveSection,
} from "@/lib/live";
import { createMicRecorder, isRecorderSupported } from "@/lib/recorder";
import { getCurrentUserId } from "@/lib/firebase";

const RATES = [0.75, 1, 1.25, 1.5, 2];
const DEFAULT_LAST_MS = 30_000;
const DATA_URL_LIMIT = 900_000;

function useTypingIndicator(active: boolean) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), 250);
    return () => clearTimeout(timer);
  }, [active]);
  return shown;
}

function SectionTime({ seconds }: { seconds: number }) {
  return (
    <span className="tabular-nums">
      {formatTime(Math.max(0, Math.floor(seconds)))}
    </span>
  );
}

export default function ArchiveLectureView({
  lectureId,
  canEdit: canEditProp = false,
}: {
  lectureId: string;
  canEdit?: boolean;
}) {
  const { t } = useLanguage();

  const [lecture, setLecture] = useState<LiveLecture | null>(null);
  const [localArchive, setLocalArchive] = useState<
    { lecture: LiveLecture; sections: LiveSection[] } | null
  >(null);
  const [sections, setSections] = useState<LiveSection[]>([]);
  const [notFound, setNotFound] = useState(false);

  const canEdit = canEditProp && !localArchive;

  useEffect(() => {
    const offLecture = subscribeLiveLecture(lectureId, (lec) => {
      setLecture(lec);
      if (!lec && !localArchive) {
        setLocalArchive(buildLocalArchive(lectureId));
      }
    });
    const offSections = subscribeSections(lectureId, setSections);
    return () => {
      offLecture();
      offSections();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId]);

  // Проверка: если лекции нет ни в live, ни в моках — показать «не найдено»
  useEffect(() => {
    if (!lecture && !localArchive) {
      const timer = window.setTimeout(() => setNotFound(true), 4000);
      return () => window.clearTimeout(timer);
    }
    if (lecture || localArchive) setNotFound(false);
  }, [lecture, localArchive]);

  const allSections = useMemo(
    () =>
      [...(localArchive ? localArchive.sections : sections)].sort(
        (a, b) => a.timestamp - b.timestamp,
      ),
    [sections, localArchive],
  );

  const activeLecture = lecture ?? localArchive?.lecture ?? null;

  // ---------------- Player ----------------
  const baseTime = allSections[0]?.timestamp ?? 0;
  const secAt = useCallback(
    (section: { timestamp: number }) =>
      (section.timestamp - baseTime) / 1000,
    [baseTime],
  );

  const totalSec = useMemo(() => {
    if (allSections.length === 0) return 0;
    const last = allSections[allSections.length - 1];
    const lastDuration = (last.duration ?? DEFAULT_LAST_MS) / 1000;
    return secAt(last) + lastDuration;
  }, [allSections, secAt]);

  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const markedUpToRef = useRef(-1);

  const activeIndex = useMemo(() => {
    let index = -1;
    allSections.forEach((section, i) => {
      if (secAt(section) <= currentTime) index = i;
    });
    return index;
  }, [allSections, currentTime, secAt]);

  const activeSection = activeIndex >= 0 ? allSections[activeIndex] : null;

  // Фиксация прослушанных секций (аналитика студента)
  useEffect(() => {
    if (activeIndex < 0 || localArchive || canEdit) return;
    if (activeIndex <= markedUpToRef.current) return;
    markedUpToRef.current = activeIndex;
    let active = true;
    getCurrentUserId().then((studentId) => {
      if (!active || !studentId) return;
      void markSectionListened(lectureId, studentId);
    });
    return () => {
      active = false;
    };
  }, [activeIndex, localArchive, canEdit, lectureId]);

  // Плеер: единичный <audio>, переключение при смене активной секции
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeSection) return;
    const expected = activeSection.audioUrl;
    if (!expected) {
      audio.pause();
      return;
    }
    if (audio.getAttribute("src") !== expected) {
      audio.src = expected;
      audio.load();
    }
    const expectedTime = currentTime - secAt(activeSection);
    const durationMs = (activeSection.duration ?? DEFAULT_LAST_MS) / 1000;
    if (Math.abs(audio.currentTime - expectedTime) > 1.5) {
      audio.currentTime = Math.max(0, Math.min(expectedTime, durationMs));
    }
    audio.playbackRate = rate;
    if (playing) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection?.id, currentTime, playing, rate]);

  const seekTo = useCallback(
    (seconds: number) => {
      setCurrentTime(Math.min(Math.max(seconds, 0), totalSec));
      setPlaying(true);
    },
    [totalSec],
  );

  // Виртуальные часы для секций без аудио
  useEffect(() => {
    if (!playing) return;
    if (activeSection?.audioUrl) return;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + rate;
        if (next >= totalSec) {
          setPlaying(false);
          return totalSec;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, rate, activeSection?.audioUrl, totalSec]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeSection) return;
    const timelineTime = secAt(activeSection) + audio.currentTime;
    setCurrentTime((prev) =>
      timelineTime >= prev - 0.1 ? Math.min(timelineTime, totalSec) : prev,
    );
  }, [activeSection, secAt, totalSec]);

  const handleAudioEnded = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < allSections.length - 1) {
      seekTo(secAt(allSections[activeIndex + 1]));
    } else {
      setPlaying(false);
      setCurrentTime(totalSec);
    }
  }, [activeIndex, allSections, secAt, seekTo, totalSec]);

  // ---------------- Редактор (преподаватель) ----------------
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const recorderRef = useRef<{
    stop: () => Promise<{ dataUrl: string; durationMs: number } | null>;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const startEdit = (section: LiveSection) => {
    setEditingId(section.id);
    setEditText(section.text);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) return;
    setSavingId(editingId);
    try {
      await updateLiveSection(lectureId, editingId, { text });
      setToast(t("audioSaved"));
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!window.confirm(t("deleteSectionConfirm"))) return;
    try {
      await deleteLiveSection(lectureId, sectionId);
      setToast(t("sectionDeleted"));
    } catch {
      setToast(t("errorMsg"));
    }
  };

  const startReRecord = async () => {
    if (!recordingId) return;
    if (!isRecorderSupported()) {
      setToast(t("micAccessDenied"));
      return;
    }
    const rec = await createMicRecorder();
    if (!rec) {
      setToast(t("micAccessDenied"));
      return;
    }
    recorderRef.current = rec;
  };

  const stopReRecord = async () => {
    const sectionId = recordingId;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    setRecordingId(null);
    if (!recorder || !sectionId) return;
    const result = await recorder.stop();
    if (!result) return;
    if (result.dataUrl.length > DATA_URL_LIMIT) {
      setToast(t("audioTooLarge"));
      return;
    }
    try {
      await updateLiveSection(lectureId, sectionId, {
        audioUrl: result.dataUrl,
        duration: result.durationMs,
      });
      setToast(t("audioSaved"));
    } catch {
      setToast(t("errorMsg"));
    }
  };

  // ---------------- AI Chat ----------------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingShown = useTypingIndicator(chatLoading);

  const chatContext = useMemo(
    () =>
      allSections.map((section) => ({
        time: formatTime(Math.floor(secAt(section))),
        text: section.text,
      })),
    [allSections, secAt],
  );

  useEffect(() => {
    if (activeLecture) {
      setMessages([
        {
          id: "greeting",
          sender: "ai",
          text: t("chatGreeting", { title: activeLecture.title }),
        },
      ]);
    }
  }, [activeLecture, t]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const sendQuestion = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || chatLoading) return;
      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "user", text: question },
      ]);
      setChatLoading(true);
      try {
        let answer: string | undefined;
        let timestampRef: string | undefined;

        if (typeof window !== "undefined" && activeLecture && chatContext.length > 0) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          try {
            const res = await fetch("/api/ask-lecture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question,
                title: activeLecture.title,
                context: chatContext,
              }),
              signal: controller.signal,
            });
            if (res.ok) {
              const data: AskLectureResponse = await res.json();
              if (data.answer) {
                answer = data.answer;
                timestampRef = data.timestampRef;
              }
            }
          } catch {
            // API недоступен — локальный фоллбэк ниже
          } finally {
            clearTimeout(timeout);
          }
        }

        if (!answer) {
          await new Promise((resolve) =>
            setTimeout(resolve, 700 + Math.random() * 900),
          );
          if (activeLecture?.status === "ended" || localArchive) {
            const mock = buildSectionAnswer({ topic: "Lecture", transcript: allSections.map(s => s.text).join("\n") }, question);
            answer = mock.answer;
            timestampRef = mock.timestampRef;
          } else {
            answer = t("answerFallback");
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: answer ?? t("answerFallback"),
            timestampRef,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), sender: "ai", text: t("errorMsg") },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [activeLecture, allSections, chatContext, chatLoading, localArchive, t],
  );

  const jumpToAnswer = (timestampRef?: string) => {
    if (!timestampRef) return;
    seekTo(timeToSeconds(timestampRef));
  };

  const suggestedQuestions = [t("sugQ1"), t("sugQ2"), t("sugQ3")];

  // ---------------- Render ----------------
  if (!lecture && !localArchive) {
    return (
      <main className="min-h-screen">
        <Header showBack user={STUDENT} />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center text-sm text-slate-400 dark:text-zinc-500">
            {t("loading")}
          </div>
        </div>
      </main>
    );
  }

  if (notFound && !activeLecture) {
    return (
      <main className="min-h-screen">
        <Header showBack user={STUDENT} />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center">
            <p className="font-bold text-slate-900 dark:text-white">
              {t("lectureNotFound")}
            </p>
            <Link href="/student" className="btn-ghost mt-4">
              {t("backToDashboard")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const activeBars = totalSec > 0 ? Math.floor((currentTime / totalSec) * 28) : 0;
  const progressPct = totalSec > 0 ? Math.min((currentTime / totalSec) * 100, 100) : 0;

  return (
    <main className="min-h-screen">
      <Header showBack user={STUDENT} />
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        className="hidden"
        preload="auto"
      />

      <div className="mx-auto w-full max-w-7xl px-6 pb-20">
        {toast && (
          <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-600 backdrop-blur-md dark:text-emerald-300">
            {toast}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0 space-y-6">
            <FadeIn>
              <div className="glass-strong p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-sky-300">
                        <BookOpen className="h-3 w-3" />
                        {t("course")} · {activeLecture?.teacherName}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-500 dark:text-violet-300">
                        <Sparkles className="h-3 w-3" />
                        {t("archiveLectureTitle")}
                      </span>
                    </div>
                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                      {activeLecture?.title}
                    </h1>
                    <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-zinc-500">
                      <span>{activeLecture?.teacherName}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(totalSec)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Player */}
            <FadeIn delay={0.05}>
              <GlassCard>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setPlaying((prev) => !prev)}
                    disabled={totalSec <= 0}
                    aria-label={playing ? t("pause") : t("play")}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-150 hover:scale-[1.04] active:scale-95 disabled:opacity-40"
                  >
                    {playing ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="ml-0.5 h-6 w-6" />
                    )}
                  </button>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => seekTo(currentTime - 10)}
                      disabled={totalSec <= 0}
                      title={t("seekBack10")}
                      aria-label={t("seekBack10")}
                      className="icon-btn"
                    >
                      <Rewind className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => seekTo(currentTime + 10)}
                      disabled={totalSec <= 0}
                      title={t("seekForward10")}
                      aria-label={t("seekForward10")}
                      className="icon-btn"
                    >
                      <FastForward className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="relative h-10">
                      <div className="absolute inset-x-0 top-1/2 flex h-10 -translate-y-1/2 items-center gap-[3px]">
                        {Array.from({ length: 28 }, (_, i) => {
                          const height =
                            24 +
                            Math.abs(
                              Math.sin(i * 1.7) * 66 + Math.cos(i * 0.9) * 22,
                            );
                          return (
                            <span
                              key={i}
                              className={cn(
                                "flex-1 rounded-full transition-colors duration-200",
                                i < activeBars
                                  ? "bg-gradient-to-t from-blue-500 to-purple-500"
                                  : "bg-slate-200 dark:bg-white/10",
                              )}
                              style={{ height: `${height / 100}px` }}
                            />
                          );
                        })}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(totalSec, 1)}
                        step={0.1}
                        value={Math.min(currentTime, totalSec)}
                        onChange={(e) => seekTo(Number(e.target.value))}
                        aria-label={t("playbackNow")}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <div
                        className="pointer-events-none absolute left-0 top-1/2 h-full -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-slate-500 dark:text-zinc-400">
                      <SectionTime seconds={currentTime} />
                      <div className="flex items-center gap-3">
                        <Gauge className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                        <select
                          value={rate}
                          onChange={(e) => setRate(Number(e.target.value))}
                          aria-label={t("speed")}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 transition-colors focus:border-purple-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                        >
                          {RATES.map((r) => (
                            <option key={r} value={r}>
                              {r === 1 ? t("speed") : `${r}x`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-slate-400 dark:text-zinc-500">
                        {formatTime(totalSec)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
                  {activeSection?.audioUrl ? (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      {t("audioArchiveHint")}
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3.5 w-3.5" />
                      {t("noAudioSections")}
                    </>
                  )}
                </p>
              </GlassCard>
            </FadeIn>

            {/* Transcript */}
            <section>
              <FadeIn>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                    <FileText className="h-3.5 w-3.5" />
                    {t("transcript")}
                    <span className="font-mono tabular-nums">
                      {allSections.length}
                    </span>
                  </div>
                </div>
              </FadeIn>

              {canEdit && (
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-600 dark:text-indigo-300">
                  <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {t("professorEditorHint")}
                </div>
              )}

              <div className="space-y-3">
                {allSections.length === 0 ? (
                  <FadeIn>
                    <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-white/10">
                      <p className="text-sm text-slate-400 dark:text-zinc-500">
                        {t("noSectionsYet")}
                      </p>
                    </div>
                  </FadeIn>
                ) : (
                  allSections.map((section, index) => {
                    const active = index === activeIndex;
                    const editing = editingId === section.id;
                    return (
                      <FadeIn key={section.id} delay={Math.min(index * 0.03, 0.3)}>
                        <div
                          className={cn(
                            "glass p-4",
                            active &&
                              "border-blue-500/50 bg-blue-500/10",
                          )}
                        >
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                            <button
                              onClick={() => seekTo(secAt(section))}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md bg-gradient-to-r px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-white",
                                active
                                  ? "from-blue-600 to-purple-600"
                                  : "from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700",
                              )}
                            >
                              <Play className="h-3 w-3" />
                              # {index + 1} · <SectionTime seconds={secAt(section)} />
                              {section.audioUrl && <Volume2 className="h-3 w-3" />}
                            </button>

                            {canEdit && (
                              <div className="flex items-center gap-1.5">
                                {editing ? (
                                  <>
                                    <button
                                      onClick={() => void saveEdit()}
                                      disabled={savingId === section.id}
                                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500/25 disabled:opacity-50 dark:text-emerald-300"
                                    >
                                      <Save className="h-3.5 w-3.5" />
                                      {savingId === section.id
                                        ? t("sectionSaving")
                                        : t("save")}
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                                    >
                                      {t("cancel")}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEdit(section)}
                                      title={t("editSection")}
                                      aria-label={t("editSection")}
                                      className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    {recordingId === section.id ? (
                                      <button
                                        onClick={() => void stopReRecord()}
                                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-600 animate-pulse dark:text-rose-300"
                                      >
                                        <Square className="h-3.5 w-3.5 fill-current" />
                                        {t("reRecordStop")}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setRecordingId(section.id);
                                          void startReRecord();
                                        }}
                                        title={t("reRecord")}
                                        aria-label={t("reRecord")}
                                        className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                                      >
                                        <Mic className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => void handleDelete(section.id)}
                                      title={t("deleteSection")}
                                      aria-label={t("deleteSection")}
                                      className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600 dark:border-white/10 dark:text-zinc-300"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {editing ? (
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={3}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 focus:border-purple-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                            />
                          ) : (
                            <p
                              className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300"
                              onClick={() => seekTo(secAt(section))}
                            >
                              {section.text}
                            </p>
                          )}

                          {recordingId === section.id && (
                            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-300">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                              {t("recordingHint")}
                            </p>
                          )}
                        </div>
                      </FadeIn>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Chat */}
          <aside className="lg:sticky lg:top-20 lg:h-[calc(100dvh-6rem)]">
            <FadeIn delay={0.1}>
              <GlassCard className="flex h-full min-h-[560px] flex-col p-0" interactive={false}>
                <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-purple-500/20">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t("askLecture")}
                      </h2>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {t("aiHelperSubtitle", { count: chatContext.length })}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
                    <MousePointerClick className="h-3 w-3" />
                    {t("audioArchiveHint")}
                  </p>
                </div>

                <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  {messages.map((message) => {
                    const isUser = message.sender === "user";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "animate-fade-up flex",
                          isUser ? "justify-end" : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                            isUser
                              ? "rounded-br-md bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200",
                          )}
                        >
                          <p>{message?.text}</p>
                          {message?.timestampRef ? (
                            <button
                              onClick={() => jumpToAnswer(message.timestampRef)}
                              className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md shadow-purple-500/20 transition-transform active:scale-95"
                            >
                              <Play className="h-3 w-3" />
                              {t("fragmentAt", { time: message.timestampRef })}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {chatLoading && typingShown ? (
                    <div className="animate-fade-up flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.06]">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="typing-dot h-2 w-2 rounded-full bg-indigo-400"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div ref={chatEndRef} />
                </div>

                <div className="space-y-2 border-t border-slate-200 px-5 py-3 dark:border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => sendQuestion(question)}
                        disabled={chatLoading}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition-all duration-150 hover:scale-[1.015] hover:border-purple-500/40 hover:text-indigo-500 active:scale-[0.98] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendQuestion(input);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t("askPlaceholder")}
                      aria-label={t("askPlaceholder")}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !input.trim()}
                      aria-label={t("send")}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20 transition-all duration-150 hover:scale-[1.04] active:scale-95 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </GlassCard>
            </FadeIn>
          </aside>
        </div>
      </div>
    </main>
  );
}