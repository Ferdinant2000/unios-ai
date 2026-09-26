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
  stop: () => void;
}

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
  rec.onend = () => opts.onEnd?.();
  rec.onerror = (event) => opts.onError?.(event.error);

  return {
    supported: true,
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