"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

export default function StudentAttendancePage() {
  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Dashboard", href: "/student" },
        { label: "Attendance Record" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>Term 1 Attendance Summary</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal attendance record and daily roll call status for Basic 8 - Section A.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Total School Days</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">54 Days</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Days Present</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">53 Days</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">98.2%</div>
              <Badge variant="success" className="gap-1 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> Excellent
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
