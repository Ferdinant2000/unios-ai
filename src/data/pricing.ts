import type { TranslationKey } from "@/lib/translations";

export interface PricingPeriod {
  months: number;
  discount: number;
  recommended?: boolean;
  bestValue?: boolean;
}

export const PRICING_PERIODS: PricingPeriod[] = [
  { months: 3, discount: 0 },
  { months: 6, discount: 10 },
  { months: 9, discount: 15, recommended: true },
  { months: 12, discount: 25, bestValue: true },
];

export type PricingTierId = "filial" | "standard" | "large" | "enterprise";

export interface PricingTier {
  id: PricingTierId;
  nameKey: TranslationKey;
  limitKey: TranslationKey;
  basePricePer3Months: number | null;
  monthlyEquivalent: number | null;
  badgeKey?: TranslationKey;
  popular?: boolean;
  featuresKey: TranslationKey[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "filial",
    nameKey: "pricingTierFilial",
    limitKey: "pricingLimitFilial",
    basePricePer3Months: 1200,
    monthlyEquivalent: 400,
    featuresKey: [
      "pricingFeatureBase1",
      "pricingFeatureBase2",
      "pricingFeatureBase3",
      "pricingFeatureBase4",
    ],
  },
  {
    id: "standard",
    nameKey: "pricingTierStandard",
    limitKey: "pricingLimitStandard",
    basePricePer3Months: 2400,
    monthlyEquivalent: 800,
    featuresKey: [
      "pricingFeatureStd1",
      "pricingFeatureStd2",
      "pricingFeatureStd3",
      "pricingFeatureStd4",
    ],
  },
  {
    id: "large",
    nameKey: "pricingTierLarge",
    limitKey: "pricingLimitLarge",
    basePricePer3Months: 4200,
    monthlyEquivalent: 1400,
    badgeKey: "pricingBadgePopular",
    popular: true,
    featuresKey: [
      "pricingFeatureLarge1",
      "pricingFeatureLarge2",
      "pricingFeatureLarge3",
      "pricingFeatureLarge4",
    ],
  },
  {
    id: "enterprise",
    nameKey: "pricingTierEnterprise",
    limitKey: "pricingLimitEnterprise",
    basePricePer3Months: null,
    monthlyEquivalent: null,
    featuresKey: [
      "pricingFeatureEnt1",
      "pricingFeatureEnt2",
      "pricingFeatureEnt3",
      "pricingFeatureEnt4",
    ],
  },
];

export function calcPricing(
  monthlyEquivalent: number,
  months: number,
  discount: number,
) {
  const total = monthlyEquivalent * months * (1 - discount / 100);
  return {
    total: Math.round(total),
    perMonth: Math.round(total / months),
  };
}