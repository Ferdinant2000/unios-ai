import {
  initializeApp,
  getApps,
  type FirebaseApp,
} from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase init (Auth + Firestore). Используется только если задан
 * `NEXT_PUBLIC_FIREBASE_CONFIG` (JSON-конфиг web-приложения). Без него
 * работает demo-режим (localStorage, анонимные uid).
 */

const CONFIG_JSON = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

export const isLiveConfigured = Boolean(CONFIG_JSON);

export type AppRole = "student" | "professor";

export interface AppUser {
  uid: string;
  name: string;
  email: string | null;
  photoURL: string | null;
  role: AppRole;
}

/** Почты преподавателей (через запятую). Пусто — преподаватели не задаются автоматически. */
const PROFESSOR_EMAILS = (process.env.NEXT_PUBLIC_PROFESSOR_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const isClientSide = () => typeof window !== "undefined";

const DEMO_ME_KEY = "unios:live:me";

function getAppSafe(): FirebaseApp | null {
  if (!isClientSide() || !CONFIG_JSON) return null;
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  try {
    return initializeApp(JSON.parse(CONFIG_JSON));
  } catch (err) {
    console.error("[firebase] invalid NEXT_PUBLIC_FIREBASE_CONFIG", err);
    return null;
  }
}

export function getFirestoreSafe(): Firestore | null {
  const app = getAppSafe();
  if (!app || !isClientSide()) return null;
  try {
    return getFirestore(app);
  } catch (err) {
    console.error("[firebase] Firestore init failed", err);
    return null;
  }
}

function getAuthSafe(): Auth | null {
  const app = getAppSafe();
  if (!app || !isClientSide()) return null;
  try {
    return getAuth(app);
  } catch (err) {
    console.error("[firebase] Auth init failed", err);
    return null;
  }
}

function getDemoUserId(): string {
  if (!isClientSide()) return "ssr";
  const existing = window.localStorage.getItem(DEMO_ME_KEY);
  if (existing) return existing;
  const created = `demo-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(DEMO_ME_KEY, created);
  return created;
}

/**
 * Создаёт/обновляет документ `users/{uid}` из данных Firebase User.
 * Роль: `professor`, если email в allowlist, иначе сохраняется текущая роль
 * (при первом входе — `student`).
 */
async function ensureUserDoc(firebaseUser: FirebaseUser): Promise<AppUser> {
  const db = getFirestoreSafe();
  const uid = firebaseUser.uid;
  const email = firebaseUser.email ?? "";
  const name =
    firebaseUser.displayName?.trim() ||
    (email.split("@")[0] ?? null) ||
    "Пользователь";
  const photoURL = firebaseUser.photoURL ?? null;

  const allowProfessor = email ? PROFESSOR_EMAILS.includes(email.toLowerCase()) : false;

  let role: AppRole = "student";
  if (allowProfessor) {
    role = "professor";
  } else if (db) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const existing = snap.data();
        if (existing.role === "professor") role = "professor";
      }
    } catch (err) {
      console.error("[firebase] user doc read failed", err);
    }
  }

  const appUser: AppUser = { uid, name, email, photoURL, role };

  if (db) {
    try {
      await setDoc(doc(db, "users", uid), appUser, { merge: true });
    } catch (err) {
      console.error("[firebase] user doc write failed", err);
    }
  }

  return appUser;
}

/** Подписка на состояние авторизации. В demo-режиме не работает (не конфигурировано). */
export function onAuthChanged(cb: (user: AppUser | null) => void): (() => void) {
  const auth = getAuthSafe();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) {
      cb(null);
      return;
    }
    void ensureUserDoc(firebaseUser).then(cb);
  });
}

/** Popup-вход через Google + запись/обновление `users/{uid}`. */
export async function signInWithGoogle(): Promise<AppUser | null> {
  const auth = getAuthSafe();
  if (!auth) return null;
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return await ensureUserDoc(credential.user);
  } catch (err) {
    console.error("[firebase] Google sign-in failed", err);
    return null;
  }
}

export async function logout(): Promise<void> {
  const auth = getAuthSafe();
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.error("[firebase] logout failed", err);
  }
}

export function getCurrentFirebaseUser(): FirebaseUser | null {
  const auth = getAuthSafe();
  if (!auth) return null;
  return auth.currentUser;
}

let anonymousUserPromise: Promise<string> | null = null;

/**
 * Возвращает стабильный идентификатор текущего пользователя.
 * При настроенном Firebase: uid залогиненного Google-пользователя или
 * анонимный вход; иначе — demo-uid в localStorage.
 */
export async function getCurrentUserId(): Promise<string> {
  const auth = getAuthSafe();
  if (!auth) return getDemoUserId();
  const current = auth.currentUser;
  if (current) return current.uid;
  if (!anonymousUserPromise) {
    anonymousUserPromise = signInAnonymously(auth)
      .then((cred) => cred.user.uid)
      .catch((err) => {
        console.warn(
          "[firebase] anonymous sign-in unavailable, using demo id (check NEXT_PUBLIC_FIREBASE_CONFIG)",
          err,
        );
        anonymousUserPromise = null;
        return getDemoUserId();
      });
  }
  return anonymousUserPromise;
}

export const DEMO_TEACHER_ID = "demo-professor";