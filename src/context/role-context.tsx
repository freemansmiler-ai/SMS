"use client";

import React, { createContext, useContext, useState } from "react";
import { UserRole, UserProfile } from "@/types";
import { MOCK_PROFILES } from "@/constants/navigation";
import { useAuth } from "@/context/auth-context";

interface RoleContextType {
  activeRole: UserRole;
  activeProfile: UserProfile;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [overrideRole, setOverrideRole] = useState<UserRole | null>(null);

  const activeRole: UserRole = overrideRole || auth.role || "administrator";
  const activeProfile: UserProfile = auth.profile || MOCK_PROFILES[activeRole];

  const handleSetRole = (role: UserRole) => {
    setOverrideRole(role);
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        activeProfile,
        setRole: handleSetRole,
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
