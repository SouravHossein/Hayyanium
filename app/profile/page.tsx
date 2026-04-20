"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCompoundGallery } from '@/hooks/useCompoundGallery';
import AuthModal from '@/components/AuthModal';
import { useDiscovery } from '@/hooks/useDiscovery';
import CollectionProgress from '@/components/CollectionProgress';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { savedCompounds, deleteCompound } = useCompoundGallery();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { discovered, discover } = useDiscovery();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:opacity-80 transition-opacity">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="font-semibold">Back to Table</span>
          </Link>
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </header>
        <CollectionProgress total={118} count={discovered.length} />

        <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 mb-8">
          {user ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full shadow-md" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-md">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold">{user.user_metadata?.full_name || user.email}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="text-lg font-bold mb-2">Not Logged In</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Sign in to sync your saved compounds and discoveries across devices.</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
            Saved Compounds
          </h3>

          {savedCompounds.length === 0 ? (
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-200 border-dashed dark:border-gray-800 text-center">
              <p className="text-gray-500">You haven't saved any compounds yet.</p>
              <Link href="/" className="mt-2 inline-block text-cyan-600 text-sm font-semibold hover:underline">Go to Builder</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCompounds.map((compound) => (
                <div key={compound.id} className="relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col group">
                  <button
                    onClick={() => deleteCompound(compound.id!)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity dark:bg-red-900/30"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <h4 className="font-bold text-lg">{compound.formula}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{compound.name}</p>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex -space-x-2">
                      {compound.elements.map((el, i) => (
                        <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-gray-800" style={{ backgroundColor: `hsl(${el.group * 20}, 70%, 50%)` }}>
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
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
