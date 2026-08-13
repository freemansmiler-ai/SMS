"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchAnnouncements,
  deleteAnnouncement,
  AnnouncementItem,
} from "@/lib/services/announcements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateAnnouncementModal } from "@/components/announcements/create-announcement-modal";
import { Megaphone, Plus, Trash2, Filter, RefreshCw, UserCheck } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAnnouncements();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this official announcement?")) {
      await deleteAnnouncement(id);
      loadData();
    }
  };

  const filteredItems =
    audienceFilter === "all"
      ? items
      : items.filter((i) => i.targetAudience === audienceFilter);

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Admin Dashboard", href: "/admin" },
        { label: "Announcements" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>School Announcement System</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compose and broadcast official notices to teachers, students, or the entire school.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Broadcast Notice</span>
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Audience:
            </span>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Audiences</option>
              <option value="Entire School">Entire School</option>
              <option value="Teachers">Teachers Only</option>
              <option value="Students">Students Only</option>
              <option value="Specific Classes">Specific Classes</option>
            </select>
          </CardContent>
        </Card>

        {/* Announcement List */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Announcements Found"
              description="No official notices match the selected target audience filter."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
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
                            ? "outline"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        Target: {item.targetAudience}
                        {item.targetClassName ? ` (${item.targetClassName})` : ""}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                        <UserCheck className="h-3 w-3" />
                        {item.author} ({item.authorRole})
                      </span>
                      <span>•</span>
                      <span>Published {item.date}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                    title="Delete announcement"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>

                <CardContent className="p-4 pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.content}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <CreateAnnouncementModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={loadData}
      />
    </DashboardShell>
  );
}
