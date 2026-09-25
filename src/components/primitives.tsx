import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass p-5",
        interactive && "interactive-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

const AVATAR_GRADIENTS = [
  "from-blue-500 to-purple-500",
  "from-indigo-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-rose-500",
];

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-lg",
  };
  const gradient = AVATAR_GRADIENTS[name.length % AVATAR_GRADIENTS.length];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-lg shadow-purple-500/20",
        gradient,
        sizes[size],
      )}
    >
      {initials}
    </div>
  );
}

export function StatusPill({
  label,
  active = false,
  className,
}: {
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        active
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
          : "border-slate-300 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          active ? "bg-emerald-400 animate-pulse-dot" : "bg-zinc-400",
        )}
      />
      {label}
    </span>
  );
}

export function SectionLabel({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
      {icon}
      {children}
    </h2>
  );
}

export function AiBadge({ children = "AI" }: { children?: ReactNode }) {
  return <span className="ai-badge">{children}</span>;
}