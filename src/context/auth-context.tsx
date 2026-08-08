"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { UserRole, UserProfile } from "@/types";
import { MOCK_PROFILES } from "@/constants/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password?: string, roleOverride?: UserRole) => Promise<{ success: boolean; role: UserRole; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRoleState] = useState<UserRole>("administrator");
  const [profile, setProfile] = useState<UserProfile | null>(MOCK_PROFILES["administrator"]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { isConfigured } = getSupabaseEnvConfig();

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const supabase = createBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("profiles") as any)
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        const fetchedRole = data.role as UserRole;
        setRoleState(fetchedRole);
        setProfile({
          id: data.id,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email,
          email: data.email,
          role: fetchedRole,
          avatarUrl: data.avatar_url ?? undefined,
          phone: data.phone ?? undefined,
        });
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password?: string,
    roleOverride?: UserRole
  ): Promise<{ success: boolean; role: UserRole; error?: string }> => {
    const config = getSupabaseEnvConfig();

    if (config.isPlaceholder || !config.isConfigured || !password) {
      const selectedRole = roleOverride || "administrator";
      const targetProfile = MOCK_PROFILES[selectedRole];
      setRoleState(selectedRole);
      setProfile(targetProfile);
      return { success: true, role: selectedRole };
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, role: "administrator", error: error.message };
    }

    if (data.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData } = await (supabase.from("profiles") as any)
        .select("role")
        .eq("id", data.user.id)
        .single();

      const userRole = (profileData?.role as UserRole) || "administrator";
      setRoleState(userRole);
      return { success: true, role: userRole };
    }

    return { success: false, role: "administrator", error: "Authentication failed" };
  };

  const signOut = async () => {
    const config = getSupabaseEnvConfig();
    if (config.isConfigured && !config.isPlaceholder) {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const config = getSupabaseEnvConfig();
    if (config.isConfigured && !config.isPlaceholder) {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
