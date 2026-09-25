export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-blue-100/60 dark:from-ink dark:via-surface dark:to-ink" />
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#0052FF] opacity-25 blur-[120px] animate-glow-drift-1 md:h-96 md:w-96" />
      <div className="absolute right-[-15%] top-1/3 h-80 w-80 rounded-full bg-[#7C3AED] opacity-25 blur-[120px] animate-glow-drift-2 md:h-[28rem] md:w-[28rem]" />
      <div className="absolute bottom-[-20%] left-1/4 h-72 w-72 rounded-full bg-[#4F46E5] opacity-25 blur-[120px] animate-glow-drift-3 md:h-96 md:w-96" />
    </div>
  );
}