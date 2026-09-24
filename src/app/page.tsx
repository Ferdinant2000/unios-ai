import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Presentation,
  BrainCircuit,
  MessageSquareText,
  LineChart,
} from "lucide-react";
import { Logo } from "@/components/primitives";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Конспект в реальном времени",
    text: "ИИ слушает лекцию, транскрибирует речь и собирает структурированный конспект по таймкодам.",
  },
  {
    icon: MessageSquareText,
    title: "«Ask the Lecture»",
    text: "Чат с лекцией: задавай вопрос и получай ответ с привязкой к точному фрагменту занятия.",
  },
  {
    icon: LineChart,
    title: "Аналитика преподавателя",
    text: "Live-виджет понимания аудитории: какие концепты вызвали трудность у студентов — прямо в HEMIS.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6">
        <header className="flex items-center justify-between py-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/student" className="btn-ghost !py-2">
              Студент
            </Link>
            <Link href="/professor" className="btn-ghost !py-2">
              Преподаватель
            </Link>
          </div>
        </header>

        <section className="flex flex-col items-center py-16 text-center md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-xs font-medium text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-dot" />
            UniOS AI · MVP для хакатона
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            ИИ-слой над <span className="text-gradient">HEMIS</span>: лекции
            понимают тебя
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Пока ты слушаешь лекцию, UniOS AI ведёт конспект и отвечает на
            вопросы. Преподаватель видит, что аудитория усвоила материал, ещё
            до конца пары.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/student" className="btn-primary !px-8 !py-4 !text-base">
              <GraduationCap className="h-5 w-5" />
              Войти как Студент
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/professor" className="btn-ghost !px-8 !py-4 !text-base">
              <Presentation className="h-5 w-5" />
              Войти как Преподаватель
            </Link>
          </div>
        </section>

        <section className="grid gap-5 pb-20 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="glass p-6 transition-colors hover:border-white/20">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 text-violet-300">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {feature.text}
              </p>
            </div>
          ))}
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-500">
          UniOS AI · Интеграция с платформой HEMIS · Next.js 14 + Tailwind
        </footer>
      </div>
    </main>
  );
}