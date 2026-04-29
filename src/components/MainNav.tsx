"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Clock3, Home, Plus, Sparkles, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MAIN_ITEMS = [
  { href: '/', label: 'Table', icon: Home },
  { href: '/?builder=1', label: 'Builder', icon: Plus, exactPath: '/' },
  { href: '/timeline', label: 'Timeline', icon: Clock3 },
  { href: '/quiz', label: 'Quiz', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: UserCircle2 },
] as const;

export default function MainNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

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
      <div className="grid grid-cols-5 items-stretch px-2 py-2">
        {MAIN_ITEMS.map((item) => {
          const isActive = isActivePath(item.href);
          const profileAvatar = user?.user_metadata?.avatar_url;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-all"
              style={{
                backgroundColor: isActive ? 'Highlight' : 'transparent',
                color: isActive ? 'HighlightText' : 'CanvasText',
                border: '1px solid transparent',
              }}
            >
              {item.label === 'Profile' && profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt="Profile"
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
