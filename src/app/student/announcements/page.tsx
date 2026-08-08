"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnnouncements, AnnouncementItem } from "@/lib/services/announcements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Megaphone, UserCheck, Bell } from "lucide-react";

export default function StudentAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Strictly fetch announcements relevant to student role and Basic 8 class
      const data = await fetchAnnouncements({ role: "student", classId: "class-basic8a" });
      setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Dashboard", href: "/student" },
        { label: "Announcements" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>School Notice Board</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official announcements, academic schedules, and campus notices.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Active Notices"
              description="There are no active notices posted on the student board currently."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="border-slate-200/80 dark:border-slate-800">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px]">
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
