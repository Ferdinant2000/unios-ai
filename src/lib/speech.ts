/**
 * STT (speech-to-text) через Web Speech API (Chrome/Edge).
 * Работает только в браузере; на сервере возвращает null.
 */

interface SpeechResult {
  length: number;
  [index: number]: {
    isFinal: boolean;
    [index: number]: { transcript: string };
  };
}

interface SpeechRecognitionApi {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: SpeechResult }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionCtor = new () => SpeechRecognitionApi;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface RecognizedSpeech {
  text: string;
  isFinal: boolean;
}

export interface SpeechRecognitionHandle {
  supported: boolean;
  setLang: (lang: string) => void;
  stop: () => void;
}

export const SPEECH_LANGS = {
  ru: "ru-RU",
  uz: "uz-UZ",
  en: "en-US",
} as const;

export function createSpeechRecognition(opts: {
  lang?: string;
  onRecognized: (segment: RecognizedSpeech) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}): SpeechRecognitionHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = opts.lang ?? "ru-RU";
  rec.continuous = true;
  rec.interimResults = true;

  let restarting = false;
  const safeStart = () => {
    try {
      rec.start();
    } catch {
      opts.onError?.("not-allowed");
    }
  };

  rec.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result && result[0]) {
        opts.onRecognized({
          text: result[0].transcript,
          isFinal: result.isFinal,
        });
      }
    }
  };
  rec.onend = () => {
    if (restarting) {
      restarting = false;
      safeStart();
      return;
    }
    opts.onEnd?.();
  };
  rec.onerror = (event) => opts.onError?.(event.error);

  try {
    rec.start();
  } catch {
    opts.onError?.("not-allowed");
    return null;
  }

  return {
    supported: true,
    setLang: (lang: string) => {
      rec.lang = lang;
      // Chrome выбирает языковую модель при старте сессии, поэтому плавно
      // перезапускаем распознаватель (накопленный текст живёт у вызывающего).
      restarting = true;
      try {
        rec.stop();
      } catch {
        restarting = false;
        safeStart();
      }
    },
    stop: () => {
      try {
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {
          // ignore
        }
      }
    },
  };
}