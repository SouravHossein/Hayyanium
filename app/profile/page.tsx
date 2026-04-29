"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCompoundGallery } from '@/hooks/useCompoundGallery';
import AuthModal from '@/components/AuthModal';
import { useDiscovery } from '@/hooks/useDiscovery';
import CollectionProgress from '@/components/CollectionProgress';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { savedCompounds, deleteCompound } = useCompoundGallery();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { discovered } = useDiscovery();

  // Feedback state
  const supabase = createClient();
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature'>('bug');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle || !feedbackDesc) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('feedbacks').insert({
      user_id: user?.id || null,
      type: feedbackType,
      title: feedbackTitle,
      description: feedbackDesc,
    });
    setIsSubmitting(false);
    if (!error) {
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setFeedbackType('bug');
        setFeedbackTitle('');
        setFeedbackDesc('');
      }, 3000);
    } else {
      alert('Error submitting feedback. Please try again.');
    }
  };
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStreak = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('streak')
        .eq('id', user.id)
        .single();
      if (data) {
        setStreak(data.streak || 0);
      }
    };
    fetchStreak();
  }, [user?.id, supabase]);
  return (
    <div className="min-h-screen p-4 sm:p-8 pb-24 font-display">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Back to Table</span>
          </Link>
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </header>
        <CollectionProgress total={118} count={discovered.length} />

        {/* ── User info ── */}
        <section className="card p-6 sm:p-10 mb-10 overflow-hidden relative">
          {user ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 z-10 relative">
              <div className="relative">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-retro-stroke object-cover sticker-border" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-alkali-metal flex items-center justify-center text-4xl font-black text-retro-stroke border-4 border-retro-stroke sticker-border">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-nonmetal text-white text-xs font-black px-3 py-1.5 rounded-full border-2 border-retro-stroke transform rotate-3">
                  Lvl 5
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left flex flex-col justify-center h-full mt-2 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                  <h2 className="text-3xl font-black tracking-tight">{user.user_metadata?.full_name || user.email}</h2>
                  <div className="flex items-center justify-center gap-1 text-retro-stroke bg-alkaline-earth-metal px-3 py-1.5 rounded-xl w-max mx-auto sm:mx-0 border-2 border-retro-stroke font-bold">
                    <span className="text-sm">{streak} Day Streak!</span>
                  </div>
                </div>
                <p className="text-sm font-bold opacity-80 mb-6">{user.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={signOut}
                    className="px-5 py-2.5 bg-white text-retro-stroke font-bold border-2 border-retro-stroke"
                  >
                    Log Out
                  </button>
                  <button className="px-6 py-2.5 bg-actinide text-retro-stroke font-bold border-2 border-retro-stroke">
                    View Stats
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 z-10 relative">
              <div className="w-20 h-20 mx-auto bg-alkaline-earth-metal rounded-full flex items-center justify-center mb-5 border-4 border-retro-stroke sticker-border">
                <svg className="w-10 h-10 text-retro-stroke" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="text-2xl font-black mb-2">Join the Laboratory</h2>
              <p className="text-sm font-bold mb-8 max-w-sm mx-auto opacity-80">Sign in to save your compound discoveries, earn XP, and build your daily learning streak!</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-3.5 bg-lanthanide text-retro-stroke font-black text-lg border-2 border-retro-stroke"
              >
                Sign In to Start
              </button>
            </div>
          )}
        </section>

        {/* ── Saved Compounds ── */}
        <section className="mb-10">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <span className="p-2 bg-transition-metal text-retro-stroke border-2 border-retro-stroke rounded-xl transform -rotate-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
              </span>
              Saved Compounds
            </h3>
            {savedCompounds.length > 0 && (
              <span className="text-sm font-black bg-actinide text-retro-stroke border-2 border-retro-stroke px-3 py-1 rounded-full">{savedCompounds.length} Discovered</span>
            )}
          </div>

          {savedCompounds.length === 0 ? (
            <div className="card p-10 flex flex-col items-center justify-center text-center bg-[url('https://www.transparenttextures.com/patterns/p6.png')]">
              <div className="w-20 h-20 bg-alkali-metal rounded-full flex items-center justify-center mb-5 border-4 border-retro-stroke sticker-border">
                <svg className="w-10 h-10 text-retro-stroke" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <p className="font-bold mb-4 text-lg">Your laboratory is empty!</p>
              <Link href="/" className="px-6 py-2.5 bg-lanthanide text-retro-stroke border-2 border-retro-stroke rounded-xl text-sm font-bold shadow-[4px_4px_0px_var(--color-retro-stroke)] hover:-translate-y-1 transition-all">Start Combining</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCompounds.map((compound) => (
                <div key={compound.id} className="card p-6 flex flex-col group relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/p6.png')]">
                  <button
                    onClick={() => deleteCompound(compound.id!)}
                    className="absolute top-3 right-3 p-2 bg-nonmetal text-white border-2 border-retro-stroke opacity-0 group-hover:opacity-100 !shadow-none !translate-y-0"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <h4 className="font-black text-xl tracking-tight">{compound.formula}</h4>
                  <p className="text-sm font-bold opacity-80 capitalize mb-4">{compound.name}</p>
                  <div className="mt-auto pt-4 border-t-2 border-retro-stroke">
                    <div className="flex -space-x-3">
                      {compound.elements.map((el, i) => (
                        <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-retro-stroke border-2 border-retro-stroke" style={{ backgroundColor: `hsl(${el.group * 20}, 75%, 60%)` }}>
                          {el.symbol}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Feedback & Support ── */}
        <section className="card p-6 sm:p-10 mb-10 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]">
          <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
            <span className="p-2.5 bg-alkali-metal text-retro-stroke border-2 border-retro-stroke rounded-xl transform rotate-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
            </span>
            Feedback &amp; Support
          </h3>
          <p className="text-sm font-bold opacity-80 mb-8">Help us improve your laboratory experience.</p>

          {feedbackSuccess ? (
            <div className="bg-actinide text-retro-stroke p-8 rounded-xl flex flex-col items-center justify-center text-center border-4 border-retro-stroke sticker-border">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 border-2 border-retro-stroke">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-black text-2xl mb-1">Thank you!</p>
              <p className="text-sm font-bold mt-1">Your feedback helps us grow.</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="flex p-1.5 rounded-xl border-2 border-retro-stroke bg-retro-bg-light">
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={`flex-1 py-3 text-sm font-black transition-all ${feedbackType === 'bug' ? 'bg-nonmetal text-white border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}
                >
                  🐛 Bug Report
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('feature')}
                  className={`flex-1 py-3 text-sm font-black transition-all ${feedbackType === 'feature' ? 'bg-transition-metal text-retro-stroke border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}
                >
                  ✨ Feature Request
                </button>
              </div>

              <div>
                <label className="block text-sm font-black mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="Brief summary..."
                  className="w-full px-5 py-3.5 text-sm font-bold placeholder:text-retro-stroke placeholder:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-black mb-2">Description</label>
                <textarea
                  required
                  value={feedbackDesc}
                  onChange={(e) => setFeedbackDesc(e.target.value)}
                  placeholder="Tell us the details..."
                  rows={4}
                  className="w-full px-5 py-3.5 text-sm font-bold placeholder:text-retro-stroke placeholder:opacity-50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-lanthanide text-retro-stroke px-4 py-4 text-sm font-black disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                {isSubmitting ? 'Sending Transmission...' : 'Submit Feedback'}
              </button>

              {!user && (
                <p className="text-sm text-center font-bold opacity-80 mt-2">
                  You are submitting anonymously.{' '}
                  <button type="button" onClick={() => setIsAuthModalOpen(true)} className="!shadow-none !border-none !bg-transparent !p-0 underline font-black hover:text-nonmetal transition-colors">
                    Log in
                  </button>{' '}
                  to track your feedback.
                </p>
              )}
            </form>
          )}
        </section>

        {/* ── Community link ── */}
        <Link
          href="/community"
          className="card flex items-center gap-5 p-6 group hover:-translate-y-1 transition-all duration-300 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"
        >
          <div className="w-16 h-16 bg-post-transition-metal text-retro-stroke border-2 border-retro-stroke rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
          </div>
          <div>
            <h3 className="font-black text-xl mb-1">Community Board</h3>
            <p className="text-sm font-bold opacity-80">Browse, upvote, and discuss ideas with other chemists.</p>
          </div>
          <div className="ml-auto w-12 h-12 rounded-full bg-white border-2 border-retro-stroke flex items-center justify-center group-hover:bg-retro-stroke group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
