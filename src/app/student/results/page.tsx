"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentPublishedResults,
  StudentResultsOverview,
} from "@/lib/services/student-results";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Award,
  BookOpen,
  TrendingUp,
  Filter,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  School,
} from "lucide-react";

function StudentResultsContent() {
  const [overview, setOverview] = useState<StudentResultsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("");
  const [termFilter, setTermFilter] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchStudentPublishedResults({
      academicYearId: academicYearFilter || undefined,
      termId: termFilter || undefined,
    });
    setOverview(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [academicYearFilter, termFilter]);

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

  const results = overview?.results || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Award className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>My Published Term Results</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official term marksheets approved and published by the Principal.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1 self-start sm:self-auto">
          <RefreshCw className="h-3 w-3" />
          Refresh Marksheets
        </Button>
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Published Results Protection: Strictly displaying officially published marksheets. Draft, returned, or unpublished results remain hidden.
          </span>
        </div>
      </div>

      {/* Period Filter Bar */}
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
          </div>

          <Badge variant="outline" className="text-xs font-mono font-bold shrink-0">
            Class Enrollment: {overview?.className}
          </Badge>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Term Average Score</p>
              {overview?.averageScore !== null ? (
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {overview?.averageScore}%
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-500 mt-1">No published results</p>
              )}
              <p className="text-[11px] text-slate-500 font-medium">Based on published results</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Published Subjects</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                {overview?.publishedCount || 0}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Official Marksheets</p>
            </div>
            <Award className="h-8 w-8 text-purple-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Score Range</p>
              {overview?.highestScore !== null ? (
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {overview?.lowestScore}% - {overview?.highestScore}%
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-500 mt-1">—</p>
              )}
              <p className="text-[11px] text-emerald-600 font-medium">Lowest vs Highest</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Pass Rate Status</p>
              {overview?.passRate !== null ? (
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                  {overview?.passRate}%
                </p>
              ) : (
                <p className="text-xs font-bold text-slate-500 mt-1">—</p>
              )}
              <p className="text-[11px] text-slate-500 font-medium">
                {overview?.passedSubjectsCount || 0} Passed ({overview?.failedSubjectsCount || 0} Failed)
              </p>
            </div>
            <ShieldCheck className="h-8 w-8 text-emerald-600/30" />
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution & Results Table */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Grade Distribution Badge List */}
        <Card className="border-slate-200/80 dark:border-slate-800 col-span-1">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-500" />
              <span>GES Grade Tiers</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of your grades achieved this term.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {overview?.gradeDistribution.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No grades awarded yet.</p>
            ) : (
              overview?.gradeDistribution.map((item) => (
                <div key={item.grade} className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Grade {item.grade}</span>
                  <Badge variant="success" className="font-mono text-xs font-bold">
                    {item.count} Subjects
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="border-slate-200/80 dark:border-slate-800 col-span-1 lg:col-span-2">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span>Official Marksheet Breakdown</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Continuous Assessment (40), Examination (60), Total Score, GES Grade, and Teacher Remarks.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {results.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Published Results Available"
                  description="No published results are available for this term. Results will appear here once officially published by the Principal."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>CA (40)</TableHead>
                      <TableHead>Exam (60)</TableHead>
                      <TableHead>Total (100)</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          {r.subjectCode}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {r.subjectName}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-600">{r.continuousAssessmentScore}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-600">{r.examinationScore}</TableCell>
                        <TableCell className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {r.totalScore}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="font-bold text-xs">
                            {r.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium text-slate-500">
                          {r.remarks}
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

export default function StudentResultsPage() {
  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Portal Dashboard", href: "/student" },
        { label: "Published Results" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <StudentResultsContent />
      </Suspense>
    </DashboardShell>
  );
}
