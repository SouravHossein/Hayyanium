"use client";

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '../lib/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const supabase = createClient();
  const [type, setType] = useState<'bug' | 'feature'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setIsSubmitting(true);
    const { error } = await supabase.from('feedbacks').insert({
      user_id: user?.id || null,
      type,
      title,
      description
    });

    setIsSubmitting(false);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setType('bug');
        setTitle('');
        setDescription('');
        onClose();
      }, 2000);
    } else {
      alert("Error submitting feedback. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white/95 p-6 shadow-2xl dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">Feedback & Support</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Help us improve Hayyanium. Found a bug or have an idea?</p>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-6 rounded-xl flex flex-col items-center justify-center text-center">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="font-bold">Thank you for your feedback!</p>
            <p className="text-sm mt-1">We appreciate your help.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'bug' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                🐛 Bug Report
              </button>
              <button
                type="button"
                onClick={() => setType('feature')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'feature' ? 'bg-white dark:bg-gray-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                ✨ Feature Request
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us the details..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            
            {!user && (
              <p className="text-xs text-center text-gray-500 mt-2">
                You are submitting anonymously. Log in to track your feedback.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
