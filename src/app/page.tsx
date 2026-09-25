"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  LineChart,
  MessageSquareText,
  Presentation,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";

const FEATURES = [
  { icon: BrainCircuit, titleKey: "featureLectureTitle", textKey: "featureLectureText" },
  { icon: MessageSquareText, titleKey: "featureChatTitle", textKey: "featureChatText" },
  { icon: LineChart, titleKey: "featureAnalyticsTitle", textKey: "featureAnalyticsText" },
] as const;

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <main className="relative flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <section className="flex flex-col items-center py-14 text-center md:py-20">
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-500 dark:text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse-dot" />
              {t("hackathonBadge")}
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-6xl">
              {t("heroTitle")}
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-zinc-400 md:text-lg">
              {t("heroSubtitle")}
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/student" className="btn-primary !px-8 !py-4 !text-base">
                <GraduationCap className="h-5 w-5" />
                {t("enterStudent")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/professor" className="btn-ghost !px-8 !py-4 !text-base">
                <Presentation className="h-5 w-5" />
                {t("enterProfessor")}
              </Link>
            </div>
          </FadeIn>
        </section>

        <section className="grid gap-5 pb-14 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FadeIn key={feature.titleKey} delay={index * 0.08}>
              <div className="glass interactive-card p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-white">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                  {t(feature.textKey)}
                </p>
              </div>
            </FadeIn>
          ))}
        </section>

        <footer className="border-t border-slate-200 dark:border-white/5 py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
          {t("footerCredit")}
        </footer>
      </div>
    </main>
  );
}