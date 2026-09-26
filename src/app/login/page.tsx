import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import SignInPanel from "@/components/auth/SignInPanel";

export const metadata: Metadata = {
  title: "Вход · UniOS AI",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center py-12">
          <SignInPanel />
        </div>
      </div>
    </main>
  );
}