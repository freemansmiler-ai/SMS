"use client";

import React from "react";
import Link from "next/link";
import { TeacherMetrics } from "@/lib/services/teacher-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookMarked, BookOpen, Users, FileClock, CheckCircle2, Clock, CalendarCheck } from "lucide-react";

interface TeacherMetricsGridProps {
  metrics: TeacherMetrics | null;
  loading: boolean;
}

export const TeacherMetricsGrid: React.FC<TeacherMetricsGridProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Assigned Subjects Card */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            My Subjects
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <BookMarked className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {metrics.totalSubjects}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Assigned curriculum subjects</p>
        </CardContent>
      </Card>

      {/* Assigned Classes Card */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            My Classes
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            <BookOpen className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {metrics.totalClasses}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Basic / SHS class sections</p>
        </CardContent>
      </Card>

      {/* Number of Assigned Students */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Assigned Students
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {metrics.totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Enrolled in my sections</p>
        </CardContent>
      </Card>

      {/* Attendance & Pending Marksheet Status */}
      <Card className="border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daily Attendance
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <FileClock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="flex items-center justify-between">
            {metrics.attendanceSubmittedToday ? (
              <Badge variant="success" className="text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Today's Roll Call Submitted</span>
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[10px] gap-1">
                <Clock className="h-3 w-3" />
                <span>Attendance Pending</span>
              </Badge>
            )}
          </div>
          <Button asChild size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5 font-semibold">
            <Link href="/teacher/attendance">
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Take / View Attendance</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
