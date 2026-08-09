"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  generateSchoolReport,
  ReportType,
  GeneratedReport,
} from "@/lib/services/principal-reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  FileText,
  Printer,
  Download,
  Filter,
  RefreshCw,
  School,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

function PrincipalReportsContent() {
  const [reportType, setReportType] = useState<ReportType>("school_academic");
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleGenerate = async () => {
    setLoading(true);
    const data = await generateSchoolReport(reportType, {
      classId: classFilter,
      subjectId: subjectFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    handleGenerate();
  }, [reportType, classFilter, subjectFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;

    const headers = report.columns.map((c) => `"${c.label}"`).join(",");
    const rowsStr = report.rows
      .map((r) =>
        report.columns
          .map((c) => `"${(r[c.key] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(`${headers}\n${rowsStr}`);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${report.header.reportTitle.replace(/\s+/g, "_")}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>School Reports & Reporting Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate and export official academic, attendance, faculty activity, and administrative school reports.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || !report}
            className="h-8 text-xs gap-1.5 font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            disabled={loading || !report}
            className="h-8 text-xs gap-1.5 font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      </div>

      {/* Report Selection & Parameter Filters (Hidden when printing) */}
      <Card className="border-slate-200/80 dark:border-slate-800 print:hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Report Selection & Parameter Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Report Category / Type */}
            <div className="space-y-1 col-span-1 sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Select Report Type *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <optgroup label="Academic Reports">
                  <option value="school_academic">School Academic Performance Report (Official)</option>
                  <option value="class_academic">Class Performance & Occupancy Report</option>
                  <option value="subject_academic">Curriculum Subject Performance Report</option>
                  <option value="student_academic">Student Individual Academic Marksheet Report</option>
                </optgroup>
                <optgroup label="Attendance Reports">
                  <option value="school_attendance">School Attendance Analytics Report</option>
                  <option value="class_attendance">Class Section Attendance Report</option>
                  <option value="student_attendance">Student Attendance History Report</option>
                </optgroup>
                <optgroup label="Faculty & Staff Reports">
                  <option value="teacher_activity">Faculty Workload & Activity Report</option>
                  <option value="teacher_assignment">Teacher Assignment Master Report</option>
                </optgroup>
                <optgroup label="Administrative Reports">
                  <option value="enrollment">Student Enrollment Statistics Report</option>
                  <option value="class_roster">Class Section Student Roster Report</option>
                  <option value="school_summary">Executive Master School Overview Report</option>
                </optgroup>
              </select>
            </div>

            {/* Class Filter */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Class Section</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All School Classes</option>
                <option value="class-basic7a">Basic 7 - Section A</option>
                <option value="class-basic8a">Basic 8 - Section A</option>
                <option value="class-basic9b">Basic 9 - Section B</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Curriculum Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Curriculum Subjects</option>
                <option value="subj-math101">Core Mathematics</option>
                <option value="subj-sci101">Integrated Science</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Branded Report Preview (Print Container) */}
      <div id="printableReport" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !report ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No report data generated. Select a report type above.
          </div>
        ) : (
          <>
            {/* Branded School Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <School className="h-6 w-6 text-slate-900 dark:text-slate-100 shrink-0" />
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">
                    {report.header.schoolName}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  GES Registered Code: {report.header.schoolCode} • Official Executive Report
                </p>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 pt-1">
                  {report.header.reportTitle}
                </h3>
              </div>

              <div className="text-left sm:text-right space-y-1 text-xs">
                <Badge variant="outline" className="font-mono text-[10px] font-bold">
                  {report.header.academicYearName} ({report.header.termName})
                </Badge>
                <p className="text-[11px] text-slate-500">
                  Generated on: <span className="font-semibold text-slate-700 dark:text-slate-300">{report.header.generatedAt}</span>
                </p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 sm:justify-end">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{report.header.filterDescription}</span>
                </p>
              </div>
            </div>

            {/* Summary Metrics Cards if applicable */}
            {report.summaryMetrics && report.summaryMetrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3">
                {report.summaryMetrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">{m.label}</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50 mt-0.5 block">{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Report Table Content */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-800/90">
                    {report.columns.map((col) => (
                      <TableHead key={col.key} className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.map((row, rIdx) => (
                    <TableRow key={rIdx}>
                      {report.columns.map((col) => (
                        <TableCell key={col.key} className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {row[col.key] !== undefined ? row[col.key] : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Official Footer Notice */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Confidential • School Executive Governance Report</span>
              <span>Page 1 of 1</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PrincipalReportsPage() {
  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "School Reports" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <PrincipalReportsContent />
      </Suspense>
    </DashboardShell>
  );
}
