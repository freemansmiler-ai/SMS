"use client";

import React from "react";
import { useRole } from "@/context/role-context";
import { UserRole, DashboardMetric } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const METRICS_BY_ROLE: Record<UserRole, DashboardMetric[]> = {
  administrator: [
    {
      id: "m1",
      title: "Total Registered Users",
      value: "1,248",
      change: "+12% this month",
      changeType: "increase",
      icon: "Users",
    },
    {
      id: "m2",
      title: "Active Database Tables",
      value: "18",
      change: "PostgreSQL Ready",
      changeType: "neutral",
      icon: "Database",
    },
    {
      id: "m3",
      title: "System Uptime",
      value: "99.98%",
      change: "+0.02% optimal",
      changeType: "increase",
      icon: "Activity",
    },
    {
      id: "m4",
      title: "Role Security Policy",
      value: "4 Active Roles",
      change: "RBAC Enforced",
      changeType: "neutral",
      icon: "ShieldCheck",
    },
  ],
  principal: [
    {
      id: "p1",
      title: "Enrolled Students",
      value: "1,120",
      change: "+4.5% vs last term",
      changeType: "increase",
      icon: "GraduationCap",
    },
    {
      id: "p2",
      title: "Faculty Members",
      value: "84",
      change: "Full staff capacity",
      changeType: "neutral",
      icon: "UserCheck",
    },
    {
      id: "p3",
      title: "School Attendance Rate",
      value: "95.4%",
      change: "+1.2% this week",
      changeType: "increase",
      icon: "CalendarCheck",
    },
    {
      id: "p4",
      title: "Academic Performance Index",
      value: "3.68 GPA",
      change: "Above target avg",
      changeType: "increase",
      icon: "Award",
    },
  ],
  teacher: [
    {
      id: "t1",
      title: "Assigned Class Sections",
      value: "4 Sections",
      change: "142 Enrolled Students",
      changeType: "neutral",
      icon: "BookOpen",
    },
    {
      id: "t2",
      title: "Today's Attendance Rate",
      value: "96.2%",
      change: "+2% vs yesterday",
      changeType: "increase",
      icon: "UserCheck",
    },
    {
      id: "t3",
      title: "Average Grade",
      value: "87.4%",
      change: "On schedule",
      changeType: "increase",
      icon: "Award",
    },
    {
      id: "t4",
      title: "Submissions Pending",
      value: "14 Items",
      change: "Due in 2 days",
      changeType: "neutral",
      icon: "FileText",
    },
  ],
  student: [
    {
      id: "s1",
      title: "Enrolled Courses",
      value: "6 Subjects",
      change: "Fall 2026",
      changeType: "neutral",
      icon: "BookMarked",
    },
    {
      id: "s2",
      title: "Personal Attendance",
      value: "98.5%",
      change: "Good standing",
      changeType: "increase",
      icon: "CalendarCheck",
    },
    {
      id: "s3",
      title: "Cumulative Grade Point",
      value: "3.85 GPA",
      change: "Honor Roll",
      changeType: "increase",
      icon: "Award",
    },
    {
      id: "s4",
      title: "Assignments Due",
      value: "3 Tasks",
      change: "Next due Friday",
      changeType: "neutral",
      icon: "Clock",
    },
  ],
};

export const MetricsGrid: React.FC = () => {
  const { activeRole } = useRole();
  const metrics = METRICS_BY_ROLE[activeRole] || [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {metric.title}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <DynamicIcon name={metric.icon} className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-1">
            <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {metric.value}
            </div>
            {metric.change && (
              <div className="flex items-center gap-1 text-[11px]">
                {metric.changeType === "increase" && (
                  <TrendingUp className="h-3 w-3 text-slate-700 dark:text-slate-300" />
                )}
                {metric.changeType === "decrease" && (
                  <TrendingDown className="h-3 w-3 text-slate-700 dark:text-slate-300" />
                )}
                {metric.changeType === "neutral" && (
                  <Minus className="h-3 w-3 text-slate-400" />
                )}
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {metric.change}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
