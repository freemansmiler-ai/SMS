"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/role-context";
import { useAuth } from "@/context/auth-context";
import { ROLE_LABELS } from "@/constants/navigation";
import { fetchAnnouncements, AnnouncementItem } from "@/lib/services/announcements";
import { Skeleton } from "@/components/ui/skeleton";

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
  Megaphone,
} from "lucide-react";

// ---------------------------------------------------------------------------
// localStorage key helpers — keyed per role so role-switches get fresh dots
// ---------------------------------------------------------------------------
const seenKey = (role: string) => `sms_bell_seen_ids_${role}`;

function getSeenIds(role: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(seenKey(role));
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistSeenIds(role: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(seenKey(role), JSON.stringify([...ids]));
  } catch {
    // quota exceeded or private-browsing restriction — ignore
  }
}

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
  const { signOut, user } = useAuth();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingAnn, setLoadingAnn] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  // Track which role's data is currently cached so a role switch invalidates it
  const cachedRole = useRef<string | null>(null);
  // Unread = announcements not yet seen (ids not in localStorage)
  const [unreadCount, setUnreadCount] = useState(0);

  // Map activeRole → the audience filter the service understands
  const audienceFilter =
    activeRole === "administrator" || activeRole === "principal"
      ? undefined       // admins / principals see every published announcement
      : activeRole === "teacher"
      ? "teacher"
      : "student";

  // Recompute unread count whenever the announcement list or role changes
  const refreshUnread = useCallback(
    (items: AnnouncementItem[]) => {
      const seen = getSeenIds(activeRole);
      const count = items.filter((a) => !seen.has(a.id)).length;
      setUnreadCount(count);
    },
    [activeRole]
  );

  // Fetch (or re-fetch) announcements for the current role
  const loadAnnouncements = useCallback(async () => {
    setLoadingAnn(true);
    try {
      const data = await fetchAnnouncements({ role: audienceFilter });
      const slice = data.slice(0, 5);
      cachedRole.current = activeRole;
      setAnnouncements(slice);
      refreshUnread(slice);
    } finally {
      setLoadingAnn(false);
    }
  }, [activeRole, audienceFilter, refreshUnread]);

  // When the bell opens: always re-fetch fresh data
  useEffect(() => {
    if (!notiOpen) return;
    loadAnnouncements();
  }, [notiOpen, loadAnnouncements]);

  // When the role changes between opens, invalidate the cache so the dot
  // and list reflect the new role immediately even before the next open.
  useEffect(() => {
    if (cachedRole.current !== null && cachedRole.current !== activeRole) {
      setAnnouncements([]);
      cachedRole.current = null;
      setUnreadCount(0);
    }
  }, [activeRole]);

  // Mark all currently visible announcements as seen when the dropdown opens
  useEffect(() => {
    if (!notiOpen || announcements.length === 0) return;
    const seen = getSeenIds(activeRole);
    let changed = false;
    for (const a of announcements) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        changed = true;
      }
    }
    if (changed) {
      persistSeenIds(activeRole, seen);
      setUnreadCount(0);
    }
  }, [notiOpen, announcements, activeRole]);

  // Announcement page path per role
  const announcementsHref =
    activeRole === "student"
      ? "/student/announcements"
      : activeRole === "teacher"
      ? "/teacher/announcements"
      : activeRole === "principal"
      ? "/principal/announcements"
      : "/admin/announcements";

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

      {/* Right section */}
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

        {/* Notifications Bell — real announcements per role */}
        <DropdownMenu open={notiOpen} onOpenChange={setNotiOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 shrink-0"
            >
              <Bell className="h-4 w-4" />
              {/* Unread dot — shown only when there are unseen announcements */}
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Megaphone className="h-3.5 w-3.5 text-slate-500" />
                School Announcements
              </span>
              {announcements.length > 0 && !loadingAnn && (
                <Badge variant="secondary" className="text-[9px]">
                  {announcements.length} Notice{announcements.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <DropdownMenuSeparator />

            {/* Loading skeleton while fetch is in flight */}
            {loadingAnn ? (
              <div className="space-y-2 my-2 px-1">
                <Skeleton className="h-14 w-full rounded-md" />
                <Skeleton className="h-14 w-full rounded-md" />
                <Skeleton className="h-14 w-full rounded-md" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-4 text-center text-[11px] text-slate-500">
                No active announcements at this time.
              </div>
            ) : (
              <div className="space-y-1 my-1 max-h-72 overflow-y-auto">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-2.5 text-[11px] rounded-md bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={() => {
                      router.push(announcementsHref);
                      setNotiOpen(false);
                    }}
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {ann.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{ann.date}</p>
                  </div>
                ))}
              </div>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push(announcementsHref);
                setNotiOpen(false);
              }}
              className="justify-center text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              View all announcements →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 gap-2 pl-1 pr-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-slate-100 text-slate-800 font-semibold text-[10px] dark:bg-slate-800 dark:text-slate-200">
                  {activeProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
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
              onClick={() => {
                const basePath =
                  activeRole === "administrator" ? "/admin" : `/${activeRole}`;
                router.push(`${basePath}/profile`);
              }}
              className="gap-2 text-xs cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const basePath =
                  activeRole === "administrator" ? "/admin" : `/${activeRole}`;
                router.push(`${basePath}/profile`);
              }}
              className="gap-2 text-xs cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs cursor-pointer">
              <Database className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Database Status ({user ? "Connected" : "Ready"})
              </span>
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
