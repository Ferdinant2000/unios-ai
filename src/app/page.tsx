"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  type LucideIcon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  FileQuestion,
  GraduationCap,
  LineChart,
  MessageSquareText,
  Mic,
  Plug,
  Presentation,
  Sparkles,
  StickyNote,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import FadeIn from "@/components/ui/FadeIn";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";

const LANDING_FEATURES = [
  { icon: BrainCircuit, titleKey: "featureLectureTitle", textKey: "featureLectureText" },
  { icon: MessageSquareText, titleKey: "featureChatTitle", textKey: "featureChatText" },
  { icon: LineChart, titleKey: "featureAnalyticsTitle", textKey: "featureAnalyticsText" },
] as const;

const STUDENT_FEATURES = [
  { icon: Mic, titleKey: "pzS1Title", textKey: "pzS1Text" },
  { icon: Bot, titleKey: "pzS2Title", textKey: "pzS2Text" },
  { icon: ClipboardList, titleKey: "pzS3Title", textKey: "pzS3Text" },
  { icon: TrendingUp, titleKey: "pzS4Title", textKey: "pzS4Text" },
] as const;

const PROF_FEATURES = [
  { icon: StickyNote, titleKey: "pzR1Title", textKey: "pzR1Text" },
  { icon: FileQuestion, titleKey: "pzR2Title", textKey: "pzR2Text" },
  { icon: ClipboardCheck, titleKey: "pzR3Title", textKey: "pzR3Text" },
  { icon: Users, titleKey: "pzR4Title", textKey: "pzR4Text" },
] as const;

const UNI_FEATURES = [
  { icon: BarChart3, titleKey: "pzU1Title", textKey: "pzU1Text" },
  { icon: AlertTriangle, titleKey: "pzU2Title", textKey: "pzU2Text" },
  { icon: Sparkles, titleKey: "pzU3Title", textKey: "pzU3Text" },
  { icon: Target, titleKey: "pzU4Title", textKey: "pzU4Text" },
] as const;

const DIFF_FEATURES = [
  { icon: Plug, titleKey: "pzDiffT1", textKey: "pzDiffT1Text" },
  { icon: Users, titleKey: "pzDiffT2", textKey: "pzDiffT2Text" },
  { icon: Zap, titleKey: "pzDiffT3", textKey: "pzDiffT3Text" },
] as const;

const FLOW_STEPS = [
  { icon: GraduationCap, titleKey: "pzStep1Title", textKey: "pzStep1Text" },
  { icon: Cpu, titleKey: "pzStep2Title", textKey: "pzStep2Text" },
  { icon: BookOpen, titleKey: "pzStep3Title", textKey: "pzStep3Text" },
  { icon: TrendingUp, titleKey: "pzStep4Title", textKey: "pzStep4Text" },
] as const;

type Feature = { icon: LucideIcon; titleKey: TranslationKey; textKey: TranslationKey };

function SectionTag({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-500 dark:text-purple-300 sm:text-xs">
        {children}
      </span>
    </FadeIn>
  );
}

function SectionHeader({
  tag,
  title,
  subtitle,
  delay = 0,
}: {
  tag: string;
  title: string;
  subtitle?: string;
  delay?: number;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <SectionTag delay={delay}>{tag}</SectionTag>
      <FadeIn delay={delay + 0.05}>
        <h2 className="mt-5 max-w-3xl text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          {title}
        </h2>
      </FadeIn>
      {subtitle && (
        <FadeIn delay={delay + 0.1}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  delay = 0,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay }}
      className="glass interactive-card flex h-full flex-col p-5 sm:p-6"
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{text}</p>
    </motion.div>
  );
}

function FeatureGrid({
  features,
  translate,
}: {
  features: readonly Feature[];
  translate: (key: TranslationKey) => string;
}) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.titleKey}
          icon={feature.icon}
          title={translate(feature.titleKey)}
          text={translate(feature.textKey)}
          delay={index * 0.06}
        />
      ))}
    </div>
  );
}

function FlowSeparator() {
  return (
    <div className="flex items-center justify-center py-1 lg:px-1">
      <ArrowRight className="h-5 w-5 rotate-90 text-indigo-400/70 dark:text-violet-300/70 lg:rotate-0" />
    </div>
  );
}

function LayerCard({
  icon: Icon,
  label,
  text,
  badge,
  accent,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
  badge?: string;
  accent: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay }}
      className="flex-1"
    >
      <div
        className={cn(
          "flex h-full flex-col gap-3 rounded-2xl border p-6",
          accent
            ? "border-purple-500/30 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10"
            : "border-slate-200/70 bg-white/50 dark:border-white/10 dark:bg-white/[0.04]",
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            accent
              ? "bg-gradient-to-br from-blue-600/25 to-purple-600/25 text-indigo-500 dark:text-violet-300"
              : "bg-slate-500/10 text-slate-500 dark:text-zinc-400",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">{label}</h3>
            {badge && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-indigo-500 dark:text-violet-300">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <main className="relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
      <Header />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6">
        {/* HERO */}
        <section className="flex flex-col items-center py-12 text-center md:py-20">
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-500 dark:text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse-dot" />
              {t("hackathonBadge")}
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-6xl">
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

        {/* Quick features */}
        <section className="grid gap-5 pb-4 md:grid-cols-3">
          {LANDING_FEATURES.map((feature, index) => (
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

        {/* 01 · MUAMMO */}
        <section id="problem" className="py-12 md:py-16">
          <SectionHeader tag={t("pzProblemTag")} title={t("pzProblemHeading")} />
          <FadeIn delay={0.1}>
            <p className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-violet-300 dark:to-purple-400 sm:text-sm">
              {t("pzProblemTagline")}
            </p>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {(
              [
                { titleKey: "pzColTalaba", icon: UserRound, items: ["pzP1", "pzP2", "pzP3", "pzP4"] },
                { titleKey: "pzColProfessor", icon: Presentation, items: ["pzP5", "pzP6", "pzP7", "pzP8"] },
                { titleKey: "pzColUniversitet", icon: Building2, items: ["pzP9", "pzP10", "pzP11", "pzP12"] },
              ] as const
            ).map((col, index) => (
              <FadeIn key={col.titleKey} delay={index * 0.07}>
                <div className="glass interactive-card flex h-full flex-col p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
                      <col.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{t(col.titleKey)}</h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {col.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-500 dark:text-zinc-400"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400/70" />
                        <span>{t(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.1}>
            <p className="mt-8 text-center text-sm font-bold text-indigo-500 dark:text-violet-300 sm:text-base">
              {t("pzResult")}
            </p>
          </FadeIn>
        </section>

        {/* 02 · YECHIM */}
        <section id="solution" className="py-12 md:py-16">
          <SectionHeader tag={t("pzSolutionTag")} title={t("pzSolutionHeading")} />

          <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
            <LayerCard
              icon={Building2}
              label={t("pzExistingInfra")}
              text={t("pzExistingInfraText")}
              badge="HEMIS"
              accent={false}
            />
            <FlowSeparator />
            <LayerCard
              icon={Cpu}
              label={t("pzUniosLayer")}
              text={t("pzUniosLayerText")}
              badge="AI"
              accent
              delay={0.08}
            />
            <FlowSeparator />
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: 0.16 }}
              className="flex-1"
            >
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white">{t("pzSmartValue")}</h3>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {[t("pzValueIntegration"), t("pzValueIndividual"), t("pzValueAnalytics")].map(
                      (value) => (
                        <li
                          key={value}
                          className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400"
                        >
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-emerald-300" />
                          {value}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 03 · TALABALAR UCHUN */}
        <section id="for-students" className="py-12 md:py-16">
          <SectionHeader
            tag={t("pzStudentsTag")}
            title={t("pzStudentsTitle")}
            subtitle={t("pzStudentsSubtitle")}
          />
          <FeatureGrid features={STUDENT_FEATURES} translate={t} />
        </section>

        {/* 04 · PROFESSORLAR UCHUN */}
        <section id="for-professors" className="py-12 md:py-16">
          <SectionHeader
            tag={t("pzProfsTag")}
            title={t("pzProfsTitle")}
            subtitle={t("pzProfsSubtitle")}
          />
          <FeatureGrid features={PROF_FEATURES} translate={t} />
        </section>

        {/* 05 · UNIVERSITET UCHUN */}
        <section id="for-university" className="py-12 md:py-16">
          <SectionHeader
            tag={t("pzUniTag")}
            title={t("pzUniTitle")}
            subtitle={t("pzUniSubtitle")}
          />
          <FeatureGrid features={UNI_FEATURES} translate={t} />
        </section>

        {/* 06 · BIZNES MODEL */}
        <section id="business" className="py-12 md:py-16">
          <SectionHeader
            tag={t("pzBizTag")}
            title={t("pzBizTitle")}
            subtitle={t("pzBizSubtitle")}
          />

          <FadeIn delay={0.05}>
            <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 rounded-3xl border border-purple-500/25 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 px-6 py-8 text-center sm:py-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25">
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                {t("pzPrice")}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                {t("pzPriceLabel")}
              </span>
            </div>
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {DIFF_FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.titleKey}
                icon={feature.icon}
                title={t(feature.titleKey)}
                text={t(feature.textKey)}
                delay={index * 0.06}
              />
            ))}
          </div>
        </section>

        {/* 07 · EKOTIZIM INTEGRATSIYASI */}
        <section id="ecosystem" className="py-12 md:py-16">
          <SectionHeader
            tag={t("pzFlowTag")}
            title={t("pzFlowTitle")}
            subtitle={t("pzFlowSubtitle")}
          />

          <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
            {FLOW_STEPS.map((step, index, arr) => (
              <Fragment key={step.titleKey}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.3, delay: index * 0.07 }}
                  className="flex flex-1 flex-col items-center rounded-2xl border border-slate-200/70 bg-white/50 p-5 text-center dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
                >
                  <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 dark:text-violet-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-indigo-500 dark:text-violet-300">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                    {t(step.textKey)}
                  </p>
                </motion.div>
                {index < arr.length - 1 && <FlowSeparator />}
              </Fragment>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 md:py-16">
          <FadeIn>
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-8 text-center sm:p-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                {t("pzCtaTitle")}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate-500 dark:text-zinc-400 sm:text-base">
                {t("pzCtaText")}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/student" className="btn-primary !px-6 !py-3">
                  <GraduationCap className="h-5 w-5" />
                  {t("enterStudent")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/professor" className="btn-ghost !px-6 !py-3">
                  <Presentation className="h-5 w-5" />
                  {t("enterProfessor")}
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>

        <footer className="border-t border-slate-200 dark:border-white/5 py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
          {t("footerCredit")}
        </footer>
      </div>
    </main>
  );
}