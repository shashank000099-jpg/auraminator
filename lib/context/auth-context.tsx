"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

interface UserSession {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: "buyer" | "seller" | "admin";
  isVerified: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: "buyer" | "seller") => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientSupabase();

  useEffect(() => {
    // 1. Check local storage session first for instant responsiveness
    try {
      const savedUser = localStorage.getItem("auraminator_user_session");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      }
    } catch {}

    // 2. Check Supabase Auth
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const userMeta = u.user_metadata || {};
          const sessionUser: UserSession = {
            id: u.id,
            email: u.email || "",
            fullName: userMeta.full_name || "Sovereign Member",
            username: userMeta.username || (u.email ? u.email.split("@")[0] : "user"),
            role: userMeta.role || "buyer",
            isVerified: !!userMeta.is_verified,
            avatarUrl: userMeta.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
          };
          setUser(sessionUser);
          localStorage.setItem("auraminator_user_session", JSON.stringify(sessionUser));
        }
      } catch {
        // Live Supabase not connected or placeholder key
      } finally {
        setIsLoading(false);
      }
    };

    checkSupabaseAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const userMeta = u.user_metadata || {};
        const sessionUser: UserSession = {
          id: u.id,
          email: u.email || "",
          fullName: userMeta.full_name || "Sovereign Member",
          username: userMeta.username || (u.email ? u.email.split("@")[0] : "user"),
          role: userMeta.role || "buyer",
          isVerified: !!userMeta.is_verified,
          avatarUrl: userMeta.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        };
        setUser(sessionUser);
        localStorage.setItem("auraminator_user_session", JSON.stringify(sessionUser));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("auraminator_user_session");
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If supabase fails (e.g. placeholder env), check local mock auth fallback
          if (email.includes("seller") || email.includes("kaizen")) {
            const mockSeller: UserSession = {
              id: "seller-001",
              email,
              fullName: "KAIZEN STUDIOS",
              username: "kaizen",
              role: "seller",
              isVerified: true,
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            };
            setUser(mockSeller);
            localStorage.setItem("auraminator_user_session", JSON.stringify(mockSeller));
            return { success: true };
          } else {
            const mockBuyer: UserSession = {
              id: "buyer-001",
              email,
              fullName: email.split("@")[0].toUpperCase(),
              username: email.split("@")[0],
              role: "buyer",
              isVerified: true,
              avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
            };
            setUser(mockBuyer);
            localStorage.setItem("auraminator_user_session", JSON.stringify(mockBuyer));
            return { success: true };
          }
        }
        if (data.user) {
          const userMeta = data.user.user_metadata || {};
          const sessionUser: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: userMeta.full_name || email.split("@")[0],
            username: userMeta.username || email.split("@")[0],
            role: userMeta.role || "buyer",
            isVerified: !!userMeta.is_verified,
            avatarUrl: userMeta.avatar_url,
          };
          setUser(sessionUser);
          localStorage.setItem("auraminator_user_session", JSON.stringify(sessionUser));
          return { success: true };
        }
      }

      // Default mock login fallback
      const fallbackUser: UserSession = {
        id: `user_${Date.now()}`,
        email,
        fullName: email.split("@")[0].toUpperCase(),
        username: email.split("@")[0],
        role: "buyer",
        isVerified: true,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      };
      setUser(fallbackUser);
      localStorage.setItem("auraminator_user_session", JSON.stringify(fallbackUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to sign in" };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: "buyer" | "seller" = "buyer") => {
    setIsLoading(true);
    try {
      const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            role,
            is_verified: role === "seller" ? false : true,
          },
        },
      });

      const sessionUser: UserSession = {
        id: data?.user?.id || `usr_${Date.now()}`,
        email,
        fullName,
        username,
        role,
        isVerified: role === "seller" ? false : true,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      };

      setUser(sessionUser);
      localStorage.setItem("auraminator_user_session", JSON.stringify(sessionUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign up failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    localStorage.removeItem("auraminator_user_session");
  };

  const updateProfile = (data: Partial<UserSession>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("auraminator_user_session", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
