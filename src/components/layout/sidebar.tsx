"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/role-context";
import { useAuth } from "@/context/auth-context";
import { NAVIGATION_BY_ROLE, ROLE_LABELS } from "@/constants/navigation";
import { NavSection, UserRole } from "@/types";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { School, PanelLeftClose, PanelLeft, LogOut } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  customNavSections?: NavSection[];
  roleOverride?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  customNavSections,
  roleOverride,
}) => {
  const pathname = usePathname();
  const { activeRole, activeProfile } = useRole();
  const { signOut } = useAuth();

  const currentRole = roleOverride || activeRole;
  const navSections = customNavSections || NAVIGATION_BY_ROLE[currentRole] || [];

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200/80 bg-white shadow-2xs transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 select-none",
          collapsed ? "w-16" : "w-60",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* School Branding Header */}
        <div className="flex h-14 items-center justify-between px-3 border-b border-slate-100 dark:border-slate-800">
          <Link
            href={
              currentRole === "administrator"
                ? "/admin"
                : currentRole === "principal"
                ? "/principal"
                : currentRole === "teacher"
                ? "/teacher"
                : currentRole === "student"
                ? "/student"
                : "/admin"
            }
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
              <School className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  Codivex Academy
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  School Platform
                </span>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </h4>
              )}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  const linkContent = (
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                        isActive
                          ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200",
                        collapsed && "justify-center px-0 h-9 w-9 mx-auto"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-900 dark:bg-slate-100 rounded-r-full" />
                      )}
                      <DynamicIcon
                        name={item.icon}
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-slate-900 dark:text-slate-50"
                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate flex-1">{item.title}</span>
                      )}
                      {!collapsed && item.badge && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                          {item.badge ? ` (${item.badge})` : ""}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.title}>{linkContent}</React.Fragment>;
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Role Card at Sidebar Bottom */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] dark:bg-slate-700 dark:text-slate-200 shrink-0">
                  {activeProfile.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                    {activeProfile.name}
                  </span>
                  <div className="mt-0.5">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-slate-200 dark:border-slate-700">
                      {ROLE_LABELS[currentRole].badge}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-7 w-7 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                title="Log out of system"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="sr-only">Log Out</span>
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex justify-center cursor-pointer py-1"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px] dark:bg-slate-800 dark:text-slate-200 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300 transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Log Out ({activeProfile.name})
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};
