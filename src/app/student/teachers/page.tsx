"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentAssignedTeachers,
  StudentTeachersOverview,
  StudentTeacherItem,
} from "@/lib/services/student-teachers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
  Phone,
  Mail,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  School,
  Eye,
  AlertCircle,
} from "lucide-react";

function TeacherProfileModal({
  teacher,
  open,
  onOpenChange,
}: {
  teacher: StudentTeacherItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>Faculty Profile Information</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Assigned faculty member for your class section.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Profile Overview */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-800 text-white font-black text-base flex items-center justify-center border-2 border-slate-700 shrink-0">
              {teacher.teacherName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">{teacher.teacherName}</h3>
              <p className="font-mono text-slate-500 text-[11px] mt-0.5">
                Employee Code: {teacher.employeeCode}
              </p>
              <Badge variant="outline" className="text-[10px] mt-1">
                {teacher.department}
              </Badge>
            </div>
          </div>

          {/* Assigned Subjects */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              <span>Assigned Curriculum Subjects:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {teacher.subjects.map((sub, idx) => (
                <Badge key={idx} variant="success" className="font-semibold text-xs">
                  {sub}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Details & Links */}
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Authorized School Contact:</span>

            {teacher.email && (
              <a
                href={`mailto:${teacher.email}`}
                className="p-2.5 rounded-md bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800 flex items-center justify-between text-blue-900 dark:text-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="font-mono text-xs">{teacher.email}</span>
                </div>
                <span className="font-bold text-[10px] uppercase">Send Email</span>
              </a>
            )}

            {teacher.phone && (
              <a
                href={`tel:${teacher.phone}`}
                className="p-2.5 rounded-md bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-between text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono text-xs">{teacher.phone}</span>
                </div>
                <span className="font-bold text-[10px] uppercase">Call Phone</span>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentTeachersContent() {
  const [overview, setOverview] = useState<StudentTeachersOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("");
  const [termFilter, setTermFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedTeacher, setSelectedTeacher] = useState<StudentTeacherItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchStudentAssignedTeachers({
      academicYearId: academicYearFilter || undefined,
      termId: termFilter || undefined,
      subjectId: subjectFilter,
      searchQuery,
    });
    setOverview(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [academicYearFilter, termFilter, subjectFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
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
            <span>My Assigned Teachers</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Faculty members assigned to your active curriculum subjects and class section.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1 self-start sm:self-auto">
          <RefreshCw className="h-3 w-3" />
          Refresh Directory
        </Button>
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Strict Enrollment Scoping: Showing exclusively faculty members assigned to your class ({overview?.className}). Unrelated teachers remain inaccessible.
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">Session:</span>
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
              <span className="font-semibold text-slate-600 dark:text-slate-400">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Subjects</option>
                {overview?.availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Subjects Warning if any */}
      {overview?.unassignedSubjects && overview.unassignedSubjects.length > 0 && (
        <div className="space-y-2">
          {overview.unassignedSubjects.map((un, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="font-bold">{un.subjectName} ({un.subjectCode}):</span>
                <span>{un.notice}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assigned Teacher Cards Grid */}
      {teachers.length === 0 ? (
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-12">
            <EmptyState
              title="No Teachers Assigned"
              description="No teachers have been assigned for this academic period matching your search."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <Card key={t.teacherId} className="border-slate-200/80 dark:border-slate-800 hover:shadow-xs transition-shadow">
              <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center border border-slate-700 shrink-0">
                    {t.teacherName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-50">{t.teacherName}</h3>
                    <p className="font-mono text-[10px] text-slate-400">{t.employeeCode}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {t.department}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-500 text-[10px] uppercase block">Assigned Subject(s):</span>
                  <div className="flex flex-wrap gap-1">
                    {t.subjects.map((sub, sIdx) => (
                      <Badge key={sIdx} variant="success" className="font-semibold text-[11px]">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {t.phone && (
                      <a href={`tel:${t.phone}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 font-semibold text-emerald-700 border-emerald-300">
                          <Phone className="h-3 w-3" />
                          <span>Call</span>
                        </Button>
                      </a>
                    )}
                    {t.email && (
                      <a href={`mailto:${t.email}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 font-semibold text-blue-700 border-blue-300">
                          <Mail className="h-3 w-3" />
                          <span>Email</span>
                        </Button>
                      </a>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTeacher(t)}
                    className="h-7 text-xs gap-1 font-semibold text-slate-600"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Teacher Profile Modal */}
      <TeacherProfileModal
        teacher={selectedTeacher}
        open={Boolean(selectedTeacher)}
        onOpenChange={() => setSelectedTeacher(null)}
      />
    </div>
  );
}

export default function StudentTeachersPage() {
  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Portal Dashboard", href: "/student" },
        { label: "My Teachers" },
      ]}
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <StudentTeachersContent />
      </Suspense>
    </DashboardShell>
  );
}
