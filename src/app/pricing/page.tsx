"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import PricingSection from "@/components/pricing/PricingSection";

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 md:py-14">
        <div className="flex flex-col items-center text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-500 backdrop-blur dark:text-purple-300">
              <Sparkles className="h-3.5 w-3.5" />
              UniOS AI
            </span>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
              {t("pricingTitle")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-3 max-w-xl text-sm text-slate-500 dark:text-zinc-400 md:text-base">
              {t("pricingSubtitle")}
            </p>
          </FadeIn>
        </div>

        <PricingSection className="mt-10" />
      </div>
    </main>
  );
}