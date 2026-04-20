"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';
import { CommunityPost, CommunityPostData } from '@/components/CommunityPost';

type FilterType = 'all' | 'bug' | 'feature';
type SortType = 'top' | 'new';
type BadgeType = 'confirmed' | 'planned' | 'wont_fix' | 'done' | null;

const DEVELOPER_EMAIL = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL ?? '';

export default function CommunityPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const isDeveloper = !!user && !!DEVELOPER_EMAIL && user.email === DEVELOPER_EMAIL;

  const [posts, setPosts] = useState<CommunityPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('top');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // New post form
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<'bug' | 'feature'>('bug');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('community_posts')
      .select('*');

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

    // Check which posts the current user has upvoted
    if (user && data && data.length > 0) {
      const { data: upvotes } = await supabase
        .from('community_upvotes')
        .select('post_id')
        .eq('user_id', user.id);

      const upvotedIds = new Set((upvotes ?? []).map((u: { post_id: string }) => u.post_id));
      setPosts(data.map((post: CommunityPostData) => ({ ...post, user_has_upvoted: upvotedIds.has(post.id) })));
    } else {
      setPosts(data ?? []);
    }
    setLoading(false);
  }, [supabase, filterType, sortBy, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleUpvote = async (postId: string, hasUpvoted: boolean) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, upvotes: p.upvotes + (hasUpvoted ? -1 : 1), user_has_upvoted: !hasUpvoted }
          : p
      )
    );

    if (hasUpvoted) {
      await supabase
        .from('community_upvotes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      await supabase.rpc('decrement_upvotes', { post_id: postId });
    } else {
      await supabase
        .from('community_upvotes')
        .insert({ post_id: postId, user_id: user.id });

      await supabase.rpc('increment_upvotes', { post_id: postId });
    }
  };

  const handleBadge = async (postId: string, badge: BadgeType) => {
    if (!isDeveloper) return;

    // Optimistic update
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, badge } : p)));

    await supabase
      .from('community_posts')
      .update({ badge })
      .eq('id', postId);
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
      alert('Error posting. Please try again.');
    }
  };

  const filteredPosts = posts;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-28">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-violet-600 via-cyan-600 to-blue-700 dark:from-violet-900 dark:via-cyan-900 dark:to-blue-900 px-6 pt-8 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
        <div className="max-w-4xl mx-auto relative">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Hayyanium
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">🧪</span> Community Board
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-xl">
                Share bugs you've found, request features, and upvote what matters most. Help shape Hayyanium!
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) { setIsAuthModalOpen(true); return; }
                setShowForm((v) => !v);
              }}
              className="flex items-center gap-2 bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-4 px-4 -mt-8">
        {/* Stats bar */}
        <div className="flex gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-2.5 shadow-sm border border-gray-200 dark:border-gray-800 text-sm font-semibold">
            <span className="text-2xl font-bold text-violet-600 dark:text-violet-400 mr-1">{posts.length}</span> posts
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-2.5 shadow-sm border border-gray-200 dark:border-gray-800 text-sm font-semibold">
            <span className="text-2xl font-bold text-red-500 mr-1">{posts.filter((p) => p.type === 'bug').length}</span> bugs
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-2.5 shadow-sm border border-gray-200 dark:border-gray-800 text-sm font-semibold">
            <span className="text-2xl font-bold text-cyan-500 mr-1">{posts.filter((p) => p.type === 'feature').length}</span> features
          </div>
        </div>

        {/* New post form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-lg animate-in slide-in-from-top-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Create New Post
            </h2>

            {submitSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-6 rounded-xl text-center">
                <p className="font-bold text-lg">✅ Posted successfully!</p>
                <p className="text-sm mt-1">Your post is now live.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button type="button" onClick={() => setNewType('bug')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${newType === 'bug' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                    🐛 Bug Report
                  </button>
                  <button type="button" onClick={() => setNewType('feature')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${newType === 'feature' ? 'bg-white dark:bg-gray-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-gray-500'}`}>
                    ✨ Feature Request
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    required
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Brief summary of your report..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe the bug or feature in detail..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Submit Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-sm gap-1">
            {(['all', 'bug', 'feature'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${filterType === f ? 'bg-violet-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                {f === 'all' ? '🌐 All' : f === 'bug' ? '🐛 Bugs' : '✨ Features'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-sm">
            {(['top', 'new'] as SortType[]).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${sortBy === s ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {s === 'top' ? '🔥 Top' : '🕐 New'}
              </button>
            ))}
          </div>
        </div>

        {/* Developer notice */}
        {isDeveloper && (
          <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2.5 mb-5 text-sm text-violet-700 dark:text-violet-400">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <span><strong>Developer mode active</strong> — You can badge posts using the "Badge" button on each card.</span>
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-3" />
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">🧫</div>
            <h3 className="text-lg font-bold mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm mb-5">Be the first to share a bug report or feature request!</p>
            <button
              onClick={() => {
                if (!user) { setIsAuthModalOpen(true); return; }
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Create First Post
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <CommunityPost
                key={post.id}
                post={post}
                isDeveloper={isDeveloper}
                onUpvote={handleUpvote}
                onBadge={handleBadge}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
