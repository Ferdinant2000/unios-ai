"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Check,
  Copy,
  Eraser,
  Languages,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  StopCircle,
  Volume2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { GlassCard, SectionLabel, StatusPill } from "@/components/primitives";
import {
  SpeechEngine,
  SPEECH_LANGS,
  isSTTSupported,
  isTTSSupported,
  speechEngineFactory,
  type SpeechLang,
  type VoiceGender,
} from "@/lib/speechEngine";
import { cn } from "@/lib/utils";

const WAVE_BARS = 24;

function getWaveBars(): number[] {
  return Array.from({ length: WAVE_BARS }, (_, i) => i);
}

function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.?!,;:«»"'`„"]/g, " ")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(q: string, keywords: string[]): boolean {
  return keywords.some((k) => q.includes(k));
}

const PROFESSOR_KB: Record<SpeechLang, { keywords: string[]; answer: string }[]> = {
  uz: [
    { keywords: ["salom", "assalom", "hayrli kun", "qalaysiz", "hello", "hi"], answer: "Assalomu alaykum! Men UniOS AI-professoriman. Savolingizni ovoz orqali bering — shu tilda javob beraman va javobni ovozli o'qiyman." },
    { keywords: ["unios", "bu nima", "loyiha", "nima qila"], answer: "UniOS — HEMIS ustidagi aqlli AI qatlam. Ma'ruzalarni tinglaydi, konspekt yuritadi, savollarga javob beradi va auditoriya tushunishini real vaqtda tahlil qiladi." },
    { keywords: ["suni", "sun'iy intellekt", "ai nima", "intellekt"], answer: "Sun'iy intellekt — mashinaning nutqni, tilni va ma'lumotlarni tushunish qobiliyati. Bu yerda AI sizning nutqingizni STT orqali eshitadi, so'ng javobni TTS orqali ovoz bilan aytadi — to'liq brauzerda." },
    { keywords: ["hemis", "xemis", "tizim", "platforma"], answer: "HEMIS — universitetning talabalar va professorlar uchun yagona platformasi. UniOS uning ustiga ovozli qatlam qo'shadi: ma'ruza tanishadi, konspektlanadi va savollar uchun ochiq bo'ladi." },
    { keywords: ["konspekt", "ko'nspekt", "ma'ruza", "dars", "transkr", "yozuv"], answer: "Real vaqt konspekt moduli. AI ma'ruzani vaqt belgilari bilan transkripsiya qiladi, tartibli konspekt tuzadi va javoblarni darsning aniq qismiga bog'laydi." },
    { keywords: ["neyron", "neural", "tarmoq", "model"], answer: "Neyron tarmoq — ma'lumotlardan o'rganadigan model. Bizning to'plam nutq va matn transformatorlaridan foydalanadi va o'zbek, rus va ingliz tillarini ma'lumotlar bazasisiz tushunadi." },
    { keywords: ["o'zbek", "o`zbek", "uzbek", "uz tili", "til"], answer: "Ha, UniOS o'zbek tilini to'liq qo'llab-quvvatlaydi. Nutq va javoblar o'zbek, rus va ingliz tillarida ishlaydi." },
    { keywords: ["o'qish", "o'rganish", "maslahat", "qanday", "samarali"], answer: "Samarali usul: ma'ruzani tinch tezlikda tinglang, darhol savol bering va konspektni kechqurun takrorlang. UniOS buni osonlashtiradi — hammasi bir joyda." },
    { keywords: ["nimaga qodir", "imkoniyat", "qanday", "nima ucha"], answer: "Men nutqni taniyman, matnni ajrataman, istalgan iborani o'qiyman va uch tilda jonli dialog olib boraman. Bu taqdimot uchun to'liq ovoz laboratoriyasi." },
    { keywords: ["rahmat", "tashakkur", "yaxshi", "zo'r"], answer: "Yordam berganimdan xursandman! Savol berishda davom eting — har doim aloqadaman." },
  ],
  ru: [
    { keywords: ["привет", "здравствуй", "салом", "хай", "добрый день"], answer: "Здравствуйте! Я ИИ-Профессор UniOS. Задайте вопрос голосом — отвечу и озвучу ответ на этом же языке." },
    { keywords: ["unios", "юниос", "о проекте", "что это", "что вы"], answer: "UniOS — интеллектуальный ИИ-слой поверх HEMIS: слушает лекции, ведёт конспект, отвечает на вопросы и показывает аналитику понимания аудитории в реальном времени." },
    { keywords: ["искусственный интеллект", "ии", "что такое аи", "нейросеть"], answer: "Искусственный интеллект — это способность машин понимать речь, язык и данные. Здесь ИИ слушает ваш голос через СТТ и отвечает голосом через ТТС — в реальном времени и полностью в браузере." },
    { keywords: ["hemis", "хемис", "платформа", "система"], answer: "HEMIS — единая платформа университета для студентов и преподавателей. UniOS добавляет поверх неё голосовой слой: лекция распознаётся, конспектируется и доступна для вопросов." },
    { keywords: ["конспект", "лекци", "транскрип", "запись", "занятие"], answer: "Модуль конспекта в реальном времени. ИИ транскрибирует лекцию по таймкодам, собирает структурированный конспект и привязывает ответы к точным фрагментам занятия." },
    { keywords: ["нейро", "сеть", "модель", "машинное обучени"], answer: "Нейронная сеть — это модель, обучающаяся на данных. Наш стек использует речевые и текстовые трансформеры, чтобы понимать узбекский, русский и английский без базы данных." },
    { keywords: ["узбекский", "оба язык", "о'zbek", "узбек", "поддержк"], answer: "Да, UniOS полностью поддерживает узбекский язык. Распознавание речи и ответы работают на узбекском, русском и английском." },
    { keywords: ["как учить", "учиться", "совет", "эффективно", "подготовк"], answer: "Эффективный способ: слушайте лекцию в спокойном темпе, задавайте вопросы сразу, а конспект повторяйте вечером. UniOS делает это проще — всё в одном месте." },
    { keywords: ["умее", "возможн", "что можешь", "функци"], answer: "Я умею распознавать речь, выделять текст, озвучивать любые фразы и вести живой диалог на трёх языках. Это полноценная голосовая лаборатория для презентации." },
    { keywords: ["спасибо", "раха", "благодар", "отлично", "супер"], answer: "Рад помочь! Продолжайте задавать вопросы — я всегда на связи." },
  ],
  en: [
    { keywords: ["hello", "hi", "good morning", "greetings", "hey"], answer: "Hello! I am the UniOS AI Professor. Ask a question by voice — I will answer and speak the reply in the same language." },
    { keywords: ["unios", "this demo", "what is this", "product", "project"], answer: "UniOS is an intelligent AI layer on top of HEMIS: it listens to lectures, takes notes, answers questions, and shows real-time comprehension analytics for the audience." },
    { keywords: ["artificial intelligence", "ai", "what is ai", "machine learning"], answer: "Artificial intelligence is the ability of machines to understand speech, language and data. Here the AI hears your voice through speech recognition and replies with speech synthesis — in real time, fully in the browser." },
    { keywords: ["hemis", "platform", "system", "lms"], answer: "HEMIS is the university's unified platform for students and professors. UniOS adds a voice layer on top: the lecture is recognized, summarized and open for questions." },
    { keywords: ["note", "transcript", "summary", "lecture", "recording"], answer: "The real-time notes module. The AI transcribes the lecture with timestamps, builds a structured summary and links answers to exact fragments of the class." },
    { keywords: ["neural", "network", "model", "nlp"], answer: "A neural network is a model that learns from data. Our stack uses speech and text transformers to understand Uzbek, Russian and English without any database." },
    { keywords: ["uzbek", "u'zbek", "language", "languages"], answer: "Yes, UniOS fully supports Uzbek. Speech recognition and answers work in Uzbek, Russian and English." },
    { keywords: ["how to study", "learn", "advice", "study tips", "prepare"], answer: "An effective way: listen to the lecture at a calm pace, ask questions right away, and review the notes in the evening. UniOS makes this easier — everything in one place." },
    { keywords: ["can you", "what can", "capabilit", "features"], answer: "I can recognize speech, extract text, speak any phrase aloud, and run a live dialogue in three languages. This is a complete voice laboratory for your presentation." },
    { keywords: ["thanks", "thank you", "good", "great", "awesome"], answer: "Happy to help! Keep asking questions — I am always available." },
  ],
};

function getProfessorAnswer(question: string, lang: SpeechLang): string {
  const q = normalizeQuestion(question);
  if (!q) {
    return getFallbackAnswer(lang);
  }
  const topics = PROFESSOR_KB[lang];
  for (const topic of topics) {
    if (hasKeyword(q, topic.keywords)) return topic.answer;
  }
  return getFallbackAnswer(lang);
}

function getFallbackAnswer(lang: SpeechLang): string {
  switch (lang) {
    case "uz":
      return "Qiziqarli savol! Men UniOS demo-laboratoriyasidagi AI-professoriman. HEMIS, konspektlar, sun'iy intellekt yoki modul imkoniyatlari haqida so'rang.";
    case "ru":
      return "Интересный вопрос! Я ИИ-Профессор в демо-лаборатории UniOS. Спросите про HEMIS, конспекты, ИИ или возможности модуля.";
    case "en":
      return "Interesting question! I am the AI Professor in the UniOS demo lab. Ask me about HEMIS, notes, AI or module capabilities.";
  }
}

function TypeWriter({ text }: { text: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const id = window.setInterval(() => {
      setShown((s) => {
        if (s >= text.length) {
          window.clearInterval(id);
          return s;
        }
        return s + 2;
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [text]);
  const slice = useMemo(() => text.slice(0, shown), [text, shown]);
  return <span>{slice}{shown < text.length ? <span className="animate-pulse">▍</span> : null}</span>;
}

const LANG_LABELS: { value: SpeechLang; label: string; flag: string }[] = [
  { value: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "en", label: "English", flag: "🇬🇧" },
];

export default function VoiceStudio() {
  const { t, lang: uiLang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const engineRef = useRef<SpeechEngine | null>(null);
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  const [lang, setLang] = useState<SpeechLang>("ru");
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [sttError, setSttError] = useState("");

  const [ttsText, setTtsText] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(0.95);
  const [preset, setPreset] = useState<VoiceGender>("professor");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [micFailed, setMicFailed] = useState(false);

  const [demoOn, setDemoOn] = useState(false);
  const [phase, setPhase] = useState<"idle" | "listening" | "thinking">("idle");
  const [history, setHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [simInput, setSimInput] = useState("");
  const langRef = useRef(lang);
  langRef.current = lang;
  const speakRef = useRef<(text: string, speechLang: SpeechLang, source: "manual" | "demo") => void>(() => {});

  const engine = useCallback(() => {
    if (!engineRef.current) engineRef.current = speechEngineFactory();
    return engineRef.current;
  }, []);

  useEffect(() => {
    setMounted(true);
    setSttSupported(isSTTSupported());
    setTtsSupported(isTTSSupported());
    if (uiLang === "uz" || uiLang === "ru" || uiLang === "en") {
      setLang(uiLang);
    }
    return () => {
      engineRef.current?.cancel();
      engineRef.current?.cancelListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopSpeech = useCallback(() => {
    engine()?.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [engine]);

  useEffect(() => {
    if (!ttsSupported) setSpeaking(false);
  }, [ttsSupported]);

  const setChatLang = useCallback(
    (next: SpeechLang) => {
      if (engineRef.current) {
        engineRef.current.cancelListening();
        engineRef.current.cancel();
      }
      setRecording(false);
      setInterim("");
      setDemoOn(false);
      setPhase("idle");
      setLang(next);
    },
    [],
  );

  // ---------- STT ----------

  const handleRecognized = useCallback(
    (finalTextChunk: string) => {
      const trimmed = finalTextChunk.trim();
      if (!trimmed) return;
      setFinalText((prev) => (prev ? `${prev} ${trimmed}` : trimmed));
      if (demoOn && langRef.current) {
        const question = trimmed;
        setHistory((h) => [...h, { role: "user", text: question }]);
        setPhase("thinking");
        const answer = getProfessorAnswer(question, langRef.current);
        window.setTimeout(() => {
          setHistory((h) => [...h, { role: "ai", text: answer }]);
          setPhase("listening");
          speakRef.current(answer, langRef.current as SpeechLang, "demo");
        }, 900);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoOn],
  );

  const startRecognition = useCallback(() => {
    setSttError("");
    setMicFailed(false);
    const ok = engine()?.startListening(langRef.current as SpeechLang, {
      onInterim: (text) => setInterim(text),
      onFinal: (text) => handleRecognized(text),
      onStart: () => {
        setRecording(true);
        if (demoOn) setPhase("listening");
      },
      onError: (code) => {
        setRecording(false);
        if (code === "not-allowed" || code === "service-not-allowed") {
          setMicFailed(true);
          setSttError(t("sttMicError"));
        }
      },
      onEnd: () => {
        setRecording(false);
        setInterim("");
      },
    });
    if (!ok) {
      setSttError(t("sttNotSupported"));
    }
  }, [engine, demoOn, t, handleRecognized]);

  const stopRecognition = useCallback(() => {
    engine()?.stopListening();
    setRecording(false);
    setInterim("");
  }, [engine]);

  const toggleMic = useCallback(() => {
    if (recording) {
      stopRecognition();
    } else {
      startRecognition();
    }
  }, [recording, startRecognition, stopRecognition]);

  const copyResult = useCallback(async () => {
    if (!finalText) return;
    try {
      await navigator.clipboard.writeText(finalText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard deny
    }
  }, [finalText]);

  const clearResult = useCallback(() => {
    setFinalText("");
    setInterim("");
    setSent(false);
  }, []);

  const sendToProfessor = useCallback(() => {
    if (!finalText.trim()) return;
    setSent(true);
    window.setTimeout(() => setSent(false), 3000);
  }, [finalText]);

  // ---------- TTS ----------

  const speakWithSettings = useCallback(
    (text: string, speechLang: SpeechLang, source: "manual" | "demo") => {
      if (!ttsSupported) return;
      const e = engine();
      if (!e) return;
      if (source === "manual" && !text.trim()) return;
      const ok = e.speak({
        text,
        lang: speechLang,
        rate,
        pitch,
        volume,
        gender: preset,
        onStart: () => {
          setSpeaking(true);
          setPaused(false);
        },
        onEnd: () => {
          setSpeaking(false);
          setPaused(false);
        },
      });
      if (!ok) setSpeaking(false);
    },
    [engine, rate, pitch, volume, preset, ttsSupported],
  );
  speakRef.current = speakWithSettings;

  const manualSpeak = useCallback(() => {
    const text = ttsText.trim() || getSample(uiLang);
    speakWithSettings(text, lang, "manual");
  }, [speakWithSettings, ttsText, lang, uiLang]);

  const togglePause = useCallback(() => {
    const e = engine();
    if (!e) return;
    if (paused) {
      e.resume();
      setPaused(false);
    } else {
      e.pause();
      setPaused(true);
    }
  }, [paused, engine]);

  // ---------- Demo loop ----------

  const startDemo = useCallback(() => {
    setHistory([]);
    setDemoOn(true);
    setSttError("");
    setMicFailed(false);
    if (sttSupported) {
      startRecognition();
    } else {
      setPhase("idle");
    }
  }, [sttSupported, startRecognition]);

  const stopDemo = useCallback(() => {
    setDemoOn(false);
    setPhase("idle");
    stopRecognition();
  }, [stopRecognition]);

  const resetDemo = useCallback(() => {
    stopDemo();
    setHistory([]);
    setSimInput("");
    setFinalText("");
  }, [stopDemo]);

  const sendSimulated = useCallback(() => {
    const question = simInput.trim();
    if (!question) return;
    setSimInput("");
    const speechLang = langRef.current as SpeechLang;
    setHistory((h) => [...h, { role: "user", text: question }]);
    setPhase("thinking");
    const answer = getProfessorAnswer(question, speechLang);
    window.setTimeout(() => {
      setHistory((h) => [...h, { role: "ai", text: answer }]);
      setPhase(sttSupported ? "listening" : "idle");
      speakWithSettings(answer, speechLang, "demo");
    }, 900);
  }, [simInput, sttSupported, speakWithSettings]);

  useEffect(() => {
    if (demoOn && micFailed) {
      setPhase("idle");
    }
  }, [demoOn, micFailed]);

  const voiceCount = useMemo(() => {
    if (!mounted) return 0;
    try {
      return engine()?.getVoices(lang).length ?? 0;
    } catch {
      return 0;
    }
  }, [mounted, lang, engine]);

  const lastAiMessage = useMemo(() => {
    for (let i = history.length - 1; i >= 0; i -= 1) {
      if (history[i].role === "ai") return history[i].text;
    }
    return "";
  }, [history]);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="ai-badge flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {t("voiceStudioTag")}
              </span>
              <StatusPill label={lang.toUpperCase()} active />
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t("voiceStudioTitle")}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
              {t("voiceStudioSubtitle")}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              {t("voiceStudioLang")}
            </p>
            <div
              role="group"
              className="inline-flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5"
            >
              {LANG_LABELS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setChatLang(item.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                    lang === item.value
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white",
                  )}
                >
                  <span className="mr-1">{item.flag}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        {/* Support notices */}
        {mounted && !sttSupported && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t("sttNotSupported")}</p>
          </div>
        )}
        {mounted && !ttsSupported && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t("ttsNotSupported")}</p>
          </div>
        )}

        {/* Section 1 — STT */}
        <section className="space-y-3">
          <FadeSection icon={<Mic className="h-3.5 w-3.5" />} title={t("sttSectionTitle")} sub={t("sttSectionSub")} />
          <GlassCard>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              {/* Big mic button */}
              <button
                onClick={toggleMic}
                disabled={!mounted || !sttSupported}
                aria-label={recording ? t("sttStop") : t("sttStart")}
                className="group relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center rounded-full outline-none md:mx-0"
              >
                {recording && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-indigo-400/60"
                        initial={{ opacity: 0.7, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.55 }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45 }}
                      />
                    ))}
                  </>
                )}
                <span
                  className={cn(
                    "flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300",
                    recording
                      ? "bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 text-white shadow-xl shadow-rose-500/40"
                      : "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl shadow-purple-500/40 group-hover:scale-105 group-active:scale-95",
                  )}
                >
                  {recording ? <Mic className="h-10 w-10 animate-pulse" /> : <MicOff className="h-10 w-10" />}
                </span>
                {recording && (
                  <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    {t("sttListening")}
                  </span>
                )}
              </button>

              {/* Live waveform */}
              <div className="flex min-h-[64px] flex-1 items-center justify-center gap-[3px]">
                {recording ? (
                  getWaveBars().map((i) => (
                    <motion.span
                      key={i}
                      className="w-[4px] rounded-full bg-gradient-to-t from-blue-500 to-purple-500"
                      animate={{
                        height: [8 + Math.random() * 28, 12 + Math.abs(Math.sin(i)) * 34, 8 + Math.random() * 28],
                      }}
                      transition={{ duration: 0.5 + (i % 5) * 0.14, repeat: Infinity, repeatType: "mirror" }}
                      style={{ height: 14 }}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Volume2 className="h-6 w-6 text-slate-300 dark:text-zinc-600" />
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{t("sttIdle")}</p>
                    {sttSupported && (
                      <span className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-zinc-600">
                        {SPEECH_LANGS.join(" · ")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {sttError && (
              <p className="mt-3 flex items-center gap-2 text-xs text-rose-500 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {sttError}
              </p>
            )}

            {/* Live transcript */}
            <div className="mt-4 min-h-[120px] rounded-xl border border-slate-200 bg-white/70 p-4 text-sm leading-relaxed text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200">
              {finalText ? (
                <p className="whitespace-pre-wrap">{finalText}</p>
              ) : (
                <p className="text-slate-400 dark:text-zinc-500">{t("sttResultPlaceholder")}</p>
              )}
              {interim && (
                <p className="mt-1.5 text-slate-400 italic dark:text-zinc-500">
                  {interim}
                  <span className="animate-pulse">▍</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={clearResult} className="btn-ghost inline-flex items-center gap-1.5 text-xs">
                <Eraser className="h-3.5 w-3.5" />
                {t("sttClear")}
              </button>
              <button
                onClick={copyResult}
                disabled={!finalText}
                className="btn-ghost inline-flex items-center gap-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t("sttCopied") : t("sttCopy")}
              </button>
              <button
                onClick={sendToProfessor}
                disabled={!finalText.trim()}
                className="btn-primary inline-flex items-center gap-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sent ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                {sent ? t("sttSentToProfessor") : t("sttSendToProfessor")}
              </button>
            </div>
          </GlassCard>
        </section>

        {/* Section 2 — TTS */}
        <section className="space-y-3">
          <FadeSection icon={<Volume2 className="h-3.5 w-3.5" />} title={t("ttsSectionTitle")} sub={t("ttsSectionSub")} />
          <GlassCard>
            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              rows={3}
              placeholder={t("ttsPlaceholder")}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-800 outline-none transition-colors focus:border-purple-500/60 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Slider
                label={t("ttsRate")}
                min={0.8}
                max={1.5}
                step={0.05}
                value={rate}
                display={`${rate.toFixed(2)}×`}
                onChange={setRate}
              />
              <Slider
                label={t("ttsPitch")}
                min={0.9}
                max={1.2}
                step={0.01}
                value={pitch}
                display={pitch.toFixed(2)}
                onChange={setPitch}
              />
              <Slider
                label={t("ttsVolume")}
                min={0.2}
                max={1}
                step={0.05}
                value={volume}
                display={`${Math.round(volume * 100)}%`}
                onChange={setVolume}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                {t("voiceStudioLang")}
              </span>
              {(["male", "female", "professor"] as VoiceGender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setPreset(g)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                    preset === g
                      ? "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400",
                  )}
                >
                  {g === "male"
                    ? t("ttsPresetMale")
                    : g === "female"
                      ? t("ttsPresetFemale")
                      : t("ttsPresetProfessor")}
                </button>
              ))}
              <span className="ml-auto rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500">
                {voiceCount > 0 ? `${voiceCount} 🔊` : "—"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={manualSpeak}
                disabled={!ttsSupported}
                className="btn-primary inline-flex items-center gap-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="h-4 w-4" />
                {t("ttsPlay")}
              </button>
              <button
                onClick={togglePause}
                disabled={!speaking}
                className="btn-ghost inline-flex items-center gap-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {paused ? t("ttsResume") : t("ttsPause")}
              </button>
              <button
                onClick={stopSpeech}
                disabled={!speaking}
                className="btn-ghost inline-flex items-center gap-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <StopCircle className="h-4 w-4" />
                {t("ttsStop")}
              </button>
              {(speaking || paused) && (
                <StatusPill label={paused ? t("ttsPaused") : t("ttsSpeaking")} active={!paused} />
              )}
            </div>
          </GlassCard>
        </section>

        {/* Section 3 — Demo loop */}
        <section className="space-y-3">
          <FadeSection
            icon={<Bot className="h-3.5 w-3.5" />}
            title={t("demoSectionTitle")}
            sub={t("demoSectionSub")}
          />
          <GlassCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusPill
                  label={
                    !demoOn
                      ? t("demoStart")
                      : phase === "listening"
                        ? t("demoListening")
                        : phase === "thinking"
                          ? t("demoThinking")
                          : t("sttIdle")
                  }
                  active={demoOn && phase === "listening"}
                />
              </div>
              <div className="flex items-center gap-2">
                {!demoOn ? (
                  <button onClick={startDemo} className="btn-primary inline-flex items-center gap-1.5 text-sm">
                    <Mic className="h-4 w-4" />
                    {t("demoStart")}
                  </button>
                ) : (
                  <button onClick={stopDemo} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition-all duration-150 hover:scale-[1.015] active:scale-[0.98] dark:border-white/15 dark:bg-white/5 dark:text-rose-300">
                    <Square className="h-4 w-4" />
                    {t("demoStop")}
                  </button>
                )}
                <button onClick={resetDemo} className="btn-ghost inline-flex items-center gap-1.5 text-sm">
                  <RotateCcw className="h-4 w-4" />
                  {t("demoReset")}
                </button>
              </div>
            </div>

            {/* Dialogue transcript */}
            <div className="mt-4 max-h-[340px] min-h-[160px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.05]">
              {history.length === 0 && (
                <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center">
                  {phase === "thinking" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-slate-300 dark:text-zinc-600" />
                  )}
                  <p className="text-xs text-slate-400 dark:text-zinc-500">{t("demoMicHint")}</p>
                </div>
              )}
              {history.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "rounded-br-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.08] dark:text-zinc-200",
                    )}
                  >
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {msg.role === "user" ? t("demoYou") : t("demoProfessor")}
                    </p>
                    {msg.role === "ai" && i === history.length - 1 && phase !== "thinking" ? (
                      <TypeWriter text={msg.text} />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </div>
                </motion.div>
              ))}
              {phase === "thinking" && (
                <div className="flex items-center gap-2 text-xs text-indigo-500 dark:text-violet-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("demoThinking")}
                </div>
              )}
            </div>

            {/* Simulator input (typed fallback or manual ask) */}
            {(demoOn) && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendSimulated();
                }}
                className="mt-3 flex items-center gap-2"
              >
                <input
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  placeholder={t("demoTypeQuestion")}
                  className="flex-1 rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-purple-500/60 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
                />
                <button type="submit" className="btn-primary inline-flex shrink-0 items-center gap-1.5 text-sm">
                  <Send className="h-4 w-4" />
                  {t("demoSend")}
                </button>
              </form>
            )}

            {demoOn && phase === "thinking" && lastAiMessage && (
              <p className="mt-2 text-[11px] text-slate-400 dark:text-zinc-500">{t("ttsSpeaking")}…</p>
            )}
          </GlassCard>
        </section>

        <p className="pb-4 text-center text-[11px] text-slate-400 dark:text-zinc-600">
          <Languages className="mr-1 inline h-3 w-3" />
          {SPEECH_LANGS.join(" · ")} — Web Speech API · {t("voiceStudioSubtitle")}
        </p>
      </div>
    </main>
  );
}

function FadeSection({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionLabel icon={icon}>{title}</SectionLabel>
      <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">{sub}</p>
    </motion.div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-600 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-slate-400 dark:text-zinc-500">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600"
      />
    </label>
  );
}

function getSample(uiLang: "ru" | "uz" | "en" | string): string {
  switch (uiLang) {
    case "uz":
      return "Assalomu alaykum! UniOS ovozli studiyasiga xush kelibsiz.";
    case "en":
      return "Welcome to the UniOS Voice Studio. Let us speak together!";
    default:
      return "Здравствуйте! Добро пожаловать в голосовую студию UniOS.";
  }
}