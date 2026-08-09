"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentReportCard,
  fetchStudentPublishedResults,
  StudentReportCard,
} from "@/lib/services/student-results";
import { OfficialReportCard } from "@/components/student/official-report-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileText,
  Filter,
  RefreshCw,
  ShieldCheck,
  Award,
  AlertTriangle,
} from "lucide-react";

function StudentReportSheetContent() {
  const [reportCard, setReportCard] = useState<StudentReportCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableYears, setAvailableYears] = useState<Array<{ id: string; name: string }>>([]);
  const [availableTerms, setAvailableTerms] = useState<Array<{ id: string; name: string }>>([]);

  // Filters
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("");
  const [termFilter, setTermFilter] = useState<string>("");

  const loadFilterOptions = async () => {
    const data = await fetchStudentPublishedResults();
    setAvailableYears(data.availableAcademicYears);
    setAvailableTerms(data.availableTerms);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    const card = await fetchStudentReportCard({
      academicYearId: academicYearFilter || undefined,
      termId: termFilter || undefined,
    });
    setReportCard(card);
    setLoading(false);
  };

  useEffect(() => {
    loadFilterOptions();
    handleGenerateReport();
  }, [academicYearFilter, termFilter]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header & Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>Official Student Report Sheet</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate, preview, print, or download your official published terminal report sheet card.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleGenerateReport} className="h-8 text-xs gap-1 self-start sm:self-auto">
          <RefreshCw className="h-3 w-3" />
          Refresh Report Sheet
        </Button>
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200 print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Official Report Verification: Generating report sheet exclusively for authenticated student ({reportCard?.studentCode}). Published marksheets only.
          </span>
        </div>
      </div>

      {/* Parameter Selection Panel (Hidden during print) */}
      <Card className="border-slate-200/80 dark:border-slate-800 print:hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Select Academic Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Academic Year:</span>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="">Current Academic Year</option>
                {availableYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Term:</span>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="">Current Term</option>
                {availableTerms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button size="sm" onClick={handleGenerateReport} className="h-8 text-xs font-semibold gap-1.5 w-full sm:w-auto">
            <Award className="h-3.5 w-3.5" />
            <span>Generate Report Sheet</span>
          </Button>
        </CardContent>
      </Card>

      {/* Partial Result Warning Banner if applicable */}
      {reportCard && !reportCard.isComplete && (
        <Alert variant="warning" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Partial Results Notice</AlertTitle>
          <AlertDescription>
            This report contains currently published results and may not represent the complete term result set.
          </AlertDescription>
        </Alert>
      )}

      {/* Report Card Document Component */}
      {reportCard ? (
        <OfficialReportCard reportCard={reportCard} />
      ) : (
        <Card className="p-8 text-center text-xs text-slate-500">
          No report sheet available for the selected period.
        </Card>
      )}
    </div>
  );
}

export default function StudentReportSheetPage() {
  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Portal Dashboard", href: "/student" },
        { label: "Report Sheet" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <StudentReportSheetContent />
      </Suspense>
    </DashboardShell>
  );
}
