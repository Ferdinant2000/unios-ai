import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  getCurrentUserId,
  getFirestoreSafe,
  isLiveConfigured,
} from "@/lib/firebase";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/data/pricing";

/**
 * Подписка пользователя. Сохраняется в Firestore:
 *   users/{uid}/subscription -> { planId, status, startDate, endDate,
 *                                autoRenew, notifyBeforeDays }
 * При невалидном Firebase-конфиге работает gracefallback в localStorage,
 * чтобы в демо-режиме интерфейс не падал.
 */

export interface UserSubscription {
  planId: SubscriptionPlanId;
  status: "active";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  notifyBeforeDays: number;
}

const LS_KEY = "unios:subscription";

const isClientSide = () => typeof window !== "undefined";

function loadDemo(): UserSubscription | null {
  if (!isClientSide()) return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as UserSubscription) : null;
  } catch {
    return null;
  }
}

function saveDemo(subscription: UserSubscription) {
  if (!isClientSide()) return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(subscription));
  } catch (err) {
    console.error("[subscription] localStorage write failed", err);
  }
}

async function firestoreOrDemo<T>(
  op: () => Promise<T>,
  demo: () => T | Promise<T>,
  timeoutMs = 2500,
): Promise<T> {
  try {
    return await Promise.race([
      op().catch((err) => {
        console.warn("[subscription] Firestore op failed, falling back to demo backend", err);
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

function computeEndDate(months: number): string {
  const now = new Date();
  now.setMonth(now.getMonth() + months);
  return now.toISOString();
}

function planMonths(planId: SubscriptionPlanId): number {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  return plan?.months ?? 3;
}

/** Активирует подписку: пишет `users/{uid}/subscription` (или localStorage). */
export async function activateSubscription(planId: SubscriptionPlanId): Promise<UserSubscription> {
  const subscription: UserSubscription = {
    planId,
    status: "active",
    startDate: new Date().toISOString(),
    endDate: computeEndDate(planMonths(planId)),
    autoRenew: true,
    notifyBeforeDays: 7,
  };

  const db = getFirestoreSafe();
  if (db && isLiveConfigured) {
    return firestoreOrDemo(
      async () => {
        const uid = await getCurrentUserId();
        await setDoc(doc(db, "users", uid, "subscription", "current"), subscription, {
          merge: true,
        });
        saveDemo(subscription);
        return subscription;
      },
      async () => {
        saveDemo(subscription);
        return subscription;
      },
    );
  }

  saveDemo(subscription);
  return subscription;
}

/** Текущая подписка пользователя (Firestore или localStorage). */
export async function getSubscription(): Promise<UserSubscription | null> {
  const db = getFirestoreSafe();
  if (db && isLiveConfigured) {
    return firestoreOrDemo(
      async () => {
        const uid = await getCurrentUserId();
        const snap = await getDoc(doc(db, "users", uid, "subscription", "current"));
        if (snap.exists()) {
          const data = snap.data() as UserSubscription;
          saveDemo(data);
          return data;
        }
        return loadDemo();
      },
      () => loadDemo(),
    );
  }
  return loadDemo();
}