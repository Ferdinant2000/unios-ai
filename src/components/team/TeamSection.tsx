"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";
import type { TranslationKey } from "@/lib/translations";

interface TeamMember {
  photo: string;
  name: string;
  roleKey: TranslationKey;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    photo: "/team/IMG_4105.jpg",
    name: "Komolitdinov Firdavs",
    roleKey: "teamRoleDeveloper",
  },
  {
    photo: "/team/IMG_4106.jpg",
    name: "Yuldashev Aziz",
    roleKey: "teamRoleAnalyst",
  },
  {
    photo: "/team/IMG_4109.jpg",
    name: "Babakhanov Javokhir",
    roleKey: "teamRoleCeo",
  },
  {
    photo: "/team/IMG_4103.jpg",
    name: "Ismailov Abubakr",
    roleKey: "teamRoleDesigner",
  },
  {
    photo: "/team/IMG_4111.jpg",
    name: "Fayzullayev Islom",
    roleKey: "teamRoleCto",
  },
];

function TeamCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  const { t } = useLanguage();
  const [imgFailed, setImgFailed] = useState(false);
  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="h-full"
    >
      <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {imgFailed ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-purple-600/15">
              <span className="text-4xl font-extrabold tracking-tight text-indigo-500 dark:text-violet-300">
                {initials}
              </span>
            </div>
          ) : (
            <img
              src={member.photo}
              alt={member.name}
              loading="lazy"
              draggable={false}
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
            {member.name}
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-indigo-500 dark:text-violet-300">
            {t(member.roleKey)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamSection({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <section id="team" className={className}>
      <div className="flex flex-col items-center text-center">
        <FadeIn>
          <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-500 dark:text-purple-300 sm:text-xs">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            {t("teamTag")}
          </span>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2 className="mt-5 max-w-3xl text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {t("teamTitle")}
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-zinc-400">
            {t("teamSubtitle")}
          </p>
        </FadeIn>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
        {TEAM_MEMBERS.map((member, index) => (
          <TeamCard key={member.photo} member={member} index={index} />
        ))}
      </div>

      <FadeIn delay={0.1} className="mt-8 flex justify-center">
        <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/10 p-5 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
          <p className="text-sm font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-300">
            {t("teamContactTitle")}
          </p>
          <a
            href="tel:+998500755678"
            className="flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors hover:text-purple-600 dark:text-zinc-200 dark:hover:text-purple-300"
          >
            <Phone className="h-4 w-4 shrink-0 text-indigo-500 dark:text-violet-300" />
            +998 50 075 56 78
          </a>
          <a
            href="mailto:azikazikyul@gmail.com"
            className="flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors hover:text-purple-600 dark:text-zinc-200 dark:hover:text-purple-300"
          >
            <Mail className="h-4 w-4 shrink-0 text-indigo-500 dark:text-violet-300" />
            azikazikyul@gmail.com
          </a>
        </div>
      </FadeIn>
    </section>
  );
}