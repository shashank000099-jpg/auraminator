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
  signInWithGoogle: (redirectUrl?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientSupabase();

  const fetchProfileAndSetUser = async (authUser: any) => {
    try {
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const userMeta = authUser.user_metadata || {};
      const sessionUser: UserSession = {
        id: authUser.id,
        email: authUser.email || "",
        fullName: dbProfile?.full_name || userMeta.full_name || (authUser.email ? authUser.email.split("@")[0] : "Member"),
        username: dbProfile?.username || userMeta.username || (authUser.email ? authUser.email.split("@")[0] : "user"),
        role: dbProfile?.role || userMeta.role || "buyer",
        isVerified: dbProfile?.is_verified ?? (userMeta.role === "seller" ? false : true),
        avatarUrl: dbProfile?.avatar_url || userMeta.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      };

      setUser(sessionUser);
      setProfile(dbProfile || null);
      localStorage.setItem("auraminator_user_session", JSON.stringify(sessionUser));
      return sessionUser;
    } catch {
      const userMeta = authUser.user_metadata || {};
      const fallbackSessionUser: UserSession = {
        id: authUser.id,
        email: authUser.email || "",
        fullName: userMeta.full_name || (authUser.email ? authUser.email.split("@")[0] : "Member"),
        username: userMeta.username || (authUser.email ? authUser.email.split("@")[0] : "user"),
        role: userMeta.role || "buyer",
        isVerified: userMeta.role === "seller" ? false : true,
        avatarUrl: userMeta.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      };
      setUser(fallbackSessionUser);
      localStorage.setItem("auraminator_user_session", JSON.stringify(fallbackSessionUser));
      return fallbackSessionUser;
    }
  };

  useEffect(() => {
    // 1. Check local storage cache for instant UI responsiveness
    try {
      const savedUser = localStorage.getItem("auraminator_user_session");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {}

    // 2. Validate live Supabase session
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user && !error) {
          await fetchProfileAndSetUser(session.user);
        } else {
          // If no active supabase session, clear local storage
          setUser(null);
          setProfile(null);
          localStorage.removeItem("auraminator_user_session");
        }
      } catch {
        // Network or offline
      } finally {
        setIsLoading(false);
      }
    };

    checkSupabaseAuth();

    // 3. Listen for auth state changes in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfileAndSetUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
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
      if (!password) {
        return { success: false, error: "Password is required." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message || "Invalid email or password." };
      }

      if (!data?.user) {
        return { success: false, error: "Authentication failed. No user found." };
      }

      await fetchProfileAndSetUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to sign in" };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: "buyer" | "seller" = "buyer"
  ) => {
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim();
      const username = trimmedEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username,
            role,
            is_verified: role === "seller" ? false : true,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message || "Registration failed." };
      }

      if (!data?.user) {
        return { success: false, error: "Unable to create account. Please try again." };
      }

      // Upsert profile into public.profiles table
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          username,
          role,
          is_verified: role === "seller" ? false : true,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn("Profile sync warning:", profileErr);
      }

      await fetchProfileAndSetUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign up failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (redirectUrl: string = "/explore") => {
    setIsLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://auraminator.in";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        return { success: false, error: error.message || "Google OAuth initialization failed." };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Google sign in failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
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
        signInWithGoogle,
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
