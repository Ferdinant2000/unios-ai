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

interface HeaderUser {
  name?: string;
  firstName?: string;
  lastName?: string;
  hemisId?: string;
  hemisConnected?: string;
}

export default function Header({
  showBack = false,
  user,
}: {
  showBack?: boolean;
  user?: HeaderUser;
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
    <header className="sticky top-0 z-50 w-full border-b border-teal-primary-20 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-[#111827]/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
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
            className="flex shrink-0 items-center rounded-full border border-teal-primary-20 bg-white p-0.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-1"
            role="group"
            aria-label={t("language")}
          >
            {LANGS.map((item) => (
              <button
                key={item.value}
                onClick={() => setLang(item.value)}
                aria-pressed={lang === item.value}
                className={cn(
                  "rounded-full px-2 py-1 text-[11px] font-bold transition-all duration-150 active:scale-95 sm:px-3 sm:py-1.5 sm:text-xs",
                  lang === item.value
                    ? "bg-gradient-gold text-[#2e4f50] shadow-gold"
                    : "text-teal-primary hover:text-teal-primary dark:text-white/60 dark:hover:text-white",
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
            <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-gold/30 bg-gold/5 py-1 pl-1 pr-3 backdrop-blur-xl dark:border-gold/20 dark:bg-gold/5 sm:pr-4">
              <Avatar name={user.name ?? `${user.firstName} ${user.lastName}`} size="sm" />
              <div className="hidden leading-tight sm:block">
                <p className="max-w-[140px] truncate text-xs font-bold text-teal-primary dark:text-white">
                  {user.name ?? `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-[10px] text-gold">
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