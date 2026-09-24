import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  GraduationCap,
  Library,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Avatar,
  GlassCard,
  Logo,
  SectionLabel,
  StatusPill,
} from "@/components/primitives";
import {
  COURSES,
  LECTURES,
  STUDENT,
  getLecturesByCourse,
} from "@/lib/mock-hemis";

const STATS = [
  { icon: BookOpen, label: "Предметов", value: String(COURSES.length) },
  { icon: Clock, label: "Лекций прослушано", value: "6" },
  { icon: CheckCircle2, label: "Средний балл", value: "86%" },
  { icon: MessageSquareText, label: "Вопросов к лекции", value: "14" },
];

const GPA_BARS = [
  { label: "ИИ", value: 74, score: "92%" },
  { label: "ЭКО", value: 62, score: "84%" },
  { label: "БД", value: 55, score: "78%" },
];

const WEEK_TALKS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function StudentDashboard() {
  const recentLectures = [...LECTURES].slice(0, 3);
  const lecturesCount = (courseId: string) =>
    getLecturesByCourse(courseId).length;

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 pb-20">
        <header className="flex items-center justify-between py-6">
          <Logo />
          <div className="flex items-center gap-3">
            <StatusPill label="Интеграция с HEMIS: Активна" active />
            <Avatar name={STUDENT.name} />
          </div>
        </header>

        <section className="pt-6">
          <p className="text-sm text-zinc-400">Добрый день,</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Фирдавсбек <span className="text-gradient">Каримов</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{STUDENT.hemisId}</p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <GlassCard key={stat.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-violet-300">
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
            <SectionLabel icon={<Library className="h-3.5 w-3.5" />}>
              Мои предметы (HEMIS)
            </SectionLabel>
            <span className="text-xs text-zinc-500">3 подключено из 3</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {COURSES.map((course, index) => {
              const lecture = getLecturesByCourse(course.id)[0];
              const icons = [BookOpen, TrendingUp, Database];
              const Icon = icons[index % icons.length];
              return (
                <GlassCard
                  key={course.id}
                  className="group p-5 transition-all hover:border-violet-400/30 hover:bg-white/[0.08]"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 text-violet-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                      {course.code}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white">{course.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {course.professorName}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      {lecturesCount(course.id)} лекции синхронизированы
                    </span>
                    {lecture && (
                      <Link
                        href={`/student/lecture/${lecture.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
                      >
                        Открыть
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <SectionLabel icon={<Clock className="h-3.5 w-3.5" />}>
              Последние лекции
            </SectionLabel>

            {recentLectures.map((lecture) => {
              const course = COURSES.find((c) => c.id === lecture.courseId);
              return (
                <Link key={lecture.id} href={`/student/lecture/${lecture.id}`}>
                  <GlassCard className="flex items-center gap-4 p-4 transition-all hover:border-violet-400/30 hover:bg-white/[0.08]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sky-300">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {lecture.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {course?.title} · {course?.code} · {lecture.date}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-zinc-400">
                      <span>{lecture.transcript.length} фрагмента</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>

          <div className="space-y-6">
            <div>
              <SectionLabel icon={<TrendingUp className="h-3.5 w-3.5" />}>
                Успеваемость
              </SectionLabel>
              <GlassCard className="mt-4 p-5">
                <div className="flex h-32 items-end justify-around gap-3 border-b border-white/10 pb-2">
                  {GPA_BARS.map((bar) => (
                    <div key={bar.label} className="flex w-full flex-col items-center gap-2">
                      <span className="text-[10px] font-medium text-zinc-400">
                        {bar.score}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-violet-600/70 to-fuchsia-500/70 transition-all"
                        style={{ height: `${bar.value}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-around text-[11px] text-zinc-500">
                  {WEEK_TALKS.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </GlassCard>
            </div>

            <div>
              <SectionLabel icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                Интеграция
              </SectionLabel>
              <GlassCard className="mt-4 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">HEMIS</span>
                  <StatusPill label="Активна" active />
                </div>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Аудиозаписи лекций, оценки и расписание синхронизируются
                  автоматически. Последняя синхронизация: 10 минут назад.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}