import { DEFAULT_LOCALE, type Locale, normalizeLocale } from "./locales";

export const LOCALE_COOKIE_NAME = "hayyanium_locale";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]*)`),
  );
  if (!match) return null;

  try {
    return normalizeLocale(decodeURIComponent(match[1]));
  } catch {
    return normalizeLocale(match[1]);
  }
}

export function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function getInitialLocale(): Locale {
  const fromCookie = readLocaleCookie();
  return fromCookie ?? DEFAULT_LOCALE;
}

