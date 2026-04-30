"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCompoundGallery } from '@/hooks/useCompoundGallery';
import AuthModal from '@/components/AuthModal';
import { useDiscovery } from '@/hooks/useDiscovery';
import CollectionProgress from '@/components/CollectionProgress';
import { createClient } from '@/lib/supabase/client';
import { getPlayerProgress, getAllZoneProgress } from '@/lib/quiz/progressionStorage';
import { getStreak } from '@/lib/quiz/quizStorage';
import { ZONE_DEFINITIONS } from '@/data/zones';
import PlayerXpBar from '@/components/quiz/PlayerXpBar';
import BadgeDisplay from '@/components/quiz/BadgeDisplay';
import RankBadge from '@/components/quiz/RankBadge';
import HayyaniumLogo from '@/components/HayyaniumLogo';
import { 
  ArrowLeft, Flame, Skull, Medal, Check, 
  MessageSquare, Bug, Sparkles, Users, ChevronRight, FlaskConical 
} from '@/components/icons';
import type { PlayerProgress, ZoneProgress } from '@/types/progressionTypes';

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
  const [rpgProgress, setRpgProgress] = useState<PlayerProgress | null>(null);
  const [allZp, setAllZp] = useState<Record<string, ZoneProgress>>({});
  const [localStreak, setLocalStreak] = useState({ current: 0, longest: 0 });

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

  useEffect(() => {
    try {
      setRpgProgress(getPlayerProgress());
      setAllZp(getAllZoneProgress());
      setLocalStreak(getStreak());
    } catch { /* SSR guard */ }
  }, []);
  return (
    <div className="min-h-screen p-4 sm:p-8 pb-24 font-display">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Table</span>
          </Link>
          <HayyaniumLogo size={100} className="sm:scale-125" />
        </header>
        <CollectionProgress total={118} count={discovered.length} />

        {/* ── RPG Identity Card ── */}
        {rpgProgress && (
          <section className="card p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-cyan-500" /> Quiz Academy
              </h3>
              <Link href="/quiz" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">View Academy <ChevronRight className="w-4 h-4" /></Link>
            </div>

            {/* XP bar */}
            <PlayerXpBar
              xp={rpgProgress.playerXp}
              level={rpgProgress.playerLevel}
              rank={rpgProgress.playerRank}
              animate={false}
            />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 py-3">
                <div className="text-2xl font-black text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2">
                  <Flame className="w-6 h-6 fill-orange-500" /> {localStreak.current}
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Day Streak</div>
              </div>
              <div className="text-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 py-3">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                  <Skull className="w-6 h-6 fill-emerald-500/20" /> {Object.values(allZp).filter(z => z.bossCleared).length}
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Bosses Cleared</div>
              </div>
              <div className="text-center rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 py-3">
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2">
                  <Medal className="w-6 h-6 fill-purple-500/20" /> {rpgProgress.earnedBadges.length}
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Badges</div>
              </div>
            </div>

            {/* Zone progress mini-grid */}
            <div className="mt-5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Zone Progress</p>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                {ZONE_DEFINITIONS.slice(0, 14).map(zone => {
                  const zp = allZp[zone.id];
                  const pct = zp ? Math.round((zp.coverageCount / zone.totalElements) * 100) : 0;
                  return (
                    <Link
                      key={zone.id}
                      href={`/quiz?zone=${zone.id}`}
                      title={`${zone.label} — ${pct}% coverage`}
                      className="group relative flex flex-col items-center gap-0.5"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base relative overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-transform">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-cyan-400/40 dark:bg-cyan-500/30 transition-all"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="relative z-10">{zone.icon}</span>
                      </div>
                      {zp?.bossCleared && <span className="text-[8px]">✅</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            {rpgProgress.earnedBadges.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Badges Earned</p>
                <BadgeDisplay badges={rpgProgress.earnedBadges} size="sm" />
              </div>
            )}
          </section>
        )}

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
                  {/* <button className="px-6 py-2.5 bg-actinide text-retro-stroke font-bold border-2 border-retro-stroke">
                    View Stats
                  </button> */}
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
                <FlaskConical className="w-6 h-6" />
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
              <MessageSquare className="w-6 h-6" />
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
                  className={`flex-1 py-3 text-sm font-black transition-all flex items-center justify-center gap-2 ${feedbackType === 'bug' ? 'bg-nonmetal text-white border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Bug className="w-4 h-4" /> Bug Report
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('feature')}
                  className={`flex-1 py-3 text-sm font-black transition-all flex items-center justify-center gap-2 ${feedbackType === 'feature' ? 'bg-transition-metal text-retro-stroke border-2 border-retro-stroke' : '!border-transparent !shadow-none !bg-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Sparkles className="w-4 h-4" /> Feature Request
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
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-xl mb-1">Community Board</h3>
            <p className="text-sm font-bold opacity-80">Browse, upvote, and discuss ideas with other chemists.</p>
          </div>
          <div className="ml-auto w-12 h-12 rounded-full bg-white border-2 border-retro-stroke flex items-center justify-center group-hover:bg-retro-stroke group-hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </div>
        </Link>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
