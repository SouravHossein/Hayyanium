"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => { },
  signInWithLinkedIn: async () => { },
  signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync profile to public.user_profiles table
        // We use a try-catch and specific column check logic
        const syncProfile = async () => {
          const profileData = {
            id: currentUser.id,
            email: currentUser.email,
            display_name: currentUser.user_metadata?.full_name || currentUser.email,
            avatar_url: currentUser.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase.from('user_profiles').upsert(profileData);

          if (error) {
            // If updated_at fails, try without it (in case column is missing)
            if (error.message?.includes('updated_at')) {
              const { error: error2 } = await supabase.from('user_profiles').upsert({
                id: currentUser.id,
                display_name: profileData.display_name,
                avatar_url: profileData.avatar_url,
              });
              if (error2) console.error('Profile sync failed again:', error2.message, error2.code);
            } else {
              console.error('Profile sync error:', error.message, error.code, error.details);
            }
          }
        };

        syncProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signInWithLinkedIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithLinkedIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
