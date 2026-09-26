/**
 * Speech engine: STT (SpeechRecognition) + TTS (speechSynthesis).
 * Работает только в браузере; все обращения к Web Speech API защищены
 * через typeof window и запускаются только клиентски (по жесту пользователя).
 * Полностью офлайн — идеально для интерактивной презентации без базы данных.
 */

export type SpeechLang = "uz" | "ru" | "en";
export type SpeechLocale = "uz-UZ" | "ru-RU" | "en-US";
export type VoiceGender = "male" | "female" | "professor";

export const SPEECH_LOCALES: Record<SpeechLang, SpeechLocale> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

export const SPEECH_LANGS: SpeechLang[] = ["uz", "ru", "en"];

// ---------------------------------------------------------------------------
// Web Speech API (SpeechRecognition) — отсутствует в lib.dom, описываем типы
// ---------------------------------------------------------------------------

interface SpeechAlternative {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechAlternative;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSTTSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ---------------------------------------------------------------------------
// Точки входа для UI
// ---------------------------------------------------------------------------

export interface STTHandlers {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onStart?: () => void;
  onEnd?: (manuallyStopped: boolean) => void;
  onError?: (code: string) => void;
}

export interface SpeakOptions {
  text: string;
  lang: SpeechLang;
  rate?: number;
  pitch?: number;
  volume?: number;
  gender?: VoiceGender;
  onStart?: () => void;
  onEnd?: () => void;
}

export class SpeechEngine {
  private rec: SpeechRecognitionLike | null = null;
  private recManuallyStopped = true;
  private recActive = false;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speakingState = false;
  private voiceCache: SpeechSynthesisVoice[] | null = null;
  private voicesLoadedAt = 0;

  constructor() {
    if (isTTSSupported()) {
      this.synth = window.speechSynthesis;
      this.synth.onvoiceschanged = () => {
        this.voiceCache = null;
      };
      this.voiceCache = this.synth.getVoices();
    }
  }

  // ---- STT ----------------------------------------------------------------

  startListening(lang: SpeechLang, handlers: STTHandlers): boolean {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return false;

    const rec = this.rec ?? new Ctor();
    this.rec = rec;
    rec.lang = SPEECH_LOCALES[lang];
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => handlers.onStart?.();

    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result || !result[0]) continue;
        const transcript = result[0].transcript;
        if (result.isFinal) {
          handlers.onFinal(transcript);
        } else {
          handlers.onInterim(transcript);
        }
      }
    };

    rec.onerror = (event) => {
      handlers.onError?.(event.error || event.message || "unknown");
    };

    rec.onend = () => {
      // Авто-перезапуск: держим «сессию» живой, пока пользователь не остановил сам
      if (!this.recManuallyStopped && this.recActive && this.rec === rec) {
        try {
          rec.start();
        } catch {
          this.recActive = false;
          handlers.onEnd?.(false);
        }
      } else {
        this.recActive = false;
        handlers.onEnd?.(this.recManuallyStopped);
      }
    };

    this.recActive = true;
    this.recManuallyStopped = false;
    try {
      rec.start();
      return true;
    } catch {
      this.recActive = false;
      return false;
    }
  }

  stopListening(): boolean {
    this.recManuallyStopped = true;
    this.recActive = false;
    if (!this.rec) return false;
    try {
      this.rec.stop();
      return true;
    } catch {
      try {
        this.rec.abort();
        return true;
      } catch {
        return false;
      }
    }
  }

  cancelListening(): void {
    this.recManuallyStopped = true;
    this.recActive = false;
    if (this.rec) {
      try {
        this.rec.abort();
      } catch {
        // ignore
      }
    }
  }

  // ---- TTS / Voices -------------------------------------------------------

  private loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const now = Date.now();
    if (this.voiceCache && now - this.voicesLoadedAt < 15000) return this.voiceCache;
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      this.voiceCache = voices;
      this.voicesLoadedAt = now;
    }
    return voices;
  }

  getVoices(lang: SpeechLang): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const locale = SPEECH_LOCALES[lang];
    const prefix = lang;
    const voices = this.loadVoices();
    const exact = voices.filter(
      (v) => v.lang.toLowerCase() === locale.toLowerCase(),
    );
    if (exact.length > 0) return exact;
    return voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  }

  pickVoice(lang: SpeechLang, gender: VoiceGender = "professor"): SpeechSynthesisVoice | null {
    const pool = this.getVoices(lang);
    if (pool.length === 0) return null;

    const byGender = pool.filter((v) => {
      const name = v.name.toLowerCase();
      if (gender === "male") {
        return (
          name.includes("male") ||
          name.includes(" муж") ||
          name.includes("mikhail") ||
          name.includes("dmitry") ||
          name.includes("pavel") ||
          name.includes("aleksandr") ||
          name.includes("guy")
        );
      }
      if (gender === "female") {
        return (
          name.includes("female") ||
          name.includes("жен") ||
          name.includes("svetlana") ||
          name.includes("aisha") ||
          name.includes("aria") ||
          name.includes("jenny") ||
          name.includes("zira") ||
          name.includes("google us english")
        );
      }
      // Профессор UniOS: более «серьёзный» участник пула
      return (
        name.includes("male") ||
        name.includes("mikhail") ||
        name.includes("dmitry") ||
        name.includes("google uk english male")
      );
    });

    const preferNatural = byGender.length > 0 ? byGender : pool;
    const natural = preferNatural.filter((v) => /natural/i.test(v.name));
    return (natural[0] ?? preferNatural[0] ?? pool[0]) || null;
  }

  speak(options: SpeakOptions): boolean {
    if (!this.synth || !options.text.trim()) return false;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.lang = SPEECH_LOCALES[options.lang];
    utterance.rate = clamp(options.rate ?? 1, 0.8, 1.5);
    utterance.pitch = clamp(options.pitch ?? 1, 0.9, 1.2);
    utterance.volume = clamp(options.volume ?? 1, 0, 1);

    const voice = this.pickVoice(options.lang, options.gender ?? "professor");
    if (voice) utterance.voice = voice;

    const finish = () => {
      this.speakingState = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onstart = () => {
      this.speakingState = true;
      options.onStart?.();
    };
    utterance.onend = finish;
    utterance.onerror = () => finish();

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  pause(): boolean {
    if (!this.synth || !this.speakingState) return false;
    this.synth.pause();
    return true;
  }

  resume(): boolean {
    if (!this.synth) return false;
    this.synth.resume();
    return true;
  }

  cancel(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this.speakingState = false;
    this.currentUtterance = null;
  }

  get speaking(): boolean {
    return this.speakingState;
  }
}

export const speechEngineFactory = (): SpeechEngine | null => {
  if (typeof window === "undefined") return null;
  return new SpeechEngine();
};