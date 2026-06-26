import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Client from '../api/client';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        Client.seedCategories().catch(err => {
          console.error('Error seeding default categories:', err);
        });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signOut = async () => {
    sessionStorage.removeItem('has_seen_intro_session');
    await supabase.auth.signOut();
  };

  const markIntroVideoSeen = async () => {
    await supabase.auth.updateUser({ data: { has_seen_intro_video: true } });
    setUser((prev) => prev ? { ...prev, user_metadata: { ...prev.user_metadata, has_seen_intro_video: true } } : prev);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    markIntroVideoSeen
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
