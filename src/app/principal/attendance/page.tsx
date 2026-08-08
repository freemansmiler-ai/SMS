"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchSchoolWideAttendanceAnalytics,
  SchoolAttendanceAnalytics,
} from "@/lib/services/attendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Building2,
} from "lucide-react";

export default function PrincipalAttendancePage() {
  const [data, setData] = useState<SchoolAttendanceAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetchSchoolWideAttendanceAnalytics();
      setData(res);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "Attendance Analytics" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>School-Wide Attendance Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Headmaster executive overview of daily student roll calls across all class divisions.
          </p>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                School Average
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {data?.overallAttendanceRate}%
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Term 1 Daily Roll Call Average</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Present Today
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {data?.totalStudentsPresentToday}
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Students in Class</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Absent Today
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <XCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                  {data?.totalStudentsAbsentToday}
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Unexcused Absences</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Late Arrivals
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {data?.totalStudentsLateToday}
                </div>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Arrived after roll call</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Section Breakdown Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <span>Attendance Rate by Class Division</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Daily roll call breakdown for Basic and Senior High School sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Section</TableHead>
                      <TableHead>Enrolled Students</TableHead>
                      <TableHead>Present Today</TableHead>
                      <TableHead>Absent Today</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.classBreakdown.map((item) => (
                      <TableRow key={item.classId}>
                        <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {item.className}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {item.enrolledStudents} Students
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {item.presentCount}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-red-600 dark:text-red-400">
                          {item.absentCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden max-w-[100px]">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${item.rate}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold">{item.rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={item.rate >= 95 ? "success" : "warning"}
                            className="text-[10px]"
                          >
                            {item.rate >= 95 ? "High Attendance" : "Satisfactory"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
