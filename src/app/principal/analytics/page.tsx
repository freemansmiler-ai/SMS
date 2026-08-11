"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchPrincipalStudentAnalytics,
  StudentAnalyticsOverview,
} from "@/lib/services/principal-student-analytics";
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
  BarChart3,
  Award,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  BookOpen,
  School,
  ShieldCheck,
} from "lucide-react";

function PrincipalStudentAnalyticsContent() {
  const [analytics, setAnalytics] = useState<StudentAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPrincipalStudentAnalytics({
      classId: classFilter,
      subjectId: subjectFilter,
    });
    setAnalytics(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [classFilter, subjectFilter]);

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

  const metrics = analytics?.metrics;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>Student Performance Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Executive academic performance analysis across classes, subjects, and grade distributions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1 self-start sm:self-auto">
          <RefreshCw className="h-3 w-3" />
          Refresh Analytics
        </Button>
      </div>

      {/* Scope Filter Bar */}
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
              <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Curriculum Subjects</option>
                <option value="subj-math101">Core Mathematics</option>
                <option value="subj-sci101">Integrated Science</option>
              </select>
            </div>
          </div>

          <Badge variant="outline" className="text-xs font-mono font-bold shrink-0">
            Session: {analytics?.academicYearName} ({analytics?.termName})
          </Badge>
        </CardContent>
      </Card>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Assessed Students</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                {metrics?.totalStudentsWithResults || 0}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Official Marksheets</p>
            </div>
            <GraduationCap className="h-8 w-8 text-blue-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">School Average Score</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                {metrics?.overallAverageScore || 0}%
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">
                High: {metrics?.highestScore}% | Low: {metrics?.lowestScore}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Overall Pass Rate</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                {metrics?.passRate || 0}%
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {metrics?.passedCount || 0} Passed ({metrics?.failedCount || 0} Below Threshold)
              </p>
            </div>
            <Award className="h-8 w-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">GES Grade Standard</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                A1 - F9
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Pass Threshold $\ge 50\%$</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-purple-600/30" />
          </CardContent>
        </Card>
      </div>

      {/* Class & Subject Performance Breakdown */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Class Performance Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <School className="h-4 w-4 text-slate-500" />
              <span>Class Performance Comparison</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Average total score and pass rate by class division.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Section</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Class Avg</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Pass Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.classPerformance.map((c) => (
                    <TableRow key={c.classId}>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {c.className}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{c.enrolledStudents}</TableCell>
                      <TableCell className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {c.averageScore}%
                      </TableCell>
                      <TableCell className="text-[11px] font-mono text-slate-500">
                        {c.lowestScore}% - {c.highestScore}%
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {c.passRate}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span>Curriculum Subject Performance</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Subject scores analysis and curriculum strength categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.subjectPerformance.map((s) => (
                    <TableRow key={s.subjectId}>
                      <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {s.subjectCode}
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {s.subjectName}
                      </TableCell>
                      <TableCell className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {s.averageScore}%
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {s.passRate}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.statusCategory === "Strong" ? "success" : s.statusCategory === "Requires Attention" ? "destructive" : "outline"}
                          className="text-[10px]"
                        >
                          {s.statusCategory}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution & Top Performers */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Grade Distribution Breakdown */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-500" />
              <span>GES Grade Distribution</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of student totals across official grade tiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {analytics?.gradeDistribution.map((item) => (
              <div key={item.grade} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">
                    Grade {item.grade} ({item.label}):
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {item.count} Students ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      item.grade === "A1" || item.grade === "B2"
                        ? "bg-emerald-500"
                        : item.grade === "F9"
                        ? "bg-rose-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers & Students Requiring Attention */}
        <div className="space-y-5">
          {/* Top Performing Students */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Top Performing Scholars</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5">
              {analytics?.topPerformers.map((st) => (
                <div
                  key={st.studentId}
                  className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900 flex items-center justify-between text-xs"
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
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm block">
                      {st.averageScore}% Avg
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {st.passedSubjects} Passed
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Students Requiring Academic Attention */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Students Requiring Academic Attention</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5">
              {analytics?.studentsRequiringAttention.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 text-center">
                  No student currently require urgent academic intervention.
                </p>
              ) : (
                analytics?.studentsRequiringAttention.map((st) => (
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
                      <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm block">
                        {st.averageScore}% Avg
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                        {st.failedSubjects} Failed Subjects
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PrincipalStudentAnalyticsPage() {
  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "Student Performance Analytics" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <PrincipalStudentAnalyticsContent />
      </Suspense>
    </DashboardShell>
  );
}
