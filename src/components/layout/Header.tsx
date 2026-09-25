"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { LANGS } from "@/lib/translations";
import { Avatar } from "@/components/primitives";
import Logo from "@/components/ui/Logo";
import type { User } from "@/types";

export default function Header({
  showBack = false,
  user,
}: {
  showBack?: boolean;
  user?: User;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      if (pathname.includes("/professor")) {
        router.push("/professor");
      } else {
        router.push("/student");
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/70 backdrop-blur-xl dark:border-white/10 dark:bg-ink/70">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-1.5 px-3 py-2.5 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              title={t("back")}
              aria-label={t("back")}
              className="icon-btn shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0 shrink-0">
            <Logo size="sm" hideWordmarkOnMobile />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div
            className="flex shrink-0 items-center rounded-full border border-slate-200 bg-white p-0.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-1"
            role="group"
            aria-label={t("language")}
          >
            {LANGS.map((item) => (
              <button
                key={item.value}
                onClick={() => setLang(item.value)}
                aria-pressed={lang === item.value}
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold transition-all duration-150 active:scale-95 sm:px-3 sm:py-1 sm:text-xs",
                  lang === item.value
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title={t("theme")}
            aria-label={t("theme")}
            className="icon-btn shrink-0"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4 rounded-full border border-current opacity-60" />
            )}
          </button>

          {user && (
            <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:pr-4">
              <Avatar name={user.name} size="sm" />
              <div className="hidden leading-tight sm:block">
                <p className="max-w-[140px] truncate text-xs font-bold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {t("hemisConnected")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}