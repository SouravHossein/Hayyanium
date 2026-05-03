"use client";

import React from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/locales";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const set = (next: Locale) => setLocale(next);

  return (
    <div className={className} aria-label={t("lang.select_label")}>
      <div className="flex items-center gap-1 rounded-xl border-2 border-retro-stroke bg-retro-bg-light p-1">
        <button
          type="button"
          onClick={() => set("en")}
          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all min-h-9 ${
            locale === "en"
              ? "bg-actinide text-retro-stroke border-2 border-retro-stroke"
              : "!border-transparent !shadow-none !bg-transparent opacity-70 hover:opacity-100"
          }`}
        >
          {t("lang.english_short")}
        </button>
        <button
          type="button"
          onClick={() => set("bn")}
          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all min-h-9 ${
            locale === "bn"
              ? "bg-actinide text-retro-stroke border-2 border-retro-stroke"
              : "!border-transparent !shadow-none !bg-transparent opacity-70 hover:opacity-100"
          }`}
        >
          {t("lang.bengali_short")}
        </button>
      </div>
    </div>
  );
}

