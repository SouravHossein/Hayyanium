"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Clock3, Home, Plus, Sparkles, UserCircle2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n/I18nProvider';

const MAIN_ITEMS = [
  { id: 'table', href: '/', labelKey: 'nav.table', icon: Home },
  { id: 'builder', href: '/?builder=1', labelKey: 'nav.builder', icon: Plus, exactPath: '/' },
  { id: 'timeline', href: '/timeline', labelKey: 'nav.timeline', icon: Clock3 },
  { id: 'community', href: '/community', labelKey: 'nav.community', icon: Users },
  { id: 'quiz', href: '/quiz', labelKey: 'nav.quiz', icon: Sparkles },
  { id: 'profile', href: '/profile', labelKey: 'nav.profile', icon: UserCircle2 },
] as const;

export default function MainNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useI18n();

  const isBuilderActive = pathname === '/' && searchParams.get('builder') === '1';
  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/' && !isBuilderActive;
    if (href === '/?builder=1') return isBuilderActive;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (pathname.startsWith('/quiz') || pathname.startsWith('/timeline')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] md:hidden backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]"
      style={{
        backgroundColor: 'Canvas',
        color: 'CanvasText',
        borderTop: '1px solid ButtonBorder',
      }}
    >

      <div className="grid grid-cols-6 items-stretch px-1 py-2">
        {MAIN_ITEMS.map((item) => {
          const isActive = isActivePath(item.href);
          const profileAvatar = user?.user_metadata?.avatar_url;
          const label = t(item.labelKey);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              className="flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all relative"
              style={{
                backgroundColor: isActive ? 'Highlight' : 'transparent',
                color: isActive ? 'HighlightText' : 'CanvasText',
                border: '1px solid transparent',
              }}
            >
              <div className="relative">
                {item.id === 'profile' && profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt={t("nav.profile")}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : item.id === 'community' ? (
                  <img
                    src="/favicons/animatedCommunityIcon.gif"
                    alt={t("nav.community")}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <item.icon className="h-5 w-5" />
                )}

                {/* Attention-seeking pulse for Community link */}
                {/* {item.id === 'community' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )} */}
              </div>
              <div className="flex flex-col items-center leading-none gap-0.5">
                <span className="text-[9px] font-semibold">{label}</span>
                {/* {item.id === 'community' && (
                  <span className="text-[9px] opacity-70 font-normal">{t("nav.advice_us")}</span>
                )} */}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
