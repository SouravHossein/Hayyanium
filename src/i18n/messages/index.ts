import { bn } from "./bn";
import { en } from "./en";
import type { Locale } from "../locales";

export { en, bn };

export type MessageKey = keyof typeof en;

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en,
  bn,
};

