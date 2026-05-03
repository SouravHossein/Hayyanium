"use client";

import { ArrowBigUp, Trash2 } from '@/components/icons';
import React, { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';

type PostType = 'bug' | 'feature';
type BadgeType = 'confirmed' | 'planned' | 'wont_fix' | 'done' | null;

export interface CommunityPostData {
  id: string;
  user_id: string | null;
  author_name?: string | null;
  author_avatar_url?: string | null;
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
  currentUserId?: string | null;
  onUpvote: (postId: string, hasUpvoted: boolean) => void;
  onBadge: (postId: string, badge: BadgeType) => void;
  onDelete: (postId: string) => void;
}

const BADGE_CONFIG: Record<
  NonNullable<BadgeType>,
  { labelKey: "post.badge_confirmed" | "post.badge_planned" | "post.badge_wont_fix" | "post.badge_done"; className: string }
> = {
  confirmed: { labelKey: 'post.badge_confirmed', className: 'bg-actinide text-retro-stroke' },
  planned: { labelKey: 'post.badge_planned', className: 'bg-transition-metal text-retro-stroke' },
  wont_fix: { labelKey: "post.badge_wont_fix", className: 'bg-nonmetal text-white' },
  done: { labelKey: 'post.badge_done', className: 'bg-lanthanide text-retro-stroke' },
};

const TYPE_CONFIG: Record<PostType, { labelKey: "post.type_bug" | "post.type_feature"; className: string }> = {
  bug: { labelKey: 'post.type_bug', className: 'bg-nonmetal text-white' },
  feature: { labelKey: 'post.type_feature', className: 'bg-alkaline-earth-metal text-retro-stroke' },
};

export const CommunityPost: React.FC<CommunityPostProps> = ({ post, isDeveloper, currentUserId, onUpvote, onBadge, onDelete }) => {
  const { t } = useI18n();
  const [showBadgeMenu, setShowBadgeMenu] = useState(false);
  const typeConf = TYPE_CONFIG[post.type];
  const badgeConf = post.badge ? BADGE_CONFIG[post.badge] : null;
  const authorName = post.author_name || t("post.community_contributor");
  const authorInitial = authorName.trim().charAt(0).toUpperCase() || '?';

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("post.just_now");
    if (mins < 60) return t("post.minutes_ago", { n: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("post.hours_ago", { n: hrs });
    return t("post.days_ago", { n: Math.floor(hrs / 24) });
  };

  return (
    <div className="card p-4 sm:p-5 relative overflow-visible">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-retro-stroke bg-white">
            {post.author_avatar_url ? (
              <img src={post.author_avatar_url} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-alkali-metal text-sm font-black text-retro-stroke">
                {authorInitial}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.28em] opacity-60">{t("post.posted_by")}</p>
            <h4 className="truncate text-sm font-black">{authorName}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
          <span className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-full border-2 border-retro-stroke ${typeConf.className}`}>
            {t(typeConf.labelKey)}
          </span>
          {badgeConf && (
            <span className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-full border-2 border-retro-stroke ${badgeConf.className}`}>
              {t(badgeConf.labelKey)}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-black text-base mb-1 leading-snug">{post.title}</h3>
      <p className="text-sm font-bold opacity-80 leading-relaxed">{post.description}</p>

      <div className="flex items-end justify-between mt-4 pt-3 border-t-2 border-retro-stroke gap-3">
        <span className="text-xs font-bold opacity-70">{timeAgo(post.created_at)}</span>

        <div className="flex items-center gap-2">
          {isDeveloper && (
            <div className="relative">
              <button
                onClick={() => setShowBadgeMenu((v) => !v)}
                className="min-h-9 text-xs font-bold px-2.5 py-1.5 bg-alkaline-earth-metal text-retro-stroke border-2 border-retro-stroke"
                title={t("post.badge_title")}
              >
                {t("post.badge_button")}
              </button>
              {showBadgeMenu && (
                <div className="absolute bottom-full right-0 mb-2 z-50 bg-white border-2 border-retro-stroke rounded-xl overflow-hidden min-w-[152px] max-h-56 overflow-y-auto shadow-xl">
                  {(Object.keys(BADGE_CONFIG) as NonNullable<BadgeType>[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        onBadge(post.id, key);
                        setShowBadgeMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-bold hover:opacity-80 transition-opacity ${post.badge === key ? 'opacity-60' : ''}`}
                    >
                      {t(BADGE_CONFIG[key].labelKey)}
                    </button>
                  ))}
                  {post.badge && (
                    <button
                      onClick={() => {
                        onBadge(post.id, null);
                        setShowBadgeMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-bold bg-nonmetal text-white"
                    >
                      {t("post.remove_badge")}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {(isDeveloper || (currentUserId && post.user_id === currentUserId)) && (
            <button
              onClick={() => {
                if (window.confirm(t("post.delete_confirm"))) {
                  onDelete(post.id);
                }
              }}
              className="min-h-9 flex items-center justify-center px-2.5 py-1.5 bg-nonmetal text-white border-2 border-retro-stroke hover:opacity-80 transition-opacity"
              title={t("post.delete_button")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onUpvote(post.id, post.user_has_upvoted ?? false)}
              className={`min-h-10 min-w-16 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-black border-2 border-retro-stroke ${post.user_has_upvoted ? 'bg-lanthanide text-retro-stroke' : 'bg-white text-retro-stroke'}`}
              >
                <ArrowBigUp className={`w-4 h-4 ${post.user_has_upvoted ? 'text-retro-stroke' : ''}`} />
              <span>{post.upvotes}</span>
            </button>
            <span className="font-bold text-[10px] mt-1 opacity-70">{t("post.upvote_label")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPost;
