import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  interactive = true,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  variant?: "default" | "teal" | "gold" | "strong";
}) {
  const variants = {
    default: "glass interactive-card",
    teal: "glass-teal interactive-card-teal",
    gold: "glass-gold interactive-card",
    strong: "glass-strong",
  };

  return (
    <div
      className={cn(
        "p-4 sm:p-5",
        interactive && variants[variant],
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
  variant = "default",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gold";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  const gradient = AVATAR_GRADIENTS[name.length % AVATAR_GRADIENTS.length];
  const goldGradient = "from-[#d4a845] to-[#f5d57a]";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-lg shadow-gold/20",
        variant === "gold" ? goldGradient : gradient,
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
  variant = "default",
}: {
  label: string;
  active?: boolean;
  className?: string;
  variant?: "default" | "teal" | "gold";
}) {
  const variants = {
    default: active
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300"
      : "border-slate-300 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
    teal: active
      ? "border-teal-primary/40 bg-teal-primary/10 text-teal-primary dark:text-teal-primary"
      : "border-teal-primary/20 bg-teal-primary/5 text-teal-primary dark:text-teal-primary",
    gold: active
      ? "border-gold/40 bg-gold/10 text-[#2e4f50] dark:text-[#2e4f50]"
      : "border-gold/20 bg-gold/5 text-[#2e4f50] dark:text-[#2e4f50]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          active
            ? variant === "gold"
              ? "bg-gold animate-pulse-dot"
              : variant === "teal"
              ? "bg-teal-primary animate-pulse-dot"
              : "bg-emerald-400 animate-pulse-dot"
            : "bg-zinc-400",
        )}
      />
      {label}
    </span>
  );
}

export function SectionLabel({
  icon,
  children,
  variant = "default",
}: {
  icon?: ReactNode;
  children: ReactNode;
  variant?: "default" | "teal" | "gold";
}) {
  return (
    <h2 className={cn(
      "flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
      variant === "gold" && "text-gold",
      variant === "teal" && "text-teal-primary",
      variant === "default" && "text-slate-500 dark:text-zinc-400"
    )}>
      {icon}
      {children}
    </h2>
  );
}

export function AiBadge({ children = "AI" }: { children?: ReactNode }) {
  return <span className="ai-badge">{children}</span>;
}