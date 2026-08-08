"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentReportCard,
  StudentReportCard,
} from "@/lib/services/student-results";
import { OfficialReportCard } from "@/components/student/official-report-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  Lock,
  ShieldCheck,
  Calendar,
  Filter,
} from "lucide-react";

export default function StudentResultsPage() {
  const [academicYear, setAcademicYear] = useState<string>("2026/2027");
  const [term, setTerm] = useState<string>("Term 1");

  const [reportCard, setReportCard] = useState<StudentReportCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadReport = async () => {
    setLoading(true);
    const data = await fetchStudentReportCard(academicYear, term);
    setReportCard(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, [academicYear, term]);

  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Dashboard", href: "/student" },
        { label: "Published Results" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Award className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Official Academic Terminal Report Card</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ghana Education Service (GES) terminal transcript approved and published by the Headmaster.
            </p>
          </div>
        </div>

        {/* Security Rule Banner */}
        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            Published Results Verification: Displaying only executive-approved & published marksheets. Drafts and unapproved submissions are strictly restricted from student access.
          </span>
        </div>

        {/* Year and Term Selector Bar */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />

              {/* Academic Year Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Academic Year:
                </span>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="2026/2027">2026/2027 Academic Year</option>
                  <option value="2025/2026">2025/2026 Academic Year</option>
                </select>
              </div>

              {/* Academic Term Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Term:</span>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !reportCard || !reportCard.isPublished || reportCard.subjects.length === 0 ? (
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-10 text-center space-y-3">
              <Lock className="h-8 w-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Results Pending Executive Publication
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Terminal results for <span className="font-bold text-slate-700 dark:text-slate-300">{academicYear} ({term})</span> have not been published by the Headmaster yet. Please check back after official announcement.
              </p>
            </CardContent>
          </Card>
        ) : (
          <OfficialReportCard reportCard={reportCard} />
        )}
      </div>
    </DashboardShell>
  );
}
