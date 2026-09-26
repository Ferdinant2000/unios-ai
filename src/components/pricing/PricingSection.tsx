"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  Check,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
  type SubscriptionPlanId,
} from "@/data/pricing";
import {
  activateSubscription,
  getSubscription,
} from "@/lib/subscription";

function formatUSD(value: number) {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function PlanCard({
  plan,
  index,
  active,
  activating,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  index: number;
  active: boolean;
  activating: boolean;
  onSubscribe: (planId: SubscriptionPlanId) => void;
}) {
  const { t } = useLanguage();

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
          plan.popular
            ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-purple-500/25"
            : "bg-gradient-to-br from-slate-300/80 to-slate-300/40 hover:shadow-xl hover:shadow-purple-500/15 dark:from-white/15 dark:to-white/[0.04]",
        )}
      >
        <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-white/90 p-5 backdrop-blur-xl dark:bg-ink/80 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t(plan.planKey)}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-500 dark:text-violet-300">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {t(plan.durationKey)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {plan.badgeKey && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  {t(plan.badgeKey)}
                </span>
              )}
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                {t("pricingDiscountBadge", { discount: plan.savingsPercent })}
              </span>
            </div>
          </div>

          <p className="flex items-start gap-1.5 text-xs leading-snug text-slate-500 dark:text-zinc-400">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t(plan.audienceKey)}
          </p>

          <div className="mt-5">
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatUSD(plan.pricePerMonth)}
              </span>
              <span className="pb-1 text-sm font-semibold text-slate-400 dark:text-zinc-400">
                {t("pricingPerMonth")}
              </span>
            </div>
            <p className="mt-1.5 text-xs font-bold text-slate-600 dark:text-zinc-300">
              {t("pricingJami")}:{" "}
              <span className="text-indigo-500 dark:text-violet-300">
                {formatUSD(plan.totalPrice)}
              </span>
            </p>
            {plan.monthlyRecalc && (
              <p className="mt-1 text-[11px] leading-snug text-slate-400 dark:text-zinc-500">
                {t("pricingMonthlyRecalc", { price: formatUSD(plan.monthlyRecalc) })}
              </p>
            )}
          </div>

          <div className="my-5 h-px w-full bg-slate-200 dark:bg-white/10" />

          <ul className="mb-6 flex flex-col gap-2.5">
            {plan.featuresKey.map((key) => (
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

          {plan.parentDashboard && (
            <div className="mb-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3.5">
              <p className="flex items-center gap-2 text-xs font-extrabold text-purple-600 dark:text-purple-300">
                <Users className="h-4 w-4" />
                {t("pricingParentTitle")}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-slate-600 dark:text-zinc-300">
                {t("pricingParentText")}
              </p>
            </div>
          )}

          <div className="mt-auto">
            <motion.button
              whileHover={{ scale: active ? 1 : 1.04 }}
              whileTap={{ scale: active ? 1 : 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              disabled={active || activating}
              onClick={() => onSubscribe(plan.id)}
              className={cn(
                "w-full",
                active
                  ? "btn-ghost cursor-default text-emerald-600 dark:text-emerald-300"
                  : "btn-primary",
              )}
            >
              {activating ? "…" : active ? `✓ ${t("pricingActivated")}` : t("pricingSubmit")}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingSection({ className }: { className?: string }) {
  const { t } = useLanguage();
  const [activePlan, setActivePlan] = useState<SubscriptionPlanId | null>(null);
  const [activating, setActivating] = useState<SubscriptionPlanId | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSubscription().then((sub) => {
      if (!cancelled && sub && sub.status === "active") {
        setActivePlan(sub.planId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = async (planId: SubscriptionPlanId) => {
    setActivating(planId);
    const sub = await activateSubscription(planId);
    if (sub.status === "active") setActivePlan(planId);
    setActivating(null);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={i}
            active={activePlan === plan.id}
            activating={activating === plan.id}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      <FadeIn delay={0.1} className="mt-8">
        <div className="flex items-start gap-3.5 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/25 to-purple-600/25 text-blue-500 dark:text-blue-300">
            <RefreshCw className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t("pricingAutoRenewTitle")}
            </p>
            <p className="mt-1 text-sm leading-snug text-slate-500 dark:text-zinc-400">
              {t("pricingAutoRenewText")}
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-6">
        <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/25 to-teal-600/25 text-emerald-500 dark:text-emerald-300">
            <Building2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t("pricingB2bTitle")}
            </p>
            <p className="mt-1 text-sm leading-snug text-slate-500 dark:text-zinc-400">
              {t("pricingB2bText")}
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}