"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnnouncements, AnnouncementItem } from "@/lib/services/announcements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone, UserCheck, RefreshCw } from "lucide-react";

export default function TeacherAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    // Fetch announcements for teacher role — returns 'all' and 'teachers' targeted notices
    const data = await fetchAnnouncements({ role: "teacher" });
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[
        { label: "Teacher Dashboard", href: "/teacher" },
        { label: "Announcements" },
      ]}
    >
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Staff Notice Board</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official school announcements, staff notices, and academic updates for faculty.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-8 text-xs gap-1 shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>

        {/* Announcement count summary */}
        {!loading && items.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{items.length}</span>
            active notice{items.length !== 1 ? "s" : ""} on the staff board
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Active Notices"
              description="There are no active notices posted for faculty staff at this time."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="border-slate-200/80 dark:border-slate-800">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </CardTitle>
                      <Badge
                        variant={
                          item.targetAudience === "Entire School"
                            ? "default"
                            : item.targetAudience === "Teachers"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {item.targetAudience}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                        <UserCheck className="h-3 w-3" />
                        {item.author} ({item.authorRole})
                      </span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.content}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
