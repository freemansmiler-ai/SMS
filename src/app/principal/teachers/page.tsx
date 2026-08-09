"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchPrincipalTeacherAnalytics,
  TeacherAnalyticsOverview,
  TeacherActivitySummary,
} from "@/lib/services/principal-teacher-analytics";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserCheck,
  BookOpen,
  School,
  FileCheck,
  CalendarCheck,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  Award,
  RotateCcw,
} from "lucide-react";

function TeacherDetailModal({
  teacher,
  open,
  onOpenChange,
}: {
  teacher: TeacherActivitySummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>Faculty Profile & Activity Overview</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Viewing assignments, result submission activity, and associated student outcomes for{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.teacherName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Profile Overview Card */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">{teacher.teacherName}</h3>
              <p className="font-mono text-slate-500 text-[11px] mt-0.5">
                Employee Code: {teacher.employeeCode} • {teacher.department}
              </p>
            </div>
            <Badge variant={teacher.isActive ? "success" : "secondary"} className="text-[10px]">
              {teacher.isActive ? "Active Faculty" : "Inactive"}
            </Badge>
          </div>

          {/* Activity Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800">
              <span className="block text-[10px] text-slate-500 font-bold uppercase">Result Completion</span>
              <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">{teacher.resultCompletionRate}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800">
              <span className="block text-[10px] text-slate-500 font-bold uppercase">Return Rate</span>
              <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">{teacher.resultReturnRate}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800">
              <span className="block text-[10px] text-slate-500 font-bold uppercase">Attendance Sessions</span>
              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{teacher.attendanceSessionsRecorded}</span>
            </div>
          </div>

          {/* Assigned Classes & Subjects */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <School className="h-3.5 w-3.5 text-slate-500" />
              <span>Teaching Assignments ({teacher.activeAssignmentsCount})</span>
            </h4>
            {teacher.assignmentsList.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No current active assignments.</p>
            ) : (
              <div className="border border-slate-200/60 dark:border-slate-800 rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class Section</TableHead>
                      <TableHead>Academic Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacher.assignmentsList.map((a, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-bold text-xs">{a.subjectName}</TableCell>
                        <TableCell className="text-xs">{a.className}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-500">
                          {a.academicYearName} ({a.termName})
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Student Academic Outcomes Context */}
          <div className="p-3.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900 space-y-1">
            <h4 className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 text-xs">
              <Award className="h-3.5 w-3.5 text-purple-600" />
              <span>Associated Student Academic Outcomes</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Assessed {teacher.assessedStudentsCount} student marksheets with an average total score of{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">{teacher.associatedAverageScore}%</span> and a pass rate of{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{teacher.associatedPassRate}%</span>.
            </p>
            <p className="text-[10px] text-slate-400 italic mt-1">
              Note: Academic outcomes reflect student performance across assigned curriculum areas and are presented for context.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrincipalTeachersContent() {
  const [overview, setOverview] = useState<TeacherAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const [selectedTeacher, setSelectedTeacher] = useState<TeacherActivitySummary | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPrincipalTeacherAnalytics({
      department: departmentFilter,
      classId: classFilter,
      subjectId: subjectFilter,
    });
    setOverview(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [departmentFilter, classFilter, subjectFilter]);

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

  const teachers = overview?.teachers || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>Teacher Performance & Activity Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Executive oversight of faculty workload, result submission activity, attendance entries, and student academic outcomes.
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
              <span className="font-semibold text-slate-600 dark:text-slate-400">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Departments</option>
                {overview?.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <School className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">Class Section:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Classes</option>
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
                <option value="all">All Subjects</option>
                <option value="subj-math101">Core Mathematics</option>
                <option value="subj-sci101">Integrated Science</option>
              </select>
            </div>
          </div>

          <Badge variant="outline" className="text-xs font-mono font-bold shrink-0">
            Session: {overview?.academicYearName} ({overview?.termName})
          </Badge>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Faculty</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                {overview?.totalTeachers || 0}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {overview?.activeTeachers || 0} Active Accounts
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Faculty</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                {overview?.assignedTeachersCount || 0}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {overview?.unassignedTeachersCount || 0} Unassigned
              </p>
            </div>
            <School className="h-8 w-8 text-emerald-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Result Submissions</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                95.2%
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Completion Rate</p>
            </div>
            <FileCheck className="h-8 w-8 text-purple-600/30" />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Outstanding Tasks</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-0.5">
                {overview?.outstandingSubmissionsCount || 0}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Pending Marksheets</p>
            </div>
            <RotateCcw className="h-8 w-8 text-amber-600/30" />
          </CardContent>
        </Card>
      </div>

      {/* Teacher Activity & Workload Table */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-slate-500" />
            <span>Faculty Activity & Teaching Workload</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Review teaching coverage, result completion rates, attendance entries, and associated student outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {teachers.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No Faculty Records Found" description="No teachers match the selected department or class filter." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Classes / Subjects</TableHead>
                    <TableHead>Students Covered</TableHead>
                    <TableHead>Result Activity</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Return Rate</TableHead>
                    <TableHead>Student Outcomes</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((t) => (
                    <TableRow key={t.teacherId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {t.teacherName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{t.employeeCode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {t.department}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {t.assignedClassesCount} Classes / {t.assignedSubjectsCount} Subjects
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {t.studentsCoveredCount} Students
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="text-slate-500" title="Draft">{t.draftResultsCount}d</span>
                          <span>/</span>
                          <span className="text-amber-600 font-bold" title="Submitted">{t.submittedResultsCount}s</span>
                          <span>/</span>
                          <span className="text-emerald-600 font-bold" title="Approved">{t.approvedResultsCount}a</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] font-bold text-blue-600 border-blue-200 dark:border-blue-800">
                          {t.resultCompletionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.resultReturnRate > 0 ? "destructive" : "secondary"} className="font-mono text-[10px]">
                          {t.resultReturnRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{t.associatedAverageScore}% Avg</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{t.associatedPassRate}% Pass Rate</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTeacher(t)}
                          className="h-7 text-xs gap-1.5 font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Detail Modal */}
      <TeacherDetailModal teacher={selectedTeacher} open={Boolean(selectedTeacher)} onOpenChange={() => setSelectedTeacher(null)} />
    </div>
  );
}

export default function PrincipalTeachersPage() {
  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "Teacher Activity Analytics" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <PrincipalTeachersContent />
      </Suspense>
    </DashboardShell>
  );
}
