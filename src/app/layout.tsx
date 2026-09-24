import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniOS AI — ИИ-слой над HEMIS",
  description:
    "ИИ конспектирует лекции в реальном времени, отвечает на вопросы студентов и даёт преподавателям аналитику усвоения материала.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-aurora text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}