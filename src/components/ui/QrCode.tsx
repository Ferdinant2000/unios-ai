"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

export default function QrCode({
  value,
  size = 132,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0B0F19", light: "#ffffff" },
    })
      .then((url) => {
        if (mounted) setSrc(url);
      })
      .catch(() => {
        if (mounted) setSrc(null);
      });
    return () => {
      mounted = false;
    };
  }, [value, size]);

  if (!src) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={cn("animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/10", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={size} height={size} alt="QR Code" className={cn("h-auto rounded-xl", className)} />
  );
}