"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentAttendanceAnalytics,
  StudentAttendanceAnalyticsOverview,
} from "@/lib/services/student-attendance";
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
  ShieldCheck,
  Calendar,
  UserCheck,
} from "lucide-react";

function StudentAttendanceContent() {
  const [overview, setOverview] = useState<StudentAttendanceAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("");
  const [termFilter, setTermFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchStudentAttendanceAnalytics({
      academicYearId: academicYearFilter || undefined,
      termId: termFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setOverview(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [academicYearFilter, termFilter, startDate, endDate]);

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

  const history = overview?.history || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>My Personal Attendance History</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal roll call register records, monthly trends, and calendar attendance tracking.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1 self-start sm:self-auto">
          <RefreshCw className="h-3 w-3" />
          Refresh Attendance
        </Button>
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Read-Only Student Ownership: Displaying strictly your attendance records ({overview?.studentCode}). Student modification is denied.
          </span>
        </div>
      </div>

      {/* Attendance Attention Banner if below threshold */}
      {overview?.requiresAttention && (
        <div className="p-3.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 text-xs flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-semibold">{overview.attentionNotice}</span>
        </div>
      )}

      {/* Period & Date Range Filter Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">Academic Session:</span>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="">Current Academic Year</option>
                {overview?.availableAcademicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Term:</span>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="">Current Term</option>
                {overview?.availableTerms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Date Range:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-32"
              />
              <span className="text-slate-400 text-xs">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-32"
              />
            </div>
          </div>

          <Badge variant="outline" className="text-xs font-mono font-bold shrink-0">
            Class: {overview?.className}
          </Badge>
        </CardContent>
      </Card>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Attendance Rate</p>
            {overview?.attendanceRate !== null ? (
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                {overview?.attendanceRate}%
              </p>
            ) : (
              <p className="text-xs font-bold text-slate-500 mt-1">No attendance data</p>
            )}
            <p className="text-[11px] text-slate-500 font-medium">
              {overview?.totalSessions || 0} Total Recorded
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Present</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {overview?.presentCount || 0}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">Days Present</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-amber-600 uppercase">Late</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">
              {overview?.lateCount || 0}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">Arrived Late</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-rose-600 uppercase">Absent</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">
              {overview?.absentCount || 0}
            </p>
            <p className="text-[11px] text-rose-700 font-medium">Unexcused Absences</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-blue-600 uppercase">Excused</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-0.5">
              {overview?.excusedCount || 0}
            </p>
            <p className="text-[11px] text-blue-700 font-medium">Medical/Permitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary & Accessible Calendar View */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Monthly Attendance Breakdown */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Monthly Attendance Breakdown</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Month-by-month presence, lateness, and absence totals.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {overview?.monthlySummaries.length === 0 ? (
              <p className="text-xs text-slate-500 p-6 text-center">No monthly attendance records available.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Excused</TableHead>
                    <TableHead className="text-right">Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview?.monthlySummaries.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {m.monthName}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-600">{m.presentCount}</TableCell>
                      <TableCell className="text-xs font-semibold text-amber-600">{m.lateCount}</TableCell>
                      <TableCell className="text-xs font-semibold text-rose-600">{m.absentCount}</TableCell>
                      <TableCell className="text-xs font-semibold text-blue-600">{m.excusedCount}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-700 border-emerald-300">
                          {m.attendanceRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Accessible Attendance Calendar View */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-slate-500" />
              <span>Attendance Calendar View</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Daily status log entries with explicit text and symbol labels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {overview?.calendarDays.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No calendar entries recorded for this period.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {overview?.calendarDays.map((d, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                      d.status === "present"
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200"
                        : d.status === "late"
                        ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200"
                        : d.status === "absent"
                        ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                        : "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200"
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold opacity-80">{d.date}</span>
                    <span className="font-extrabold text-xs mt-1">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Attendance History Table */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <span>Detailed Attendance Register Log</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Complete chronological record of recorded roll call sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No Attendance Records Found" description="No attendance records available for the selected period filter." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class Section</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="text-right">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {h.date}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {h.className}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            h.status === "present"
                              ? "success"
                              : h.status === "late"
                              ? "secondary"
                              : h.status === "excused"
                              ? "outline"
                              : "destructive"
                          }
                          className="font-bold text-xs"
                        >
                          {h.status === "present" && "✓ Present"}
                          {h.status === "late" && "L Late"}
                          {h.status === "absent" && "✕ Absent"}
                          {h.status === "excused" && "E Excused"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {h.recordedBy}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500">
                        {h.remarks || "—"}
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
  );
}

export default function StudentAttendancePage() {
  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Portal Dashboard", href: "/student" },
        { label: "My Attendance" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <StudentAttendanceContent />
      </Suspense>
    </DashboardShell>
  );
}
