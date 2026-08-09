"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchPrincipalDashboardOverview,
  PrincipalDashboardOverview,
} from "@/lib/services/principal-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GraduationCap,
  UserCheck,
  School,
  BookOpen,
  Calendar,
  Sparkles,
  AlertCircle,
  BarChart3,
  Award,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";

export default function PrincipalDashboardPage() {
  const [overview, setOverview] = useState<PrincipalDashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const data = await fetchPrincipalDashboardOverview();
      setOverview(data);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardShell role="principal">
        <div className="space-y-5">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardShell>
    );
  }

  const identity = overview?.identity;
  const metrics = overview?.metrics;
  const resultStatus = overview?.resultStatus;
  const attendance = overview?.attendanceSummary;

  const hasActivePeriod = overview?.currentAcademicYear && overview.currentAcademicYear !== "No Active Academic Year";

  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[{ label: "Executive Portal" }, { label: "School Overview" }]}
    >
      <div className="space-y-5">
        {/* Header & School Identity Card */}
        <Card className="border-slate-900 bg-slate-900 text-white dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-50">
                    {identity ? `${identity.firstName} ${identity.lastName}` : "Headmaster / Principal"}
                  </h1>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Executive Oversight
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="font-bold text-slate-100">{identity?.schoolName || "Achimota Basic School"}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">Code: {identity?.schoolCode || "SCH-01"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>School Isolation Active</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700/80">
                <Calendar className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Current Period
                  </span>
                  <span className="text-xs font-bold text-slate-100">
                    {overview?.currentAcademicYear} ({overview?.currentTerm})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning if no active period */}
        {!hasActivePeriod && (
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold">Academic Calendar Warning</AlertTitle>
            <AlertDescription className="text-xs">
              No active academic year or term configured. Please contact the School Administrator to set up the current session.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Students</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {metrics?.totalStudents || 0}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {metrics?.activeStudents || 0} Active Enrollment
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <GraduationCap className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Faculty</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {metrics?.totalTeachers || 0}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {metrics?.activeTeachers || 0} Active Teachers
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Active Classes</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {metrics?.totalClasses || 0}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Class Divisions</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <School className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Curriculum Subjects</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {metrics?.totalSubjects || 0}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {metrics?.assignedSubjectsCount || 0} Assigned to Faculty
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Overviews (Attendance & Results Status) */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Attendance Overview */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-slate-500" />
                <span>Attendance Summary ({overview?.currentTerm})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Aggregate roll call status across all school class sections.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900">
                  <span className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Present</span>
                  <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300">{attendance?.presentCount || 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900">
                  <span className="block text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Late</span>
                  <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300">{attendance?.lateCount || 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900">
                  <span className="block text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">Absent</span>
                  <span className="text-lg font-extrabold text-rose-800 dark:text-rose-300">{attendance?.absentCount || 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900">
                  <span className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">Excused</span>
                  <span className="text-lg font-extrabold text-blue-800 dark:text-blue-300">{attendance?.excusedCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Submission Status Overview */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-500" />
                <span>Results Lifecycle Overview</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Current status of marksheet submissions awaiting executive review and publication.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Link href="/principal/approvals?status=draft" className="p-2 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700 transition-colors">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Drafts</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">{resultStatus?.draftCount || 0}</span>
                </Link>
                <Link href="/principal/approvals?status=submitted" className="p-2 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800 transition-colors">
                  <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Submitted</span>
                  <span className="text-base font-bold text-amber-800 dark:text-amber-300">{resultStatus?.submittedCount || 0}</span>
                </Link>
                <Link href="/principal/approvals?status=under_review" className="p-2 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800 transition-colors">
                  <span className="block text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">Under Review</span>
                  <span className="text-base font-bold text-blue-800 dark:text-blue-300">{resultStatus?.underReviewCount || 0}</span>
                </Link>
                <Link href="/principal/approvals?status=returned" className="p-2 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-800 transition-colors">
                  <span className="block text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Returned</span>
                  <span className="text-base font-bold text-rose-800 dark:text-rose-300">{resultStatus?.returnedCount || 0}</span>
                </Link>
                <Link href="/principal/approvals?status=approved" className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800 transition-colors">
                  <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Approved</span>
                  <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">{resultStatus?.approvedCount || 0}</span>
                </Link>
                <Link href="/principal/approvals?status=published" className="p-2 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 border border-emerald-300 dark:border-emerald-700 transition-colors">
                  <span className="block text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">Published</span>
                  <span className="text-base font-bold text-emerald-900 dark:text-emerald-200">{resultStatus?.publishedCount || 0}</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Occupancy Breakdown Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <span>Class Section Enrollment & Capacity Breakdown</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live student enrollment count vs maximum seating capacity for active class divisions.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {overview?.classOccupancy.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No active class sections registered in your school.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Section</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Enrolled Students</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Available Spaces</TableHead>
                      <TableHead>Occupancy Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview?.classOccupancy.map((cls) => {
                      const ratio = Math.min(100, Math.round((cls.enrolledCount / cls.capacity) * 100));
                      return (
                        <TableRow key={cls.classId}>
                          <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {cls.className}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {cls.gradeLevel}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                            {cls.enrolledCount}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">
                            {cls.capacity}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {cls.availableSpaces}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${ratio >= 90 ? "bg-rose-500" : ratio >= 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                                  style={{ width: `${ratio}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                                {ratio}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
