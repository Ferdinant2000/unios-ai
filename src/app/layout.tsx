import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniOS AI — ИИ-слой над HEMIS",
  description:
    "ИИ конспектирует лекции в реальном времени, отвечает на вопросы студентов и даёт преподавателям аналитику усвоения материала.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={nunito.variable} suppressHydrationWarning>
      <body className="font-sans min-h-screen antialiased">
        <Providers>
          <AnimatedBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}