"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { GlassCard } from "@/components/primitives";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { isLiveConfigured } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import type { Role, User } from "@/types";
import Header from "@/components/layout/Header";

interface GoogleLogoProps {
  className?: string;
}

function GoogleLogo({ className }: GoogleLogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.12 2.77-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27A7.24 7.24 0 0 1 4.9 12c0-.79.14-1.56.37-2.27v-3.1H1.28A12.02 12.02 0 0 0 0 12c0 1.94.46 3.77 1.28 5.37l3.99-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.63l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const login = useAuthStore((state) => state.login);
  const { signInWithGoogle } = useAuth();

  const [role, setRole] = useState<"student" | "professor">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const demoCredentials = {
    student: { email: "student@unios.ai", password: "demo123" },
    professor: { email: "teacher@unios.ai", password: "demo123" },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      router.push(role === "student" ? "/student" : "/professor");
    } else {
      setError(t("invalidCredentials"));
    }
    setLoading(false);
  };

  const fillDemo = (selectedRole: "student" | "professor") => {
    setRole(selectedRole);
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
  };

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleError("");
    setGoogleLoading(true);
    try {
      const appUser = await signInWithGoogle();
      if (!appUser) {
        // Google Auth недоступен (невалидный API-ключ, блокировка всплывающих
        // окон) — автоматический fallback на демо-вход без блокировки UI.
        const demoEmail = demoCredentials[role].email;
        const demoPass = demoCredentials[role].password;
        const ok = await login(demoEmail, demoPass);
        if (ok) {
          router.push(role === "professor" ? "/professor" : "/student");
        } else {
          setGoogleError(t("googleFallbackDemo"));
        }
        return;
      }
      const bridgedRole: Role = appUser.role === "professor" ? "teacher" : "student";
      const nameSource = appUser.name || appUser.email || "UniOS User";
      const parts = nameSource.split(" ");
      const bridgedUser = {
        id: appUser.uid,
        email: appUser.email ?? `${appUser.uid}@unios.ai`,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "User",
        name: nameSource,
        avatar: nameSource.slice(0, 2).toUpperCase(),
        role: bridgedRole,
        hemisId: appUser.uid.slice(0, 8).toUpperCase(),
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as User;
      useAuthStore.getState().setUser(bridgedUser, bridgedRole);
      router.push(bridgedRole === "teacher" ? "/professor" : "/student");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 mb-6">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("welcomeBack")}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-zinc-400">
            {t("loginSubtitle")}
          </p>
        </div>

        <GlassCard className="p-6 space-y-6">
          <div className="flex gap-2" role="radiogroup" aria-label={t("selectRole")}>
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                role === "student"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white bg-white/50 dark:bg-white/5"
              }`}
              aria-pressed={role === "student"}
            >
              <GraduationCap className="h-4 w-4 inline mr-2" />
              {t("loginStudent")}
            </button>
            <button
              type="button"
              onClick={() => setRole("professor")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                role === "professor"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white bg-white/50 dark:bg-white/5"
              }`}
              aria-pressed={role === "professor"}
            >
              <UserIcon className="h-4 w-4 inline mr-2" />
              {t("loginProfessor")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder={t("emailPlaceholder")}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder={t("passwordPlaceholder")}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("signingIn")}
                </span>
              ) : (
                t("signIn")
              )}
            </button>
          </form>

          {isLiveConfigured && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span className="text-xs text-slate-400 dark:text-zinc-500">или</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              </div>

              {googleError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
                  {googleError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:scale-[1.01] hover:border-purple-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
              >
                {googleLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
                ) : (
                  <GoogleLogo className="h-5 w-5" />
                )}
                {googleLoading ? t("googleSignInPending") : t("signInWithGoogle")}
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <p className="text-center text-sm text-slate-500 dark:text-zinc-400 mb-4">
              {t("demoCredentials")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemo("student")}
                className="btn-ghost py-2 text-sm"
              >
                {t("studentDemo")}
              </button>
              <button
                type="button"
                onClick={() => fillDemo("professor")}
                className="btn-ghost py-2 text-sm"
              >
                {t("professorDemo")}
              </button>
            </div>
          </div>
        </GlassCard>

        <p className="text-center text-xs text-slate-400 dark:text-zinc-500 mt-6">
          {t("loginFooter")}
        </p>
      </div>
    </main>
    </>
  );
}