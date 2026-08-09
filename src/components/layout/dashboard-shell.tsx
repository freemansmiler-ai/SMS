"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RoleProvider } from "@/context/role-context";
import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ForcePasswordChangeModal } from "@/components/auth/force-password-change-modal";
import { UserRole, NavSection, UserProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DashboardShellProps {
  role?: UserRole;
  navSections?: NavSection[];
  userProfile?: UserProfile;
  breadcrumbs?: { label: string; href?: string }[];
  children: React.ReactNode;
}

const DashboardShellInner: React.FC<DashboardShellProps> = ({
  role,
  navSections,
  breadcrumbs,
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const { profile, role: activeRole, loading, mustChangePassword, setMustChangePassword } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Unauthenticated access check
      if (!profile) {
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      // Role permission check
      if (role && profile.role !== role && profile.role !== "administrator") {
        router.replace(`/${profile.role}`);
      }
    }
  }, [loading, profile, role, pathname, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 font-sans text-slate-900 antialiased dark:text-slate-100 overflow-x-hidden">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Forced Password Change Modal for Temporary Credentials */}
      <ForcePasswordChangeModal
        open={mustChangePassword}
        onSuccess={() => setMustChangePassword(false)}
      />

      {/* Reusable Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        customNavSections={navSections}
        roleOverride={role || activeRole}
      />

      {/* Main Layout Container */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-200",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-60"
        )}
      >
        {/* Top Header Navigation */}
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          customBreadcrumbs={breadcrumbs}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-5 overflow-x-hidden">
          {children}
        </main>

        {/* Reusable Dashboard Shell Footer */}
        <footer className="border-t border-slate-200/80 bg-white/50 px-6 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto text-[11px]">
            <p>© 2026 Apex Academy School Management System. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-[10px]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Protected Shell Architecture (Supabase Auth Enabled)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const DashboardShell: React.FC<DashboardShellProps> = (props) => {
  return (
    <RoleProvider>
      <DashboardShellInner {...props} />
    </RoleProvider>
  );
};
