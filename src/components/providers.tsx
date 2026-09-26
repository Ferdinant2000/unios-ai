"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { seedDemoData } from "@/lib/seed";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedDemoData();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="unios-theme"
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}