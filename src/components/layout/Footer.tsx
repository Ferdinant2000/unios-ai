"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer({ className }: { className?: string }) {
  const { t } = useLanguage();

  const links = [
    { label: t("footerServices"), href: "/#for-students" },
    { label: t("footerSubscriptions"), href: "/pricing" },
    { label: t("footerTeam"), href: "/#team" },
    { label: t("footerLogin"), href: "/login" },
  ];

  return (
    <footer
      className={`mt-16 border-t border-slate-200 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-ink/60 ${className ?? ""}`}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
            {t("footerTagline")}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-white">
            {t("footerNavTitle")}
          </h4>
          <ul className="mt-4 flex flex-col gap-2.5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-500 transition-colors hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-violet-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-white">
            {t("teamContactTitle")}
          </h4>
          <ul className="mt-4 flex flex-col gap-2.5">
            <li>
              <a
                href="tel:+998500755678"
                className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-violet-300"
              >
                <Phone className="h-4 w-4 shrink-0 text-indigo-500 dark:text-violet-300" />
                +998 50 075 56 78
              </a>
            </li>
            <li>
              <a
                href="mailto:azikazikyul@gmail.com"
                className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-violet-300"
              >
                <Mail className="h-4 w-4 shrink-0 text-indigo-500 dark:text-violet-300" />
                azikazikyul@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-6 dark:border-white/10">
        <p className="text-center text-xs text-slate-400 dark:text-zinc-500">
          {t("footerRights")}
        </p>
      </div>
    </footer>
  );
}