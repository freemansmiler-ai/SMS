"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchPrincipalAttendanceAnalytics,
  PrincipalAttendanceAnalyticsOverview,
} from "@/lib/services/principal-attendance-analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
  FileText,
  Filter,
  RefreshCw,
  AlertTriangle,
  School,
  UserCheck,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

function PrincipalAttendanceContent() {
  const [overview, setOverview] = useState<PrincipalAttendanceAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPrincipalAttendanceAnalytics({
      classId: classFilter,
      teacherId: teacherFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setOverview(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [classFilter, teacherFilter, startDate, endDate]);

  if (loading) {
    return (
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
    );
  }

  const metrics = overview?.metrics;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>School Attendance Analytics & Activity</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Executive roll call analytics, attendance rates, absence/late trends, and administrative recording activity.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1 self-start sm:self-auto">
          <RefreshCw className="h-3 w-3" />
          Refresh Analytics
        </Button>
      </div>

      {/* Scope & Date Filter Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">Class Section:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All School Classes</option>
                <option value="class-basic7a">Basic 7 - Section A</option>
                <option value="class-basic8a">Basic 8 - Section A</option>
                <option value="class-basic9b">Basic 9 - Section B</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Date Range:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-32"
                placeholder="Start Date"
              />
              <span className="text-slate-400 text-xs">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-32"
                placeholder="End Date"
              />
            </div>
          </div>

          <Badge variant="outline" className="text-xs font-mono font-bold shrink-0">
            Session: {overview?.academicYearName} ({overview?.termName})
          </Badge>
        </CardContent>
      </Card>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Overall Attendance</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
              {metrics?.attendanceRate || 0}%
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {metrics?.totalRecords || 0} Total Sessions
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Present</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {metrics?.presentCount || 0}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">Recorded Present</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-amber-600 uppercase">Late Arrivals</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">
              {metrics?.lateCount || 0}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">{metrics?.lateRate || 0}% Late Rate</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-rose-600 uppercase">Absences</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">
              {metrics?.absentCount || 0}
            </p>
            <p className="text-[11px] text-rose-700 font-medium">{metrics?.absenceRate || 0}% Absence Rate</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-blue-600 uppercase">Excused Absence</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-0.5">
              {metrics?.excusedCount || 0}
            </p>
            <p className="text-[11px] text-blue-700 font-medium">Medical/Permitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Attendance Breakdown */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <School className="h-4 w-4 text-slate-500" />
            <span>Class Section Attendance Breakdown</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Comparison of roll call rates, presence, lateness, and absence across active classes.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {overview?.classBreakdown.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No Attendance Records" description="No roll call entries found for the selected filter scope." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Section</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Enrolled Students</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Excused</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview?.classBreakdown.map((c) => (
                    <TableRow key={c.classId}>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {c.className}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {c.gradeLevel}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {c.enrolledStudents}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{c.totalRecords}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-emerald-600">{c.presentCount}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-amber-600">{c.lateCount}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-rose-600">{c.absentCount}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-blue-600">{c.excusedCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-700 border-emerald-300">
                          {c.attendanceRate}%
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

      {/* Student Attendance Attention & Teacher Activity Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Students Requiring Attendance Attention */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Students Requiring Attendance Attention</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Students with attendance rates below 85% or repeated unexcused absences.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2.5">
            {overview?.studentAttentionList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                All students currently meet attendance threshold guidelines.
              </p>
            ) : (
              overview?.studentAttentionList.map((st) => (
                <div
                  key={st.studentId}
                  className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-50 block">
                      {st.studentName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {st.studentCode} • {st.className}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm block">
                      {st.attendanceRate}% Rate
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold">
                      {st.absentCount} Absences ({st.lateCount} Late)
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Teacher Attendance Recording Activity */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-slate-500" />
              <span>Attendance Recording Activity</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Administrative tracking of daily roll call register entries submitted by faculty.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {overview?.teacherActivityList.length === 0 ? (
              <p className="text-xs text-slate-500 p-6 text-center">
                No teacher attendance activity records logged.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Classes Covered</TableHead>
                      <TableHead>Sessions Logged</TableHead>
                      <TableHead>Last Entry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview?.teacherActivityList.map((t) => (
                      <TableRow key={t.teacherId}>
                        <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {t.teacherName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                          {t.department}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {t.classesCovered} Classes
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-emerald-600">
                          {t.sessionsRecorded} Sessions
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-500">
                          {t.lastRecordingDate}
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
    </div>
  );
}

export default function PrincipalAttendanceAnalyticsPage() {
  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "Attendance Analytics" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <PrincipalAttendanceContent />
      </Suspense>
    </DashboardShell>
  );
}
