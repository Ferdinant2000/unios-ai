"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import SignInPanel from "@/components/auth/SignInPanel";

/**
 * Guard доступа к разделам. В demo-режиме доступ открыт без авторизации.
 * При настроенном Firebase требует:
 *  - role="professor" → пользователь с ролью professor;
 *  - role="user" → любой залогиненный пользователь.
 */
export default function RequireRole({
  role = "user",
  children,
}: {
  role?: "user" | "professor";
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const { user, loading, isDemo } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="glass flex items-center gap-2 p-6 text-sm text-slate-400 dark:text-zinc-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
          {t("loading")}
        </div>
      </main>
    );
  }

  if (isDemo) return children;

  if (role === "professor" && user?.role !== "professor") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <SignInPanel
          title="professorOnlyTitle"
          subtitle="loginRequiredText"
          compact
        />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <SignInPanel title="loginRequiredTitle" subtitle="signInSubtitle" compact />
      </main>
    );
  }

  return children;
}