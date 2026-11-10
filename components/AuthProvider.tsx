"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { ensureProfile, subscribeProfile } from "@/lib/data";
import type { UserProfile } from "@/lib/types";
import { messageOf } from "@/lib/utils";

type AuthState = { user: User | null; profile: UserProfile | null; loading: boolean; error: string | null };
const Context = createContext<AuthState>({ user: null, profile: null, loading: true, error: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true, error: null });
  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setState({ user: null, profile: null, loading: false, error: null });
      return;
    }
    let current = 0;
    let unsubscribeProfile: (() => void) | null = null;
    const stopAuth = onAuthStateChanged(auth, async (user) => {
      const generation = ++current;
      unsubscribeProfile?.();
      unsubscribeProfile = null;
      setState({ user, profile: null, loading: Boolean(user), error: null });
      if (!user) return;
      try {
        await ensureProfile(user);
        if (current !== generation) return;
        unsubscribeProfile = subscribeProfile(user.uid, (profile) => {
          if (current === generation) setState({ user, profile, loading: false, error: null });
        }, (error) => {
          if (current === generation) setState({ user, profile: null, loading: false, error: messageOf(error) });
        });
      } catch (error) {
        if (current === generation) setState({ user, profile: null, loading: false, error: messageOf(error) });
      }
    }, (error) => setState({ user: null, profile: null, loading: false, error: messageOf(error) }));
    return () => { current++; unsubscribeProfile?.(); stopAuth(); };
  }, []);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function useAuth() { return useContext(Context); }
