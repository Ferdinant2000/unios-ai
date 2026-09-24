import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Presentation,
  Radio,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Avatar,
  GlassCard,
  Logo,
  SectionLabel,
  StatusPill,
} from "@/components/primitives";
import {
  CLASSROOM_ANALYTICS,
  COURSES,
  PROFESSOR,
} from "@/lib/mock-hemis";

const COURSE_ROWS = [
  { courseId: "c1", students: 184, comprehension: 92 },
  { courseId: "c2", students: 156, comprehension: 84 },
  { courseId: "c3", students: 121, comprehension: 78 },
];

const STATS = [
  { icon: Radio, label: "Active курсов", value: String(COURSES.length) },
  { icon: Users, label: "Студентов подключено", value: "184" },
  { icon: TrendingUp, label: "Среднее понимание", value: "92%" },
  { icon: BarChart3, label: "Лекций проведено", value: "12" },
];

export default function ProfessorDashboard() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 pb-20">
        <header className="flex items-center justify-between py-6">
          <Logo />
          <div className="flex items-center gap-3">
            <StatusPill label="Система HEMIS: подключена" active />
            <Avatar name={PROFESSOR.name} />
          </div>
        </header>

        <section className="flex flex-col gap-6 pt-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-zinc-400">Преподаватель</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Акмал <span className="text-gradient">Рахимов</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500">{PROFESSOR.hemisId}</p>
          </div>
          <Link href="/professor/live/c1" className="btn-primary">
            <Presentation className="h-4 w-4" />
            Начать Live-лекцию
          </Link>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <GlassCard key={stat.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-fuchsia-300">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-400">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <SectionLabel icon={<BarChart3 className="h-3.5 w-3.5" />}>
              Управление курсами
            </SectionLabel>
            <span className="text-xs text-zinc-500">
              Синхронизировано с HEMIS
            </span>
          </div>

          <div className="space-y-3">
            {COURSES.map((course) => {
              const row = COURSE_ROWS.find((r) => r.courseId === course.id);
              return (
                <GlassCard
                  key={course.id}
                  className="flex flex-col gap-4 p-5 transition-all hover:border-violet-400/30 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 text-violet-300">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {course.title}
                        </h3>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                          {course.code}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {course.professorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {row?.students}
                      </p>
                      <p className="text-[11px] text-zinc-500">студентов</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          (row?.comprehension ?? 0) >= 85
                            ? "text-lg font-bold text-emerald-300"
                            : "text-lg font-bold text-zinc-200"
                        }
                      >
                        {row?.comprehension}%
                      </p>
                      <p className="text-[11px] text-zinc-500">понимание</p>
                    </div>
                    <Link
                      href={`/professor/live/${course.id}`}
                      className="btn-ghost !py-2"
                    >
                      <Presentation className="h-4 w-4" />
                      Live-аналитика
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <SectionLabel icon={<TrendingUp className="h-3.5 w-3.5" />}>
            Аналитика усвоения (Live)
          </SectionLabel>
          <GlassCard className="mt-4 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Понимание аудитории на паре «Нейронные сети»
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                На основе реакций и вопросов студентов в реальном времени.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-3xl font-extrabold text-emerald-300">
                  {CLASSROOM_ANALYTICS.comprehensionRate}%
                </p>
                <p className="text-[11px] text-zinc-500">усвоение материала</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {CLASSROOM_ANALYTICS.confusedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}