"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';
import { CommunityPost, CommunityPostData } from '@/components/CommunityPost';
import { ArrowLeft, Plus, Sparkles, Bug, Settings, Users } from '@/components/icons';

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

  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<'bug' | 'feature'>('bug');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('community_posts').select('*');

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

  const bugCount = posts.filter((p) => p.type === 'bug').length;
  const featureCount = posts.filter((p) => p.type === 'feature').length;

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-24 font-display">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Table</span>
          </Link>
          <h1 className="text-2xl font-bold">Community Board</h1>
          <button
            onClick={() => {
              if (!user) {
                setIsAuthModalOpen(true);
                return;
              }
              setShowForm((v) => !v);
            }}
            className="px-5 py-2.5 bg-lanthanide text-retro-stroke font-bold border-2 border-retro-stroke inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Close Form' : 'New Post'}
          </button>
        </header>

        <section className="card p-6 sm:p-8 mb-8">
          <p className="text-sm font-bold opacity-80 mb-5">
            Share bugs, request features, and upvote what matters most for Hayyanium.
          </p>
          <div className="flex gap-3 flex-wrap">
            <span className="text-sm font-black bg-actinide text-retro-stroke border-2 border-retro-stroke px-3 py-1 rounded-full inline-flex items-center gap-2"><Users className="w-4 h-4" /> {posts.length} Posts</span>
            <span className="text-sm font-black bg-nonmetal text-white border-2 border-retro-stroke px-3 py-1 rounded-full inline-flex items-center gap-2"><Bug className="w-4 h-4" /> {bugCount} Bugs</span>
            <span className="text-sm font-black bg-transition-metal text-retro-stroke border-2 border-retro-stroke px-3 py-1 rounded-full inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> {featureCount} Features</span>
          </div>
        </section>

        {showForm && (
          <section className="card p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Create New Post
            </h2>

            {submitSuccess ? (
              <div className="bg-actinide text-retro-stroke p-6 rounded-xl text-center border-2 border-retro-stroke">
                <p className="font-black text-lg">Posted successfully!</p>
                <p className="text-sm mt-1">Your post is now live.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex p-1.5 rounded-xl border-2 border-retro-stroke bg-retro-bg-light">
                  <button type="button" onClick={() => setNewType('bug')} className={`flex-1 py-3 text-sm font-black transition-all ${newType === 'bug' ? 'bg-nonmetal text-white border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}>
                    Bug Report
                  </button>
                  <button type="button" onClick={() => setNewType('feature')} className={`flex-1 py-3 text-sm font-black transition-all ${newType === 'feature' ? 'bg-transition-metal text-retro-stroke border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}>
                    Feature Request
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">Title</label>
                  <input
                    required
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Brief summary of your report..."
                    className="w-full px-5 py-3 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">Description</label>
                  <textarea
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe the bug or feature in detail..."
                    rows={4}
                    className="w-full px-5 py-3 text-sm font-bold resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-lanthanide text-retro-stroke border-2 border-retro-stroke font-black text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Submit Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-3 bg-white text-retro-stroke border-2 border-retro-stroke font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex p-1 rounded-xl border-2 border-retro-stroke bg-retro-bg-light gap-1">
            {(['all', 'bug', 'feature'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 text-sm rounded-lg font-bold transition-all capitalize ${filterType === f ? 'bg-actinide text-retro-stroke border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-70 hover:opacity-100'}`}
              >
                {f === 'all' ? 'All' : f === 'bug' ? 'Bugs' : 'Features'}
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
                {s === 'top' ? 'Top' : 'New'}
              </button>
            ))}
          </div>
        </div>

        {isDeveloper && (
          <div className="card p-4 mb-5 bg-alkaline-earth-metal">
            <span className="text-sm font-bold">Developer mode active. You can badge posts using the Badge button on each card.</span>
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
            <h3 className="text-lg font-black mb-2">No posts yet</h3>
            <p className="text-sm font-bold opacity-80 mb-5">Be the first to share a bug report or feature request.</p>
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
              Create First Post
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
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
