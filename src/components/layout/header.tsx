"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/role-context";
import { useAuth } from "@/context/auth-context";
import { ROLE_LABELS } from "@/constants/navigation";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Database,
  Calendar,
} from "lucide-react";
import { getSupabaseEnvConfig } from "@/lib/supabase/config";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  customBreadcrumbs?: { label: string; href?: string }[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  customBreadcrumbs,
}) => {
  const router = useRouter();
  const { activeProfile, activeRole } = useRole();
  const { signOut } = useAuth();
  const supabaseConfig = getSupabaseEnvConfig();

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      {/* Left section: Mobile Toggle & Breadcrumb Area */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileSidebar}
          className="lg:hidden h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 shrink-0"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle Mobile Navigation</span>
        </Button>

        {/* Breadcrumb Navigation Area */}
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Overview</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {customBreadcrumbs ? (
              customBreadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <BreadcrumbItem>
                    {b.href ? (
                      <BreadcrumbLink href={b.href}>{b.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{b.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {i < customBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                  {ROLE_LABELS[activeRole].badge} Workspace
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center / Right section: Search Bar, Academic Term, Role Switcher, Notifications & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar */}
        <div className="relative w-36 sm:w-48 md:w-56">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search records..."
            className="pl-8 pr-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
          />
        </div>

        {/* Academic Term Info */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
          <Calendar className="h-3 w-3 text-slate-500" />
          <span>2026/2027 Term 1</span>
        </div>

        {/* Role Switcher */}
        <RoleSwitcher />

        {/* Notifications Area */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 shrink-0"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">
                Notifications
              </span>
              <Badge variant="secondary" className="text-[9px]">
                2 New
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-1 my-1">
              <div className="p-2 text-[11px] rounded-md bg-slate-50 dark:bg-slate-800/60">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Academic Calendar Sync
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Fall term schedule active.
                </p>
              </div>
              <div className="p-2 text-[11px] rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Supabase Layer Ready
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  PostgreSQL schema prepared.
                </p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Area */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 gap-2 pl-1 pr-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-slate-100 text-slate-800 font-semibold text-[10px] dark:bg-slate-800 dark:text-slate-200">
                  {activeProfile.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block font-medium text-xs text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                {activeProfile.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold leading-none text-slate-900 dark:text-white">
                  {activeProfile.name}
                </p>
                <p className="text-[10px] leading-none text-slate-500">
                  {activeProfile.email}
                </p>
                <div className="pt-1">
                  <Badge variant="outline" className="text-[9px]">
                    {ROLE_LABELS[activeRole].title}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/${activeRole}/profile`)}
              className="gap-2 text-xs cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/${activeRole}/profile`)}
              className="gap-2 text-xs cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs cursor-pointer">
              <Database className="h-3.5 w-3.5 text-slate-500" />
              <span>Database Status ({supabaseConfig.isConfigured ? "Connected" : "Ready"})</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="gap-2 text-xs text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
