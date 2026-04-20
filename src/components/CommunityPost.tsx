"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type PostType = 'bug' | 'feature';
type BadgeType = 'confirmed' | 'planned' | 'wont_fix' | 'done' | null;

export interface CommunityPostData {
  id: string;
  user_id: string | null;
  type: PostType;
  title: string;
  description: string;
  status: string;
  badge: BadgeType;
  upvotes: number;
  created_at: string;
  user_has_upvoted?: boolean;
}

interface CommunityPostProps {
  post: CommunityPostData;
  isDeveloper: boolean;
  onUpvote: (postId: string, hasUpvoted: boolean) => void;
  onBadge: (postId: string, badge: BadgeType) => void;
}

const BADGE_CONFIG: Record<NonNullable<BadgeType>, { label: string; emoji: string; className: string }> = {
  confirmed: { label: 'Confirmed', emoji: '✅', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  planned: { label: 'Planned', emoji: '🛠️', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
  wont_fix: { label: "Won't Fix", emoji: '❌', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
  done: { label: 'Done', emoji: '🎉', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
};

const TYPE_CONFIG: Record<PostType, { label: string; emoji: string; className: string }> = {
  bug: { label: 'Bug', emoji: '🐛', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  feature: { label: 'Feature', emoji: '✨', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
};

export const CommunityPost: React.FC<CommunityPostProps> = ({ post, isDeveloper, onUpvote, onBadge }) => {
  const [showBadgeMenu, setShowBadgeMenu] = useState(false);
  const typeConf = TYPE_CONFIG[post.type];
  const badgeConf = post.badge ? BADGE_CONFIG[post.badge] : null;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
      {/* Type + Badge row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${typeConf.className}`}>
          {typeConf.emoji} {typeConf.label}
        </span>
        {badgeConf && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeConf.className}`}>
            {badgeConf.emoji} {badgeConf.label}
            <span className="ml-1 text-[10px] font-normal opacity-60">dev</span>
          </span>
        )}
      </div>

      {/* Title & description */}
      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1 leading-snug">{post.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{post.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>

        <div className="flex items-center gap-2">
          {/* Developer badge dropdown */}
          {isDeveloper && (
            <div className="relative">
              <button
                onClick={() => setShowBadgeMenu((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 hover:bg-violet-100 transition-colors border border-violet-200 dark:border-violet-800"
                title="Set developer badge"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Badge
              </button>
              {showBadgeMenu && (
                <div className="absolute bottom-full right-0 mb-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                  {(Object.keys(BADGE_CONFIG) as NonNullable<BadgeType>[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { onBadge(post.id, key); setShowBadgeMenu(false); }}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${post.badge === key ? 'opacity-60' : ''}`}
                    >
                      {BADGE_CONFIG[key].emoji} {BADGE_CONFIG[key].label}
                    </button>
                  ))}
                  {post.badge && (
                    <button
                      onClick={() => { onBadge(post.id, null); setShowBadgeMenu(false); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-800"
                    >
                      ✕ Remove Badge
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upvote button */}
          <button
            onClick={() => onUpvote(post.id, post.user_has_upvoted ?? false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              post.user_has_upvoted
                ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600'
            }`}
          >
            <svg className="w-4 h-4" fill={post.user_has_upvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span>{post.upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPost;
