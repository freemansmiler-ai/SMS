"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchClassAttendance,
  saveClassAttendance,
  StudentAttendanceItem,
  AttendanceStatus,
} from "@/lib/services/attendance";
import {
  fetchTeacherAuthorizedAssignments,
  TeacherAuthorizedAssignment,
} from "@/lib/services/teacher-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Save,
  Calendar,
  AlertCircle,
  BookOpen,
  Users,
} from "lucide-react";

export default function TeacherAttendancePage() {
  const [assignments, setAssignments] = useState<TeacherAuthorizedAssignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [roster, setRoster] = useState<StudentAttendanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load teacher assigned classes
  useEffect(() => {
    const loadAssignments = async () => {
      const asgns = await fetchTeacherAuthorizedAssignments();
      setAssignments(asgns);
      if (asgns.length > 0) {
        setSelectedClassId(asgns[0].classId);
      }
    };
    loadAssignments();
  }, []);

  // Compute unique classes list from authorized assignments
  const classOptions = Array.from(
    new Map(assignments.map((a) => [a.classId, { id: a.classId, name: a.className }])).values()
  );

  const currentAssignment = assignments.find((a) => a.classId === selectedClassId) || assignments[0];

  const loadRoster = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setMsg(null);
    const data = await fetchClassAttendance(
      selectedClassId,
      selectedDate,
      currentAssignment?.academicYearId,
      currentAssignment?.termId
    );
    setRoster(data);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedClassId) {
      loadRoster();
    }
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    setMsg(null);

    const records = roster.map((r) => ({
      studentId: r.studentId,
      status: r.status,
      remarks: r.remarks,
    }));

    const res = await saveClassAttendance(
      selectedClassId,
      selectedDate,
      records,
      currentAssignment?.academicYearId,
      currentAssignment?.termId
    );
    setSaving(false);

    if (!res.success) {
      setMsg({ type: "error", text: res.error || "Failed to save attendance record." });
      return;
    }

    setMsg({ type: "success", text: `Daily attendance for ${selectedDate} saved successfully.` });
  };

  // Summary Metrics
  const total = roster.length;
  const presentCount = roster.filter((r) => r.status === "present").length;
  const lateCount = roster.filter((r) => r.status === "late").length;
  const absentCount = roster.filter((r) => r.status === "absent").length;
  const excusedCount = roster.filter((r) => r.status === "excused").length;

  const attendanceRate = total > 0 ? (((presentCount + lateCount) / total) * 100).toFixed(1) : "0.0";

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[
        { label: "Teacher Dashboard", href: "/teacher" },
        { label: "Daily Class Attendance" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Daily Class Attendance Register</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record roll call status for students in your authorized assigned class sections.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || loading || roster.length === 0}
            className="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving..." : "Save Attendance"}</span>
          </Button>
        </div>

        {/* Status Notification */}
        {msg && (
          <Alert variant={msg.type === "error" ? "destructive" : "default"} className="py-2.5">
            {msg.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            <AlertDescription className="text-xs font-semibold">{msg.text}</AlertDescription>
          </Alert>
        )}

        {/* Class Selection & Date Picker Bar */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Class:
                </span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {classOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Roll Call Date:
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Quick Mark All Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Mark All:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("present")}
                className="h-7 text-[11px] px-2 font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("absent")}
                className="h-7 text-[11px] px-2 font-semibold text-red-700 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
              >
                Absent
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Summary Analytics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Students</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5">{total}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Present</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{presentCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-amber-600 uppercase">Late</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{lateCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-rose-600 uppercase">Absent</p>
              <p className="text-xl font-bold text-rose-600 mt-0.5">{absentCount}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-blue-600 uppercase">Excused</p>
              <p className="text-xl font-bold text-blue-600 mt-0.5">{excusedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Attendance Roster Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span>Class Roll Call Roster</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Session: {currentAssignment?.academicYearName || "2026/2027"} | Term: {currentAssignment?.termName || "Term 1"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold">
              Rate: {attendanceRate}%
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : roster.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Students Found"
                  description="No students are currently enrolled in this authorized class section for attendance recording."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Attendance Status</TableHead>
                      <TableHead>Remarks / Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((item) => (
                      <TableRow key={item.studentId}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {item.studentCode}
                        </TableCell>
                        <TableCell className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {item.studentName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant={item.status === "present" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStatusChange(item.studentId, "present")}
                              className={`h-7 text-[10px] px-2 font-semibold ${
                                item.status === "present" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                              }`}
                            >
                              Present
                            </Button>
                            <Button
                              type="button"
                              variant={item.status === "late" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStatusChange(item.studentId, "late")}
                              className={`h-7 text-[10px] px-2 font-semibold ${
                                item.status === "late" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
                              }`}
                            >
                              Late
                            </Button>
                            <Button
                              type="button"
                              variant={item.status === "absent" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStatusChange(item.studentId, "absent")}
                              className={`h-7 text-[10px] px-2 font-semibold ${
                                item.status === "absent" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
                              }`}
                            >
                              Absent
                            </Button>
                            <Button
                              type="button"
                              variant={item.status === "excused" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStatusChange(item.studentId, "excused")}
                              className={`h-7 text-[10px] px-2 font-semibold ${
                                item.status === "excused" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                              }`}
                            >
                              Excused
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.remarks || ""}
                            onChange={(e) => handleRemarkChange(item.studentId, e.target.value)}
                            placeholder="Optional remark (e.g. medical note)..."
                            className="h-7 text-xs max-w-xs"
                          />
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
