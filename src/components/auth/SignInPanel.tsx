"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SignInPanel({
  title = "signInTitle",
  subtitle = "signInSubtitle",
  compact = false,
}: {
  title?: "signInTitle" | "loginRequiredTitle" | "professorOnlyTitle";
  subtitle?: "signInSubtitle" | "loginRequiredText";
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const { user, loading, isDemo, signInWithGoogle, logout } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const handleGoogle = async () => {
    setBusy(true);
    setError(false);
    const next = await signInWithGoogle();
    setBusy(false);
    if (!next) {
      setError(true);
      return;
    }
    router.push(next.role === "professor" ? "/professor" : "/student");
  };

  return (
    <div className={compact ? "" : "mx-auto w-full max-w-md"}>
      <div className="glass-strong space-y-5 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-purple-500/25">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t(title)}
            </h1>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              {t(subtitle)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-400 dark:text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
            {t("loading")}
          </div>
        ) : isDemo ? (
          <div className="space-y-3">
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              {t("signInDemo")}
            </p>
            <div className="grid gap-2">
              <Link href="/student" className="btn-primary w-full !py-2.5">
                <GraduationCap className="h-4 w-4" />
                {t("goToStudent")}
              </Link>
              <Link href="/professor" className="btn-ghost w-full !py-2.5">
                <UserRound className="h-4 w-4" />
                {t("goToDashboard")}
              </Link>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 font-bold text-emerald-600 dark:text-emerald-300">
                {(user.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {t("signInGreeting", { name: user.name })}
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  {user.role === "professor" ? t("professor") : t("student")}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={user.role === "professor" ? "/professor" : "/student"}
                className="btn-primary w-full !py-2.5"
              >
                {t("goToDashboard")}
              </Link>
              <button onClick={() => void logout()} className="btn-ghost w-full !py-2.5">
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => void handleGoogle()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-md transition-all duration-150 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 dark:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.44.35-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
                />
              </svg>
              {busy ? t("signInBusy") : t("signInGoogle")}
            </button>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-300">
                {t("signInError")}
              </p>
            )}
          </div>
        )}

        {!compact && (
          <p className="text-center text-xs leading-relaxed text-slate-400 dark:text-zinc-500">
            {t("footerCredit")}
          </p>
        )}
      </div>
    </div>
  );
}