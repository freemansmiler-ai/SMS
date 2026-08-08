"use client";

import React, { useEffect, useState } from "react";
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
  Megaphone,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RefreshCw,
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

  return (
    <DashboardShell role="student" breadcrumbs={[{ label: "Student Dashboard" }]}>
      <div className="space-y-5">
        {/* Welcome Student Banner */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700 bg-slate-800">
                    Student Portal
                  </Badge>
                  <span className="text-xs text-slate-300 font-mono">
                    ID: {data?.studentId || "GES-STU"}
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Welcome back, {data?.studentName || "Student"}!
                </h1>
                <p className="text-xs text-slate-300">
                  {data?.className} • {data?.academicYear} ({data?.currentTerm})
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 shrink-0">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <div className="flex flex-col text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Calendar</span>
                  <span className="font-bold text-slate-200">{data?.currentTerm} ({data?.academicYear})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Isolation Notice */}
        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            Personal Security Enforced: You are viewing your authenticated student portal. Accessing other student records is strictly blocked at the database engine level.
          </span>
        </div>

        {/* Error Alert */}
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

        {/* Core Student Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Overall Average */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Overall Average
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {data?.overallAverage.toFixed(1)}%
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Term 1 Published Subjects</p>
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
              ) : (
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {data?.attendanceRate.toFixed(1)}%
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Present days in Term 1</p>
            </CardContent>
          </Card>

          {/* Latest Published Result */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Latest Published Result
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <Award className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : data?.latestPublishedResult ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {data.latestPublishedResult.subjectName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Score: {data.latestPublishedResult.totalScore} / 100
                    </span>
                  </div>
                  <Badge variant="success" className="font-bold text-xs">
                    {data.latestPublishedResult.grade}
                  </Badge>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No published results yet</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Two-column layout for Published Results and Campus Announcements */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Published Results Card */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span>My Published Term Results</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Official marksheet grades approved and published by the Headmaster.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : !data?.publishedResults || data.publishedResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No results published for the current term yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class (30)</TableHead>
                      <TableHead>Project (20)</TableHead>
                      <TableHead>Exam (50)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.publishedResults.map((r, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {r.subjectName}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{r.classScore}</TableCell>
                        <TableCell className="text-xs font-medium">{r.projectScore}</TableCell>
                        <TableCell className="text-xs font-medium">{r.examScore}</TableCell>
                        <TableCell className="text-xs font-bold">{r.totalScore}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="success" className="font-bold text-xs">
                            {r.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Campus Announcements */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span>School Notice Board</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Official announcements and academic notices.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !data?.announcements || data.announcements.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-4">
                  No active notices on the school board.
                </div>
              ) : (
                data.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {ann.title}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {ann.date}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
