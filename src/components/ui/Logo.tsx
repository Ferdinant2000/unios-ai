"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { wrap: "h-7 w-7 rounded-lg", text: "text-[15px]", badge: "text-[10px] px-1.5 py-0.5" },
  md: { wrap: "h-8 w-8 rounded-[10px]", text: "text-lg", badge: "text-xs px-2.5 py-0.5" },
  lg: { wrap: "h-11 w-11 rounded-xl", text: "text-2xl", badge: "text-sm px-3 py-1" },
} as const;

type LogoSize = keyof typeof SIZES;

function LogoMarkFallback({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 17 24 9l18 8-18 8-18-8Z" fill="white" />
      <path
        d="M24 9v5.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="9" r="2" fill="#C7D2FE" />
      <path
        d="M39 19.5v3"
        stroke="#C7D2FE"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="39" cy="19.5" r="1.8" fill="#C7D2FE" />
      <circle cx="24" cy="30.5" r="1.5" fill="#BFDBFE" />
      <path
        d="M17 26.5c0 4.5 14 4.5 14 0"
        stroke="#1E3A8A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="17" cy="26.5" r="2.4" fill="#1E3A8A" />
      <circle cx="31" cy="26.5" r="2.4" fill="#1E3A8A" />
      <path
        d="M12 35.5c4.5-2.5 9.5-1.5 12-.5 2.5-1 7.5-2 12 .5v1.8c-4.5-2-9.5-1-12-.5-2.5-.5-7.5-1.5-12 .5v-1.8Z"
        fill="white"
        opacity="0.92"
      />
    </svg>
  );
}

export default function Logo({
  size = "md",
  href = "/",
  className,
  hideWordmarkOnMobile = false,
}: {
  size?: LogoSize;
  href?: string;
  className?: string;
  hideWordmarkOnMobile?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const sizes = SIZES[size];
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 transition-all duration-150 hover:opacity-90 active:scale-[0.98] sm:gap-2.5",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-purple-500/25 transition-transform duration-150 group-hover:scale-[1.03]",
          sizes.wrap,
        )}
      >
        {imgFailed ? (
          <LogoMarkFallback className="h-full w-full p-[6%]" />
        ) : (
          <img
            src="/logo.png"
            alt="UniOS AI"
            className="h-full w-full object-contain"
            draggable={false}
            onError={() => setImgFailed(true)}
          />
        )}
      </span>
      <span
        className={cn(
          "font-extrabold tracking-tight text-slate-900 dark:text-white",
          sizes.text,
          hideWordmarkOnMobile && "hidden md:inline-flex",
        )}
      >
        UniOS
      </span>
      <span
        className={cn(
          "ai-badge",
          sizes.badge,
          hideWordmarkOnMobile && "hidden md:inline-flex",
        )}
      >
        AI
      </span>
    </Link>
  );
}