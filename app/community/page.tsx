"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';
import { CommunityPost, CommunityPostData } from '@/components/CommunityPost';
import { ArrowLeft, Plus, Sparkles, Bug, Settings, Users } from '@/components/icons';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n/I18nProvider';

type FilterType = 'all' | 'bug' | 'feature';
type SortType = 'top' | 'new';
type BadgeType = 'confirmed' | 'planned' | 'wont_fix' | 'done' | null;

const DEVELOPER_EMAIL = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL ?? '';

type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function CommunityPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { t } = useI18n();
  const isDeveloper = !!user && !!DEVELOPER_EMAIL && user.email === DEVELOPER_EMAIL;

  const [posts, setPosts] = useState<CommunityPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('top');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<'bug' | 'feature'>('bug');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const resolveAuthorFallback = useCallback((postUserId: string | null) => {
    if (!postUserId || !user || postUserId !== user.id) {
      return { author_name: null, author_avatar_url: null };
    }

    return {
      author_name: user.user_metadata?.full_name || user.email || t("post.community_contributor"),
      author_avatar_url: user.user_metadata?.avatar_url || null,
    };
  }, [t, user]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch posts joined with author profiles
    let query = supabase
      .from('community_posts')
      .select('*, author:user_profiles(display_name, avatar_url)');

    if (filterType !== 'all') {
      query = query.eq('type', filterType);
    }

    if (sortBy === 'top') {
      query = query.order('upvotes', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    // 2. Fetch user upvotes if logged in
    let upvotedIds = new Set<string>();
    if (user && data && data.length > 0) {
      const { data: upvotes } = await supabase
        .from('community_upvotes')
        .select('post_id')
        .eq('user_id', user.id);
      
      if (upvotes) {
        upvotedIds = new Set(upvotes.map(u => u.post_id));
      }
    }

    // 3. Map everything to the local state
    const mappedPosts = (data || []).map((post: any) => {
      const author = post.author as { display_name: string | null; avatar_url: string | null } | null;
      const fallback = resolveAuthorFallback(post.user_id);

      return {
        ...post,
        author_name: author?.display_name ?? fallback.author_name,
        author_avatar_url: author?.avatar_url ?? fallback.author_avatar_url,
        user_has_upvoted: upvotedIds.has(post.id),
      };
    });

    setPosts(mappedPosts);
    setLoading(false);
  }, [resolveAuthorFallback, supabase, filterType, sortBy, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleUpvote = async (postId: string, hasUpvoted: boolean) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, upvotes: p.upvotes + (hasUpvoted ? -1 : 1), user_has_upvoted: !hasUpvoted }
          : p
      )
    );

    if (hasUpvoted) {
      await supabase.from('community_upvotes').delete().eq('post_id', postId).eq('user_id', user.id);
      await supabase.rpc('decrement_upvotes', { post_id: postId });
    } else {
      await supabase.from('community_upvotes').insert({ post_id: postId, user_id: user.id });
      await supabase.rpc('increment_upvotes', { post_id: postId });
    }
  };

  const handleBadge = async (postId: string, badge: BadgeType) => {
    if (!isDeveloper) return;

    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, badge } : p)));

    await supabase.from('community_posts').update({ badge }).eq('id', postId);
  };

  const handleDelete = async (postId: string) => {
    // Optimistic update
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    const { error } = await supabase.from('community_posts').delete().eq('id', postId);
    
    if (error) {
      console.error('Error deleting post:', error);
      // Rollback if error
      fetchPosts();
      alert(t("community.post_error"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('community_posts').insert({
      user_id: user?.id ?? null,
      type: newType,
      title: newTitle,
      description: newDesc,
    });

    setIsSubmitting(false);

    if (!error) {
      setSubmitSuccess(true);
      setNewTitle('');
      setNewDesc('');
      setNewType('bug');
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
        fetchPosts();
      }, 2000);
    } else {
      alert(t("community.post_error"));
    }
  };

  const bugCount = posts.filter((p) => p.type === 'bug').length;
  const featureCount = posts.filter((p) => p.type === 'feature').length;

  return (
    <div className="min-h-screen p-3 sm:p-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] font-display">
      <div className="max-w-4xl mx-auto">
        <header className="grid grid-cols-[1fr_auto] gap-3 mb-6 sm:mb-8 items-start">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity font-bold min-h-11">
            <ArrowLeft className="w-5 h-5" />
            <span>{t("common.back_to_table")}</span>
          </Link>
          <div className="flex items-center justify-end gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setShowForm((v) => !v);
              }}
              className="min-h-11 px-4 py-2 bg-lanthanide text-retro-stroke font-bold border-2 border-retro-stroke inline-flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              {showForm ? t("common.close") : t("common.new_post")}
            </button>
          </div>
          <h1 className="text-2xl font-bold col-span-2 leading-tight">{t("community.title")}</h1>
        </header>

        {showForm && (
          <section className="card p-4 sm:p-8 mb-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t("community.create_new_post")}
            </h2>

            {submitSuccess ? (
              <div className="bg-actinide text-retro-stroke p-6 rounded-xl text-center border-2 border-retro-stroke">
                <p className="font-black text-lg">{t("community.posted_successfully")}</p>
                <p className="text-sm mt-1">{t("community.posted_live")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex p-1.5 rounded-xl border-2 border-retro-stroke bg-retro-bg-light">
                  <button type="button" onClick={() => setNewType('bug')} className={`flex-1 min-h-11 py-3 text-sm font-black transition-all ${newType === 'bug' ? 'bg-nonmetal text-white border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}>
                    {t("community.type_bug_report")}
                  </button>
                  <button type="button" onClick={() => setNewType('feature')} className={`flex-1 min-h-11 py-3 text-sm font-black transition-all ${newType === 'feature' ? 'bg-transition-metal text-retro-stroke border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}>
                    {t("community.type_feature_request")}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">{t("community.field_title")}</label>
                  <input
                    required
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t("community.field_title_placeholder")}
                    className="w-full min-h-11 px-4 py-3 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">{t("community.field_description")}</label>
                  <textarea
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={t("community.field_description_placeholder")}
                    rows={4}
                    className="w-full min-h-28 px-4 py-3 text-sm font-bold resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-11 py-3 bg-lanthanide text-retro-stroke border-2 border-retro-stroke font-black text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? t("community.posting") : t("community.submit_post")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="min-h-11 px-4 py-3 bg-white text-retro-stroke border-2 border-retro-stroke font-bold text-sm"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
        
        <section className="card p-6 sm:p-8 mb-8">
          <p className="text-sm font-bold opacity-80 mb-5 leading-relaxed">
            {t("community.board_intro")}
          </p>
          <div className="flex gap-3 flex-wrap">
            <span className="text-sm font-black bg-actinide text-retro-stroke border-2 border-retro-stroke px-3 py-1 rounded-full inline-flex items-center gap-2"><Users className="w-4 h-4" /> {posts.length} {t("community.stats_posts")}</span>
            <span className="text-sm font-black bg-nonmetal text-white border-2 border-retro-stroke px-3 py-1 rounded-full inline-flex items-center gap-2"><Bug className="w-4 h-4" /> {bugCount} {t("community.stats_bugs")}</span>
            <span className="text-sm font-black bg-transition-metal text-retro-stroke border-2 border-retro-stroke px-3 py-1 rounded-full inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> {featureCount} {t("community.stats_features")}</span>
          </div>
        </section>
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex p-1 rounded-xl border-2 border-retro-stroke bg-retro-bg-light gap-1">
            {(['all', 'bug', 'feature'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 text-sm rounded-lg font-bold transition-all capitalize ${filterType === f ? 'bg-actinide text-retro-stroke border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-70 hover:opacity-100'}`}
              >
                {f === 'all' ? t("community.filter_all") : f === 'bug' ? t("community.filter_bugs") : t("community.filter_features")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl border-2 border-retro-stroke bg-retro-bg-light">
            {(['top', 'new'] as SortType[]).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 text-sm rounded-lg font-bold transition-all ${sortBy === s ? 'bg-alkaline-earth-metal text-retro-stroke border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-70 hover:opacity-100'}`}
              >
                {s === 'top' ? t("community.sort_top") : t("community.sort_new")}
              </button>
            ))}
          </div>
        </div>

        {isDeveloper && (
          <div className="card p-4 mb-5 bg-alkaline-earth-metal">
            <span className="text-sm font-bold">{t("community.developer_mode_active")}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-retro-stroke/20 rounded w-20 mb-3" />
                <div className="h-5 bg-retro-stroke/20 rounded w-3/4 mb-2" />
                <div className="h-4 bg-retro-stroke/20 rounded w-full mb-1" />
                <div className="h-4 bg-retro-stroke/20 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-10 text-center">
            <h3 className="text-lg font-black mb-2">{t("community.empty_title")}</h3>
            <p className="text-sm font-bold opacity-80 mb-5 leading-relaxed">
              {t("community.empty_body")}
            </p>
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 bg-lanthanide text-retro-stroke px-5 py-2.5 border-2 border-retro-stroke font-bold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              {t("community.empty_cta")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <CommunityPost
                key={post.id}
                post={post}
                isDeveloper={isDeveloper}
                currentUserId={user?.id}
                onUpvote={handleUpvote}
                onBadge={handleBadge}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
