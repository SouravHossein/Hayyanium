export const SUPPORTED_LOCALES = ["en", "bn"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "bn";
}

export function normalizeLocale(input: string | null | undefined): Locale {
  const raw = (input ?? "").trim().toLowerCase();
  if (raw === "bn" || raw.startsWith("bn-")) return "bn";
  return "en";
}

