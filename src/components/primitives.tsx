import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("glass p-5", className)}>{children}</div>;
}

const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-cyan-400",
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
        "flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-lg shadow-black/30",
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
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/5 text-zinc-300",
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
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
      {icon}
      {children}
    </h2>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/30">
        <span className="text-sm font-black text-white">U</span>
      </div>
      {!compact && (
        <span className="text-base font-bold tracking-tight text-white">
          UniOS <span className="text-gradient">AI</span>
        </span>
      )}
    </div>
  );
}