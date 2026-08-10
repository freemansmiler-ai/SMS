"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase";
import { getSupabaseEnvConfig } from "@/lib/supabase/config";
import { UserRole, UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  mustChangePassword: boolean;
  setMustChangePassword: (val: boolean) => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; role: UserRole; mustChangePassword?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRoleState] = useState<UserRole>("administrator");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const supabase = createBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("profiles") as any)
        .select("id, first_name, last_name, email, role, avatar_url, phone, is_active")
        .eq("id", userId)
        .single();

      if (!error && data) {
        if (data.is_active === false) {
          await signOut();
          return;
        }
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
      // Profile fetch fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const forcePass = Boolean(session.user.user_metadata?.must_change_password);
        setMustChangePassword(forcePass);
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const forcePass = Boolean(session.user.user_metadata?.must_change_password);
          setMustChangePassword(forcePass);
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setMustChangePassword(false);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; role: UserRole; mustChangePassword?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!password) {
      return { success: false, role: "administrator", error: "Password is required." };
    }

    const { isPlaceholder } = getSupabaseEnvConfig();

    if (isPlaceholder) {
      const userRole: UserRole = cleanEmail.includes("principal")
        ? "principal"
        : cleanEmail.includes("teacher")
        ? "teacher"
        : cleanEmail.includes("student")
        ? "student"
        : "administrator";

      setRoleState(userRole);
      setProfile({
        id: "admin-demo-id",
        name: "System Administrator",
        email: cleanEmail,
        role: userRole,
      });

      return { success: true, role: userRole, mustChangePassword: false };
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { success: false, role: "administrator", error: error.message };
    }

    if (data.user) {
      const forcePass = Boolean(data.user.user_metadata?.must_change_password);
      setMustChangePassword(forcePass);

      // Fetch user profile from Supabase profiles table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData } = await (supabase.from("profiles") as any)
        .select("role, is_active, first_name, last_name, email, avatar_url, phone")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileData && profileData.is_active === false) {
        await supabase.auth.signOut();
        return { success: false, role: "administrator", error: "Your account has been deactivated. Please contact the administrator." };
      }

      const userRole = (profileData?.role || data.user.user_metadata?.role || "administrator") as UserRole;
      const firstName = profileData?.first_name || data.user.user_metadata?.first_name || "System";
      const lastName = profileData?.last_name || data.user.user_metadata?.last_name || "Administrator";

      setRoleState(userRole);
      setProfile({
        id: data.user.id,
        name: `${firstName} ${lastName}`.trim(),
        email: data.user.email || cleanEmail,
        role: userRole,
        avatarUrl: profileData?.avatar_url ?? undefined,
        phone: profileData?.phone ?? undefined,
      });

      return { success: true, role: userRole, mustChangePassword: forcePass };
    }

    return { success: false, role: "administrator", error: "Authentication failed." };
  };

  const signOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setMustChangePassword(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const resetPassword = async (email: string) => {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
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
        mustChangePassword,
        setMustChangePassword,
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
