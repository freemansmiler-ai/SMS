"use client";

import React from "react";
import { PrincipalMetrics } from "@/lib/services/principal-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, UserCheck, BookOpen, TrendingUp, Award, CalendarCheck, FileCheck } from "lucide-react";

interface PrincipalMetricsGridProps {
  metrics: PrincipalMetrics | null;
  loading: boolean;
}

export const PrincipalMetricsGrid: React.FC<PrincipalMetricsGridProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Skeleton className="h-8 w-20" />
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
      subtext: "Enrolled in school roster",
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
      subtext: "Basic & SHS sections",
      icon: BookOpen,
    },
    {
      title: "School Average",
      value: `${metrics.overallSchoolAverage.toFixed(1)}%`,
      subtext: "Across all subjects",
      icon: TrendingUp,
    },
    {
      title: "Overall Pass Rate",
      value: `${metrics.overallPassRate.toFixed(1)}%`,
      subtext: "WAEC Pass (A1 - E8)",
      icon: Award,
    },
    {
      title: "Attendance Rate",
      value: `${metrics.attendanceRate.toFixed(1)}%`,
      subtext: "Term 1 Average",
      icon: CalendarCheck,
    },
    {
      title: "Pending Approvals",
      value: metrics.pendingResultApprovals.toString(),
      subtext: "Submitted marksheets",
      icon: FileCheck,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {item.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{item.subtext}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
