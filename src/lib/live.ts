import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  DEMO_TEACHER_ID,
  getCurrentUserId,
  getFirestoreSafe,
  isLiveConfigured,
} from "@/lib/firebase";
import { getCourseById, getLectureById, timeToSeconds } from "@/lib/mock-hemis";

/**
 * Схема Firestore:
 *   lectures/{lectureId}            { title, topic, teacherId, teacherName,
 *                                     status: 'waiting'|'live'|'ended', createdAt }
 *   lectures/{lectureId}/sections/{sectionId}   { text, audioUrl, timestamp, order }
 *   lectures/{lectureId}/attendees/{studentId}  { studentName, joinedAt,
 *                                     listenedSectionsCount, activeMinutes }
 */

export type LiveStatus = "waiting" | "live" | "ended";

export interface LiveLecture {
  id: string;
  title: string;
  topic: string;
  teacherId: string;
  teacherName: string;
  status: LiveStatus;
  createdAt: number;
}

export interface LiveSection {
  id: string;
  text: string;
  audioUrl: string | null;
  timestamp: number;
  order: number;
  /** Длительность аудиосегмента в мс (для плеера). */
  duration?: number;
}

export interface LiveAttendee {
  id: string;
  studentName: string;
  joinedAt: number;
  listenedSectionsCount: number;
  activeMinutes: number;
}

export type Unsub = () => void;

export const LIVE_PREFIX = "unios:live";

// ---------------------------------------------------------------------------
// Demo-бэкенд: localStorage + storage-событие (синк между вкладками).
// Используется, пока NEXT_PUBLIC_FIREBASE_CONFIG не настроен.
// ---------------------------------------------------------------------------

const lsLectureKey = (id: string) => `${LIVE_PREFIX}:lecture:${id}`;
const lsSectionsKey = (id: string) => `${LIVE_PREFIX}:sections:${id}`;
const lsAttendeesKey = (id: string) => `${LIVE_PREFIX}:attendees:${id}`;
const LS_INDEX = `${LIVE_PREFIX}:lectures`;

// Персистентное зеркало секций лекции: Blob-URL не переживает навигацию,
// поэтому записанное аудио хранится как Data URL (base64) под этим ключом
// и читается на странице студента /student/lecture/[id].
const lsLectureDataKey = (id: string) => `unios:lecture:${id}:data`;

const isClientSide = () => typeof window !== "undefined";

function lsGet<T>(key: string, fallback: T): T {
  if (!isClientSide()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  if (!isClientSide()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("[live] localStorage write failed", err);
  }
}

const demoListeners = new Map<string, Set<() => void>>();

function demoOn(channel: string, cb: () => void): Unsub {
  const set = demoListeners.get(channel) ?? new Set<() => void>();
  set.add(cb);
  demoListeners.set(channel, set);
  return () => {
    set.delete(cb);
  };
}

function demoEmit(channel: string) {
  demoListeners.get(channel)?.forEach((cb) => cb());
}

function ensureStorageListener() {
  if (!isClientSide() || (window as unknown as { __uniosLiveSynced?: boolean }).__uniosLiveSynced) {
    return;
  }
  (window as unknown as { __uniosLiveSynced: boolean }).__uniosLiveSynced = true;
  window.addEventListener("storage", (event) => {
    if (!event.key || !event.key.startsWith(`${LIVE_PREFIX}:`)) return;
    const id = event.key.split(":").slice(2).join(":");
    if (event.key === LS_INDEX) {
      demoListeners.forEach((_set, channel) => {
        if (channel.startsWith("teacher:")) demoEmit(channel);
      });
    } else {
      if (event.key === lsLectureKey(id)) demoEmit(`lecture:${id}`);
      if (event.key === lsSectionsKey(id)) demoEmit(`sections:${id}`);
      if (event.key === lsAttendeesKey(id)) demoEmit(`attendees:${id}`);
      demoListeners.forEach((_set, channel) => {
        if (channel.startsWith("teacher:")) demoEmit(channel);
      });
    }
  });
}

function demoCurrentUserId(): string | null {
  if (!isClientSide()) return null;
  return window.localStorage.getItem("unios:live:me");
}

function demoIndexLectures(): string[] {
  return lsGet<string[]>(LS_INDEX, []);
}

function demoLoadLecture(id: string): LiveLecture | null {
  return lsGet<LiveLecture | null>(lsLectureKey(id), null);
}

function demoSaveLecture(lecture: LiveLecture) {
  lsSet(lsLectureKey(lecture.id), lecture);
  const index = demoIndexLectures();
  if (!index.includes(lecture.id)) {
    lsSet(LS_INDEX, [...index, lecture.id]);
  }
}

// ---------------------------------------------------------------------------
// Публичное API
// ---------------------------------------------------------------------------

/**
 * Пытается выполнить Firestore-операцию. Если она отклоняется или не успевает
 * за timeoutMs (например, невалидный API-ключ в конфиге), деградирует в
 * demo-ветку, чтобы приложение продолжало работать.
 */
async function firestoreOrDemo<T>(
  op: () => Promise<T>,
  demo: () => T | Promise<T>,
  timeoutMs = 2500,
): Promise<T> {
  try {
    return await Promise.race([
      op().catch((err) => {
        console.warn("[live] Firestore op failed, falling back to demo backend", err);
        return demo();
      }),
      new Promise<never>((_res, rej) =>
        setTimeout(() => rej(new Error("firestore timeout")), timeoutMs),
      ),
    ]);
  } catch {
    return demo();
  }
}

/**
 * Обёртка для onSnapshot с деградацией в demo-режим: если данные не пришли
 * за timeoutMs или слушатель упал с ошибкой (битый ключ, offline), переключает
 * подписку на localStorage-demo.
 */
function fsOrDemoSubscribe(
  startFs: (h: { markLive: () => void; fallback: () => void }) => Unsub,
  subscribeDemo: () => Unsub,
  timeoutMs = 2500,
): Unsub {
  let demoFallback: Unsub | null = null;
  let fsUnsub: Unsub | null = null;
  let settled = false;
  const toDemo = () => {
    if (settled || demoFallback) return;
    console.warn("[live] Firestore subscription failed, falling back to demo backend");
    fsUnsub?.();
    demoFallback = subscribeDemo();
  };
  const timer = setTimeout(toDemo, timeoutMs);
  const markLive = () => {
    settled = true;
    clearTimeout(timer);
  };
  try {
    fsUnsub = startFs({ markLive, fallback: toDemo });
  } catch (err) {
    console.warn("[live] Firestore subscription failed, falling back to demo backend", err);
    toDemo();
  }
  return () => {
    settled = true;
    clearTimeout(timer);
    fsUnsub?.();
    demoFallback?.();
  };
}

/** Создаёт лекцию и возвращает её id. */
export async function createLiveLecture(input: {
  title: string;
  topic: string;
  teacherName: string;
}): Promise<string> {
  const teacherId = isLiveConfigured
    ? (await getCurrentUserId()) || DEMO_TEACHER_ID
    : DEMO_TEACHER_ID;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `lec-${Date.now()}`;
  const lecture: LiveLecture = {
    id,
    title: input.title.trim(),
    topic: input.topic.trim(),
    teacherId,
    teacherName: input.teacherName,
    status: "waiting",
    createdAt: Date.now(),
  };

  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await setDoc(doc(db, "lectures", id), lecture);
        return id;
      },
      async () => {
        ensureStorageListener();
        demoSaveLecture(lecture);
        demoEmit(`lecture:${id}`);
        demoEmit(`teacher:${teacherId}`);
        return id;
      },
    );
  }
  ensureStorageListener();
  demoSaveLecture(lecture);
  demoEmit(`lecture:${id}`);
  demoEmit(`teacher:${teacherId}`);
  return id;
}

/** Читает лекцию (или null). */
export async function getLiveLecture(id: string): Promise<LiveLecture | null> {
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        const snap = await getDoc(doc(db, "lectures", id));
        return snap.exists() ? (snap.data() as LiveLecture) : null;
      },
      () => (isClientSide() ? demoLoadLecture(id) : null),
    );
  }
  if (!isClientSide()) return null;
  return demoLoadLecture(id);
}

/** Подписка на документ лекции. Передаёт актуальное значение сразу. */
export function subscribeLiveLecture(
  id: string,
  cb: (lecture: LiveLecture | null) => void,
): Unsub {
  const db = getFirestoreSafe();
  if (db) {
    return fsOrDemoSubscribe(
      ({ markLive, fallback }) =>
        onSnapshot(
          doc(db, "lectures", id),
          (snap) => {
            markLive();
            cb(snap.exists() ? (snap.data() as LiveLecture) : null);
          },
          fallback,
        ),
      () => {
        if (!isClientSide()) return () => {};
        ensureStorageListener();
        const off = demoOn(`lecture:${id}`, () => cb(demoLoadLecture(id)));
        cb(demoLoadLecture(id));
        return off;
      },
    );
  }
  if (!isClientSide()) return () => {};
  ensureStorageListener();
  const off = demoOn(`lecture:${id}`, () => {
    cb(demoLoadLecture(id));
  });
  cb(demoLoadLecture(id));
  return off;
}

/** Изменение статуса лекции. */
export async function setLiveLectureStatus(
  id: string,
  status: LiveStatus,
): Promise<void> {
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await updateDoc(doc(db, "lectures", id), { status });
      },
      async () => {
        const lecture = demoLoadLecture(id);
        if (lecture) {
          const updated = { ...lecture, status };
          demoSaveLecture(updated);
          demoEmit(`lecture:${id}`);
          demoEmit(`teacher:${lecture.teacherId}`);
        }
      },
    );
  }
  const lecture = demoLoadLecture(id);
  if (!lecture) return;
  const updated = { ...lecture, status };
  demoSaveLecture(updated);
  demoEmit(`lecture:${id}`);
  demoEmit(`teacher:${lecture.teacherId}`);
}

/** Подписка на секции лекции (по порядку). */
export function subscribeSections(
  lectureId: string,
  cb: (sections: LiveSection[]) => void,
): Unsub {
  const db = getFirestoreSafe();
  if (db) {
    return fsOrDemoSubscribe(
      ({ markLive, fallback }) => {
        const collectionRef = collection(db, "lectures", lectureId, "sections");
        const q = query(collectionRef, orderBy("order", "asc"));
        return onSnapshot(
          q,
          (snap) => {
            markLive();
            cb(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<LiveSection, "id">),
              })),
            );
          },
          fallback,
        );
      },
      () => {
        if (!isClientSide()) return () => {};
        ensureStorageListener();
        const off = demoOn(`sections:${lectureId}`, () => {
          cb(lsGet<LiveSection[]>(lsSectionsKey(lectureId), []));
        });
        cb(lsGet<LiveSection[]>(lsSectionsKey(lectureId), []));
        return off;
      },
    );
  }
  if (!isClientSide()) return () => {};
  ensureStorageListener();
  const off = demoOn(`sections:${lectureId}`, () => {
    cb(lsGet<LiveSection[]>(lsSectionsKey(lectureId), []));
  });
  cb(lsGet<LiveSection[]>(lsSectionsKey(lectureId), []));
  return off;
}

/** Добавляет секцию распознанной речи. */
export async function addLiveSection(
  lectureId: string,
  input: { text: string; audioUrl?: string | null; duration?: number },
): Promise<void> {
  const text = input.text.trim();
  if (!text) return;
  const now = Date.now();
  const data = {
    text,
    audioUrl: input.audioUrl ?? null,
    duration: input.duration,
    timestamp: now,
    order: now,
  };
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await addDoc(collection(db, "lectures", lectureId, "sections"), data);
      },
      async () => {
        const sections = lsGet<LiveSection[]>(lsSectionsKey(lectureId), []);
        const next = [...sections, section];
        lsSet(lsSectionsKey(lectureId), next);
        persistLectureData(lectureId, next);
        demoEmit(`sections:${lectureId}`);
      },
    );
  }
  const sections = lsGet<LiveSection[]>(lsSectionsKey(lectureId), []);
  const section: LiveSection = {
    id: `sec-${now}`,
    ...data,
  };
  const next = [...sections, section];
  lsSet(lsSectionsKey(lectureId), next);
  persistLectureData(lectureId, next);
  demoEmit(`sections:${lectureId}`);
}

/** Обновляет текст/аудио секции (редактор преподавателя). */
export async function updateLiveSection(
  lectureId: string,
  sectionId: string,
  patch: Partial<Pick<LiveSection, "text" | "audioUrl" | "duration">>,
): Promise<void> {
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await updateDoc(doc(db, "lectures", lectureId, "sections", sectionId), patch);
      },
      async () => {
        const sections = lsGet<LiveSection[]>(lsSectionsKey(lectureId), []);
        const next = sections.map((section) =>
          section.id === sectionId ? { ...section, ...patch } : section,
        );
        lsSet(lsSectionsKey(lectureId), next);
        persistLectureData(lectureId, next);
        demoEmit(`sections:${lectureId}`);
      },
    );
  }
  const sections = lsGet<LiveSection[]>(lsSectionsKey(lectureId), []);
  const next = sections.map((section) =>
    section.id === sectionId ? { ...section, ...patch } : section,
  );
  lsSet(lsSectionsKey(lectureId), next);
  persistLectureData(lectureId, next);
  demoEmit(`sections:${lectureId}`);
}

/** Удаляет секцию (редактор преподавателя). */
export async function deleteLiveSection(
  lectureId: string,
  sectionId: string,
): Promise<void> {
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await deleteDoc(doc(db, "lectures", lectureId, "sections", sectionId));
      },
      async () => {
        const sections = lsGet<LiveSection[]>(lsSectionsKey(lectureId), []);
        const next = sections.filter((section) => section.id !== sectionId);
        lsSet(lsSectionsKey(lectureId), next);
        persistLectureData(lectureId, next);
        demoEmit(`sections:${lectureId}`);
      },
    );
  }
  const sections = lsGet<LiveSection[]>(lsSectionsKey(lectureId), []);
  const next = sections.filter((section) => section.id !== sectionId);
  lsSet(lsSectionsKey(lectureId), next);
  persistLectureData(lectureId, next);
  demoEmit(`sections:${lectureId}`);
}

/**
 * Локальный архив для демо-лекций из mock-hemis (lec-*).
 * Используется, когда лекция ещё не создана как live — читается без записи
 * в Firestore, чтобы не засорять общую коллекцию демо-контентом.
 */
export function buildLocalArchive(
  id: string,
): { lecture: LiveLecture; sections: LiveSection[]; localOnly: boolean } | null {
  const mock = getLectureById(id);
  if (!mock) return null;
  const course = getCourseById(mock.courseId);
  const lecture: LiveLecture = {
    id: mock.id,
    title: mock.title,
    topic: mock.title,
    teacherId: DEMO_TEACHER_ID,
    teacherName: course?.professorName ?? "—",
    status: "ended",
    createdAt: 0,
  };
  const sections: LiveSection[] = mock.transcript.map((segment, index) => {
    const start = timeToSeconds(segment.time) * 1000;
    const nextStart =
      timeToSeconds(mock.transcript[index + 1]?.time ?? "99:59") * 1000;
    return {
      id: `seed-${index}`,
      text: segment.text,
      audioUrl: null,
      timestamp: start,
      order: index,
      duration: Math.max(nextStart - start, 25_000),
    };
  });
  return { lecture, sections, localOnly: true };
}

/** Подписка на список слушателей. */
export function subscribeAttendees(
  lectureId: string,
  cb: (attendees: LiveAttendee[]) => void,
): Unsub {
  const db = getFirestoreSafe();
  if (db) {
    return fsOrDemoSubscribe(
      ({ markLive, fallback }) => {
        const attendeesRef = collection(db, "lectures", lectureId, "attendees");
        return onSnapshot(
          query(attendeesRef, orderBy("joinedAt", "asc")),
          (snap) => {
            markLive();
            cb(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<LiveAttendee, "id">),
              })),
            );
          },
          fallback,
        );
      },
      () => {
        if (!isClientSide()) return () => {};
        ensureStorageListener();
        const off = demoOn(`attendees:${lectureId}`, () => {
          cb(Object.values(lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {})));
        });
        cb(Object.values(lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {})));
        return off;
      },
    );
  }
  if (!isClientSide()) return () => {};
  ensureStorageListener();
  const off = demoOn(`attendees:${lectureId}`, () => {
    cb(Object.values(lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {})));
  });
  cb(Object.values(lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {})));
  return off;
}

/** Фиксирует присутствие студента (idempotent — не сбрасывает прогресс). */
export async function joinLiveLecture(
  lectureId: string,
  studentName: string,
): Promise<void> {
  const studentId = (await getCurrentUserId()) || `guest-${Date.now()}`;
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await setDoc(
          doc(db, "lectures", lectureId, "attendees", studentId),
          { studentName, joinedAt: Date.now() },
          { merge: true },
        );
      },
      async () => {
        const attendees = lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {});
        const existing = attendees[studentId] ?? {
          listenedSectionsCount: 0,
          activeMinutes: 0,
        };
        attendees[studentId] = {
          id: studentId,
          studentName,
          joinedAt: existing.joinedAt ?? Date.now(),
          listenedSectionsCount: existing.listenedSectionsCount,
          activeMinutes: existing.activeMinutes,
        };
        lsSet(lsAttendeesKey(lectureId), attendees);
        demoEmit(`attendees:${lectureId}`);
      },
    );
  }
  const attendees = lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {});
  const existing = attendees[studentId] ?? {
    listenedSectionsCount: 0,
    activeMinutes: 0,
  };
  attendees[studentId] = {
    id: studentId,
    studentName,
    joinedAt: existing.joinedAt ?? Date.now(),
    listenedSectionsCount: existing.listenedSectionsCount,
    activeMinutes: existing.activeMinutes,
  };
  lsSet(lsAttendeesKey(lectureId), attendees);
  demoEmit(`attendees:${lectureId}`);
}

/** Отметить секцию как прослушанную (для подсчёта активности студента). */
export async function markSectionListened(
  lectureId: string,
  studentId: string,
): Promise<void> {
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await updateDoc(
          doc(db, "lectures", lectureId, "attendees", studentId),
          { listenedSectionsCount: increment(1) },
        );
      },
      async () => {
        const attendees = lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {});
        const attendee = attendees[studentId];
        if (!attendee) return;
        attendees[studentId] = {
          ...attendee,
          listenedSectionsCount: attendee.listenedSectionsCount + 1,
        };
        lsSet(lsAttendeesKey(lectureId), attendees);
        demoEmit(`attendees:${lectureId}`);
      },
    );
  }
  const attendees = lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {});
  const attendee = attendees[studentId];
  if (!attendee) return;
  attendees[studentId] = {
    ...attendee,
    listenedSectionsCount: attendee.listenedSectionsCount + 1,
  };
  lsSet(lsAttendeesKey(lectureId), attendees);
  demoEmit(`attendees:${lectureId}`);
}

/** Начислить минуты активности слушателю. */
export async function addActiveMinutes(
  lectureId: string,
  studentId: string,
  minutes: number,
): Promise<void> {
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        await updateDoc(
          doc(db, "lectures", lectureId, "attendees", studentId),
          { activeMinutes: increment(minutes) },
        );
      },
      async () => {
        const attendees = lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {});
        const attendee = attendees[studentId];
        if (!attendee) return;
        attendees[studentId] = {
          ...attendee,
          activeMinutes: attendee.activeMinutes + minutes,
        };
        lsSet(lsAttendeesKey(lectureId), attendees);
        demoEmit(`attendees:${lectureId}`);
      },
    );
  }
  const attendees = lsGet<Record<string, LiveAttendee>>(lsAttendeesKey(lectureId), {});
  const attendee = attendees[studentId];
  if (!attendee) return;
  attendees[studentId] = {
    ...attendee,
    activeMinutes: attendee.activeMinutes + minutes,
  };
  lsSet(lsAttendeesKey(lectureId), attendees);
  demoEmit(`attendees:${lectureId}`);
}

/** Подписка на лекции преподавателя (текущие и архив). */
export function subscribeTeacherLectures(
  teacherId: string,
  cb: (lectures: LiveLecture[]) => void,
): Unsub {
  const db = getFirestoreSafe();
  if (db) {
    return fsOrDemoSubscribe(
      ({ markLive, fallback }) => {
        const collectionRef = collection(db, "lectures");
        const q = query(
          collectionRef,
          where("teacherId", "==", teacherId),
          orderBy("createdAt", "desc"),
        );
        return onSnapshot(
          q,
          (snap) => {
            markLive();
            cb(
              snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<LiveLecture, "id">),
              })),
            );
          },
          fallback,
        );
      },
      () => {
        if (!isClientSide()) return () => {};
        ensureStorageListener();
        const off = demoOn(`teacher:${teacherId}`, () => {
          cb(loadTeacherLecturesDemo(teacherId));
        });
        cb(loadTeacherLecturesDemo(teacherId));
        return off;
      },
    );
  }
  if (!isClientSide()) return () => {};
  ensureStorageListener();
  const off = demoOn(`teacher:${teacherId}`, () => {
    cb(loadTeacherLecturesDemo(teacherId));
  });
  cb(loadTeacherLecturesDemo(teacherId));
  return off;
}

function loadTeacherLecturesDemo(teacherId: string): LiveLecture[] {
  const lectures = demoIndexLectures()
    .map((id) => demoLoadLecture(id))
    .filter((lecture): lecture is LiveLecture => lecture !== null)
    .filter((lecture) => lecture.teacherId === teacherId)
    .sort((a, b) => b.createdAt - a.createdAt);
  return lectures;
}

/** Полный список секций лекции (одноразовое чтение). */
export async function listSections(lectureId: string): Promise<LiveSection[]> {
  const db = getFirestoreSafe();
  if (db) {
    return firestoreOrDemo(
      async () => {
        const snap = await getDocs(
          query(
            collection(db, "lectures", lectureId, "sections"),
            orderBy("order", "asc"),
          ),
        );
        return snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LiveSection, "id">),
        }));
      },
      () => lsGet<LiveSection[]>(lsSectionsKey(lectureId), []),
    );
  }
  return lsGet<LiveSection[]>(lsSectionsKey(lectureId), []);
}

/**
 * Сохранить секции лекции в персистентное зеркало localStorage.
 * Может быть вызвано по желанию — все мутации секций уже вызывают его внутри.
 */
export function persistLectureData(lectureId: string, sections: LiveSection[]): void {
  if (!isClientSide()) return;
  lsSet(lsLectureDataKey(lectureId), sections);
}

/** Прочитать сохранённые секции лекции (или null, если записи нет). */
export function loadLectureData(lectureId: string): LiveSection[] | null {
  return lsGet<LiveSection[] | null>(lsLectureDataKey(lectureId), null);
}

/** Подписка на персистентное зеркало секций (для страницы архива). */
export function subscribeLectureData(
  lectureId: string,
  cb: (sections: LiveSection[] | null) => void,
): Unsub {
  if (!isClientSide()) return () => {};
  ensureStorageListener();
  const off = demoOn(`sections:${lectureId}`, () => {
    cb(loadLectureData(lectureId));
  });
  cb(loadLectureData(lectureId));
  return off;
}