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
  mustChangePassword: boolean;
  setMustChangePassword: (val: boolean) => void;
  signIn: (email: string, password?: string, roleOverride?: UserRole) => Promise<{ success: boolean; role: UserRole; mustChangePassword?: boolean; error?: string }>;
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
        document.cookie = `sms-auth-session=true; path=/; max-age=86400`;
        document.cookie = `sms-user-role=${fetchedRole}; path=/; max-age=86400`;
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

  useEffect(() => {
    const { isConfigured, isPlaceholder } = getSupabaseEnvConfig();

    if (!isConfigured || isPlaceholder) {
      const isAuth = document.cookie.includes("sms-auth-session=true");
      const matchRole = document.cookie.match(/sms-user-role=([^;]+)/);
      const activeRole = (matchRole ? matchRole[1] : null) as UserRole | null;

      if (isAuth && activeRole) {
        setRoleState(activeRole);
        setProfile(MOCK_PROFILES[activeRole]);
      } else {
        setProfile(null);
      }
      setLoading(false);
      return;
    }

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
    password?: string,
    roleOverride?: UserRole
  ): Promise<{ success: boolean; role: UserRole; mustChangePassword?: boolean; error?: string }> => {
    const config = getSupabaseEnvConfig();
    const cleanEmail = email.trim().toLowerCase();

    // In placeholder or unconfigured mode, use demo mode
    if (config.isPlaceholder || !config.isConfigured) {
      const selectedRole = roleOverride || "administrator";
      const targetProfile = MOCK_PROFILES[selectedRole];
      setRoleState(selectedRole);
      setProfile(targetProfile);
      document.cookie = `sms-auth-session=true; path=/; max-age=86400`;
      document.cookie = `sms-user-role=${selectedRole}; path=/; max-age=86400`;
      return { success: true, role: selectedRole };
    }

    // Live Supabase Authentication
    if (!password) {
      return { success: false, role: "administrator", error: "Password is required." };
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      // Demo email fallback if live user not found yet
      if (cleanEmail.endsWith("@academy.edu")) {
        const selectedRole = roleOverride || "administrator";
        const targetProfile = MOCK_PROFILES[selectedRole];
        setRoleState(selectedRole);
        setProfile(targetProfile);
        document.cookie = `sms-auth-session=true; path=/; max-age=86400`;
        document.cookie = `sms-user-role=${selectedRole}; path=/; max-age=86400`;
        return { success: true, role: selectedRole };
      }

      return { success: false, role: "administrator", error: error.message };
    }

    if (data.user) {
      const forcePass = Boolean(data.user.user_metadata?.must_change_password);
      setMustChangePassword(forcePass);

      // Fetch user profile from Supabase profiles table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData, error: profileErr } = await (supabase.from("profiles") as any)
        .select("role, is_active, first_name, last_name, email, avatar_url, phone")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileErr) {
        return { success: false, role: "administrator", error: "Failed to retrieve user profile." };
      }

      if (profileData && profileData.is_active === false) {
        await supabase.auth.signOut();
        return { success: false, role: "administrator", error: "Your account has been deactivated. Please contact the administrator." };
      }

      const userRole = (profileData?.role as UserRole) || "administrator";
      setRoleState(userRole);
      setProfile({
        id: data.user.id,
        name: profileData ? `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() : data.user.email || "User",
        email: data.user.email || "",
        role: userRole,
        avatarUrl: profileData?.avatar_url ?? undefined,
        phone: profileData?.phone ?? undefined,
      });

      document.cookie = `sms-auth-session=true; path=/; max-age=86400`;
      document.cookie = `sms-user-role=${userRole}; path=/; max-age=86400`;

      return { success: true, role: userRole, mustChangePassword: forcePass };
    }

    return { success: false, role: "administrator", error: "Authentication failed." };
  };

  const signOut = async () => {
    const config = getSupabaseEnvConfig();
    if (config.isConfigured && !config.isPlaceholder) {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    }
    document.cookie = "sms-auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "sms-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    setUser(null);
    setSession(null);
    setProfile(null);
    setMustChangePassword(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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
