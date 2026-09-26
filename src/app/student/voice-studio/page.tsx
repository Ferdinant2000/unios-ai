"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import VoiceStudio from "@/components/voice/VoiceStudio";
import { useAuthStore } from "@/stores/authStore";
import { useLanguage } from "@/context/LanguageContext";

export default function VoiceStudioPage() {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (!loading && (!user || !user.role)) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="glass p-8 text-center">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t("loginRequiredTitle")}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              {t("studentAccessText")}
            </p>
            <Link href="/login" className="btn-primary mt-6 inline-flex items-center gap-2">
              {t("goToLogin")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Header showBack user={user as unknown as { name: string; firstName: string; lastName: string }} />
      <VoiceStudio />
    </>
  );
}