"use client";

import React, { createContext, useContext } from "react";
import { UserRole, UserProfile } from "@/types";
import { useAuth } from "@/context/auth-context";

interface RoleContextType {
  activeRole: UserRole;
  activeProfile: UserProfile;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  const activeRole: UserRole = auth.profile?.role || auth.role || "administrator";
  const activeProfile: UserProfile = auth.profile || {
    id: auth.user?.id || "usr_user_01",
    name: auth.user?.email || "User",
    email: auth.user?.email || "",
    role: activeRole,
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        activeProfile,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
