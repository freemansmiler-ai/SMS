"use client";

import React from "react";
import { AdminMetrics } from "@/lib/services/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, UserCheck, BookOpen, BookMarked, FileCheck } from "lucide-react";

interface AdminMetricsGridProps {
  metrics: AdminMetrics | null;
  loading: boolean;
}

export const AdminMetricsGrid: React.FC<AdminMetricsGridProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Total Students",
      value: metrics.totalStudents.toLocaleString(),
      subtext: "Enrolled across all sections",
      icon: GraduationCap,
    },
    {
      title: "Total Teachers",
      value: metrics.totalTeachers.toLocaleString(),
      subtext: "Active faculty members",
      icon: UserCheck,
    },
    {
      title: "Total Classes",
      value: metrics.totalClasses.toLocaleString(),
      subtext: "Academic class sections",
      icon: BookOpen,
    },
    {
      title: "Total Subjects",
      value: metrics.totalSubjects.toLocaleString(),
      subtext: "Active curriculum subjects",
      icon: BookMarked,
    },
    {
      title: "Active Users",
      value: metrics.activeUsers.toLocaleString(),
      subtext: "Registered system profiles",
      icon: Users,
    },
    {
      title: "Pending Results",
      value: metrics.pendingResults.toLocaleString(),
      subtext: "Submissions awaiting review",
      icon: FileCheck,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Icon className="h-4 w-4 text-slate-900 dark:text-slate-100" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {item.value}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {item.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
