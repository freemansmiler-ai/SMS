"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchClassAttendance,
  saveClassAttendance,
  StudentAttendanceItem,
  AttendanceStatus,
} from "@/lib/services/attendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Save,
  Calendar,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export default function TeacherAttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("class-basic8a");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [roster, setRoster] = useState<StudentAttendanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadRoster = async () => {
    setLoading(true);
    setMsg(null);
    const data = await fetchClassAttendance(selectedClassId, selectedDate);
    setRoster(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRoster();
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
    setSaving(true);
    setMsg(null);
    const records = roster.map((r) => ({
      studentId: r.studentId,
      status: r.status,
      remarks: r.remarks,
    }));

    const res = await saveClassAttendance(selectedClassId, selectedDate, records);
    setSaving(false);

    if (!res.success) {
      setMsg({ type: "error", text: res.error || "Failed to save attendance record." });
      return;
    }

    setMsg({ type: "success", text: `Daily attendance for ${selectedDate} saved successfully.` });
  };

  // Automated Percentage Calculations
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
              Record roll call status for students in your assigned class sections.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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
                  <option value="class-basic8a">Basic 8 - Section A</option>
                  <option value="class-basic9b">Basic 9 - Section B</option>
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

        {/* Automated Calculated Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-slate-900 text-white space-y-0.5">
            <span className="text-[10px] text-slate-300 font-semibold uppercase block">Attendance Rate</span>
            <span className="text-xl font-extrabold text-emerald-400">{attendanceRate}%</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 space-y-0.5">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase block">Present</span>
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{presentCount} Students</span>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800 space-y-0.5">
            <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold uppercase block">Absent</span>
            <span className="text-lg font-bold text-red-800 dark:text-red-200">{absentCount} Students</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 space-y-0.5">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase block">Late</span>
            <span className="text-lg font-bold text-amber-800 dark:text-amber-200">{lateCount} Students</span>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800 space-y-0.5">
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold uppercase block">Excused</span>
            <span className="text-lg font-bold text-purple-800 dark:text-purple-200">{excusedCount} Students</span>
          </div>
        </div>

        {/* Student Roll Call Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Student Attendance Roster</CardTitle>
            <CardDescription className="text-xs">
              Select attendance status and add optional notes for absent/late students.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : roster.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No students enrolled in this class section.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="w-[300px] text-center">Attendance Status</TableHead>
                    <TableHead>Remarks / Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((item) => (
                    <TableRow key={item.studentId}>
                      <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {item.studentName}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-500">
                        {item.studentCode}
                      </TableCell>

                      {/* Status Toggle Buttons */}
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.studentId, "present")}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${
                              item.status === "present"
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" /> Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.studentId, "absent")}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${
                              item.status === "absent"
                                ? "bg-red-600 text-white shadow-2xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <XCircle className="h-3 w-3" /> Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.studentId, "late")}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${
                              item.status === "late"
                                ? "bg-amber-600 text-white shadow-2xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <Clock className="h-3 w-3" /> Late
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.studentId, "excused")}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${
                              item.status === "excused"
                                ? "bg-purple-600 text-white shadow-2xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <FileText className="h-3 w-3" /> Excused
                          </button>
                        </div>
                      </TableCell>

                      {/* Remarks Input */}
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Add remark..."
                          value={item.remarks || ""}
                          onChange={(e) => handleRemarkChange(item.studentId, e.target.value)}
                          className="h-8 text-xs bg-slate-50 dark:bg-slate-900"
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
