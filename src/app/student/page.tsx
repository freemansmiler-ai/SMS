"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentDashboardData,
  StudentDashboardData,
} from "@/lib/services/student-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Award,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RefreshCw,
  School,
  UserCheck,
  FileText,
  User,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStudentDashboardData();
      setData(res);
    } catch {
      setError("Failed to load your student profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const att = data?.attendanceSummary;

  return (
    <DashboardShell role="student" breadcrumbs={[{ label: "Student Portal Dashboard" }]}>
      <div className="space-y-5">
        {/* Welcome Banner & Student Identity */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                  {data?.studentName ? data.studentName.split(" ").map((n) => n[0]).join("") : "ST"}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700 bg-slate-800">
                      Official Student Portal
                    </Badge>
                    <span className="text-xs text-slate-300 font-mono">
                      ID: {data?.studentCode || "GES-STU"}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Welcome back, {data?.studentName || "Student"}!
                  </h1>
                  <p className="text-xs text-slate-300">
                    {data?.schoolName} • {data?.className}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 shrink-0 self-start sm:self-auto">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <div className="flex flex-col text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Session</span>
                  <span className="font-bold text-slate-200">{data?.academicYear} ({data?.currentTerm})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Isolation Notice */}
        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">
              Authenticated Student Isolation: Scoped strictly to your profile ({data?.studentCode}). Unauthorized cross-student record access is denied at database level.
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadData} className="h-7 text-xs gap-1 shrink-0 text-emerald-800 dark:text-emerald-300">
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>

        {/* Error Notice if any */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Notice</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadData} className="h-7 text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Core Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          {/* Current Academic Average */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Academic Average
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : data?.overallAverage !== null ? (
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {data?.overallAverage}%
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-500 py-1">
                  No published results yet.
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Published Term Marksheets</p>
            </CardContent>
          </Card>

          {/* Subjects with Results */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Published Results
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <Award className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {data?.subjectsWithResultsCount || 0}
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">{data?.resultStatusNotice}</p>
            </CardContent>
          </Card>

          {/* Attendance Rate */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Attendance Rate
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CalendarCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : att?.attendanceRate !== null ? (
                <div className="text-2xl font-bold tracking-tight text-emerald-600">
                  {att?.attendanceRate}%
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-500 py-1">
                  No attendance data yet.
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Roll Call Register</p>
            </CardContent>
          </Card>

          {/* Current Class */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Current Class
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <School className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-sm font-extrabold text-slate-900 dark:text-slate-50 truncate">
                  {data?.className}
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Grade Level: {data?.gradeLevel}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Portals */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span>Student Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/student/results" className="w-full">
              <Button variant="outline" size="sm" className="w-full h-10 text-xs gap-2 font-semibold justify-between border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span>My Results</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>

            <Link href="/student/attendance" className="w-full">
              <Button variant="outline" size="sm" className="w-full h-10 text-xs gap-2 font-semibold justify-between border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-600" />
                  <span>My Attendance</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>

            <Link href="/student/teachers" className="w-full">
              <Button variant="outline" size="sm" className="w-full h-10 text-xs gap-2 font-semibold justify-between border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span>My Teachers</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>

            <Link href="/student/profile" className="w-full">
              <Button variant="outline" size="sm" className="w-full h-10 text-xs gap-2 font-semibold justify-between border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-600" />
                  <span>My Profile</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Basic Attendance & Published Results Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Basic Attendance Summary */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-slate-500" />
                <span>Attendance Summary</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Roll call summary for the active term session.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Present</span>
                  <span className="text-lg font-extrabold text-emerald-600">{att?.presentCount || 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Late</span>
                  <span className="text-lg font-extrabold text-amber-600">{att?.lateCount || 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Absent</span>
                  <span className="text-lg font-extrabold text-rose-600">{att?.absentCount || 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Excused</span>
                  <span className="text-lg font-extrabold text-blue-600">{att?.excusedCount || 0}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Recorded Roll Call Sessions:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{att?.totalSessions || 0} Days</span>
              </div>
            </CardContent>
          </Card>

          {/* Published Results Table (Official Published Marksheets ONLY) */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-500" />
                <span>My Published Term Results</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Official published subject results approved by the Principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : !data?.publishedResults || data.publishedResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No published results yet. Marksheets will appear here once officially published by the Principal.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.publishedResults.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          {r.subjectCode}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {r.subjectName}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {r.totalScore} / 100
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="font-bold text-xs">
                            {r.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium text-slate-500">
                          {r.remarks}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
