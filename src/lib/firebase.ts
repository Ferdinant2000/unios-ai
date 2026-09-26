import {
  initializeApp,
  getApps,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firestore/Auth инициализируется ТОЛЬКО для модуля живых лекций.
 * Конфиг приходит из `NEXT_PUBLIC_FIREBASE_CONFIG` (JSON с ключами web-приложения:
 * apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
 *
 * Если конфиг не задан — приложение работает в demo-режиме: live-лекции
 * синхронизируются через localStorage (вкладки одного браузера).
 */
const CONFIG_JSON = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

export const isLiveConfigured = Boolean(CONFIG_JSON);

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

let anonymousUserPromise: Promise<string> | null = null;

/**
 * Возвращает стабильный идентификатор текущего пользователя.
 * При настроенном Firebase — анонимный вход (Firebase Auth), иначе — demo-uid.
 */
export async function getCurrentUserId(): Promise<string> {
  const auth = getAuthSafe();
  if (auth) {
    if(!anonymousUserPromise) {
      anonymousUserPromise = signInAnonymously(auth)
        .then((cred) => cred.user.uid)
        .catch((err) => {
          console.error("[firebase] anonymous sign-in failed, using demo id", err);
          anonymousUserPromise = null;
          return getDemoUserId();
        });
    }
    return anonymousUserPromise;
  }
  return getDemoUserId();
}

export const DEMO_TEACHER_ID = "demo-professor";