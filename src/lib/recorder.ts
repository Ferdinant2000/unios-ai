export interface RecorderResult {
  dataUrl: string;
  durationMs: number;
}

interface MicRecorder {
  stop: () => Promise<RecorderResult | null>;
}

const STOPPED = "stopped";

export function isRecorderSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator?.mediaDevices?.getUserMedia)
  );
}

/**
 * Создаёт сессию записи микрофона. Каждый вызов создаёт новый сегмент:
 * stop() возвращает DataURL аудио и реальную длительность в мс.
 * Возвращает null, если микрофон недоступен/отклонён.
 */
export async function createMicRecorder(): Promise<MicRecorder | null> {
  if (!isRecorderSupported()) return null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const supportedTypes =
      typeof MediaRecorder.isTypeSupported === "function"
        ? [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/mp4",
          ]
        : [];
    const mimeType = supportedTypes.find((mime) =>
      MediaRecorder.isTypeSupported(mime),
    );
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined,
    );

    const chunks: Blob[] = [];
    const startedAt = Date.now();
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {
        // ignore
      }
    };
    recorder.start(500);

    let state: "recording" | typeof STOPPED = "recording";

    return {
      stop: () =>
        new Promise<RecorderResult | null>((resolve) => {
          if (state === STOPPED) {
            resolve(null);
            return;
          }
          state = STOPPED;

          const finish = () => {
            try {
              stream.getTracks().forEach((track) => track.stop());
            } catch {
              // ignore
            }
            if (chunks.length === 0) {
              resolve(null);
              return;
            }
            const blob = new Blob(chunks, {
              type: mimeType || recorder.mimeType || "audio/webm",
            });
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                dataUrl: String(reader.result),
                durationMs: Date.now() - startedAt,
              });
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          };

          if (recorder.state !== "inactive") {
            recorder.onstop = finish;
            try {
              recorder.stop();
            } catch {
              finish();
            }
          } else {
            finish();
          }
        }),
    };
  } catch {
    return null;
  }
}