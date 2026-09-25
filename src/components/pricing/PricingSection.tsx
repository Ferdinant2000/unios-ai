"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";
import {
  PRICING_PERIODS,
  PRICING_TIERS,
  calcPricing,
  type PricingPeriod,
  type PricingTier,
} from "@/data/pricing";

function formatUSD(value: number) {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function PricingCard({
  tier,
  period,
  index,
}: {
  tier: PricingTier;
  period: PricingPeriod;
  index: number;
}) {
  const { t } = useLanguage();
  const custom = tier.basePricePer3Months === null;
  const price = useMemo(
    () =>
      calcPricing(tier.monthlyEquivalent ?? 0, period.months, period.discount),
    [tier.monthlyEquivalent, period.months, period.discount],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="h-full"
    >
      <div
        className={cn(
          "group relative h-full rounded-3xl p-px transition-shadow duration-300",
          tier.popular
            ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-purple-500/25"
            : "bg-gradient-to-br from-slate-300/80 to-slate-300/40 hover:shadow-xl hover:shadow-purple-500/15 dark:from-white/15 dark:to-white/[0.04]",
        )}
      >
        <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-white/90 p-5 backdrop-blur-xl dark:bg-ink/80 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t(tier.nameKey)}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs leading-snug text-slate-500 dark:text-zinc-400">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {t(tier.limitKey)}
              </p>
            </div>
            {tier.badgeKey && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  tier.popular
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
                )}
              >
                <Sparkles className="h-3 w-3" />
                {t(tier.badgeKey)}
              </span>
            )}
          </div>

          {custom ? (
            <div className="mt-2">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("pricingCustom")}
              </p>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                {t("pricingCustomNote")}
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <motion.div
                key={period.months}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-end gap-1"
              >
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {formatUSD(price.total)}
                </span>
                <span className="pb-1 text-xs font-medium text-slate-400 dark:text-zinc-500">
                  {t("pricingPerPeriod")}
                </span>
              </motion.div>
              <p className="mt-1 text-xs font-semibold text-indigo-500 dark:text-violet-300">
                {t("pricingMonthlyEquivalent", { price: formatUSD(price.perMonth) })}
              </p>
            </div>
          )}

          <div className="my-5 h-px w-full bg-slate-200 dark:bg-white/10" />

          <ul className="mb-6 flex flex-col gap-2.5">
            {tier.featuresKey.map((key) => (
              <li
                key={key}
                className="flex items-start gap-2.5 text-sm leading-snug text-slate-600 dark:text-zinc-300"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600/15 to-purple-600/15 text-indigo-500 dark:text-violet-300">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={cn("w-full", custom ? "btn-ghost" : "btn-primary")}
            >
              {t(custom ? "pricingSignContract" : "pricingSubmit")}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingSection({ className }: { className?: string }) {
  const { t } = useLanguage();
  const [selectedMonths, setSelectedMonths] = useState(12);
  const period =
    PRICING_PERIODS.find((p) => p.months === selectedMonths) ??
    PRICING_PERIODS[0];

  return (
    <div className={className}>
      <FadeIn>
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-slate-200 bg-white/70 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            {PRICING_PERIODS.map((p) => {
              const active = p.months === selectedMonths;
              return (
                <button
                  key={p.months}
                  onClick={() => setSelectedMonths(p.months)}
                  aria-pressed={active}
                  className={cn(
                    "relative rounded-xl px-3.5 py-2.5 transition-colors duration-150 sm:px-5",
                    active
                      ? "text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-white/10",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="period-pill"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-md shadow-purple-500/25"
                    />
                  )}
                  <span className="relative z-10 flex flex-col items-center leading-none">
                    <span className="text-sm font-bold">
                      {t("pricingMonthsShort", { months: p.months })}
                    </span>
                    <span className="mt-1 text-[10px] font-bold">
                      {p.discount > 0
                        ? t("pricingDiscountBadge", { discount: p.discount })
                        : t("pricingNoDiscount")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {(period.recommended || period.bestValue) && (
        <FadeIn delay={0.05} className="mt-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-bold text-purple-500 backdrop-blur dark:text-violet-300">
            <Sparkles className="h-3 w-3" />
            {t(period.recommended ? "pricingPeriodRecommended" : "pricingPeriodBestValue")}
            {" · "}
            {t("pricingMonthsShort", { months: period.months })}
          </span>
        </FadeIn>
      )}

      <div className="mt-10 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PRICING_TIERS.map((tier, i) => (
          <PricingCard key={tier.id} tier={tier} period={period} index={i} />
        ))}
      </div>
    </div>
  );
}