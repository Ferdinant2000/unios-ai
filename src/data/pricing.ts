import type { TranslationKey } from "@/lib/translations";

/**
 * B2C-подписки UniOS AI.
 * Тексты хранятся как ключи переводов — узбекский, русский и английский
 * словари в `src/lib/translations.ts`.
 */

export type SubscriptionPlanId = "baza" | "pro" | "ultimate";

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  /** Название тарифа (Baza AI / Pro AI Prep / Ultimate Pass). */
  planKey: TranslationKey;
  /** Срок подписки (3 Oy / 6 Oy / 12 Oy · Yillik). */
  durationKey: TranslationKey;
  /** Целевая аудитория тарифа. */
  audienceKey: TranslationKey;
  /** Период в месяцах (используется для endDate). */
  months: number;
  /** Рекламная цена за месяц ($15 / $12 / $10). */
  pricePerMonth: number;
  /** Итоговая сумма списания ($45 / $72 / $120). */
  totalPrice: number;
  /** Альтернативный месячный пересчёт (например, $17/oy у Baza). */
  monthlyRecalc: number | null;
  /** Бейдж экономии (15% / 25% / 40%). */
  savingsPercent: number;
  /** Бейдж «Популярный / Mashhur». */
  popular?: boolean;
  badgeKey?: TranslationKey;
  /** Ultimate Pass — доступ к родительскому кабинету. */
  parentDashboard?: boolean;
  featuresKey: TranslationKey[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "baza",
    planKey: "pricingPlanBaza",
    durationKey: "pricingDurationBaza",
    audienceKey: "pricingAudienceBaza",
    months: 3,
    pricePerMonth: 15,
    totalPrice: 45,
    monthlyRecalc: 17,
    savingsPercent: 15,
    featuresKey: [
      "pricingFeatBaza1",
      "pricingFeatBaza2",
      "pricingFeatBaza3",
      "pricingFeatBaza4",
    ],
  },
  {
    id: "pro",
    planKey: "pricingPlanPro",
    durationKey: "pricingDurationPro",
    audienceKey: "pricingAudiencePro",
    months: 6,
    pricePerMonth: 12,
    totalPrice: 72,
    monthlyRecalc: null,
    savingsPercent: 25,
    popular: true,
    badgeKey: "pricingBadgePopular",
    featuresKey: [
      "pricingFeatPro1",
      "pricingFeatPro2",
      "pricingFeatPro3",
      "pricingFeatPro4",
    ],
  },
  {
    id: "ultimate",
    planKey: "pricingPlanUltimate",
    durationKey: "pricingDurationUltimate",
    audienceKey: "pricingAudienceUltimate",
    months: 12,
    pricePerMonth: 10,
    totalPrice: 120,
    monthlyRecalc: null,
    savingsPercent: 40,
    parentDashboard: true,
    featuresKey: [
      "pricingFeatUlt1",
      "pricingFeatUlt2",
      "pricingFeatUlt3",
      "pricingFeatUlt4",
    ],
  },
];

/** Итоговый месячный пересчёт для карточки (рекламный или альтернативный). */
export function planMonthlyText(plan: SubscriptionPlan): number {
  return plan.pricePerMonth;
}