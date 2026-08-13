"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchCurrentTeacherIdentity,
  fetchTeacherAuthorizedAssignments,
  fetchAuthorizedClassRoster,
  TeacherProfileInfo,
  TeacherAuthorizedAssignment,
  ClassStudentRosterItem,
} from "@/lib/services/teacher-dashboard";
import { fetchAnnouncements, AnnouncementItem } from "@/lib/services/announcements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  School,
  GraduationCap,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  UserCheck,
  Megaphone,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const [identity, setIdentity] = useState<TeacherProfileInfo | null>(null);
  const [assignments, setAssignments] = useState<TeacherAuthorizedAssignment[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cascading Selection State
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Roster state
  const [roster, setRoster] = useState<ClassStudentRosterItem[]>([]);
  const [loadingRoster, setLoadingRoster] = useState<boolean>(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const [idData, asgnData, announcementData] = await Promise.all([
        fetchCurrentTeacherIdentity(),
        fetchTeacherAuthorizedAssignments(),
        fetchAnnouncements({ role: "teacher" }),
      ]);

      setIdentity(idData);
      setAssignments(asgnData);
      setAnnouncements(announcementData);

      if (asgnData.length > 0) {
        const first = asgnData[0];
        setSelectedYearId(first.academicYearId);
        setSelectedTermId(first.termId);
        setSelectedSubjectId(first.subjectId);
        setSelectedClassId(first.classId);
      }
      setLoading(false);
    };

    loadDashboard();
  }, []);

  // Compute cascading options derived strictly from teacher's authorized assignments
  const yearOptions = Array.from(
    new Map(assignments.map((a) => [a.academicYearId, { id: a.academicYearId, name: a.academicYearName }])).values()
  );

  const termOptions = Array.from(
    new Map(
      assignments
        .filter((a) => a.academicYearId === selectedYearId)
        .map((a) => [a.termId, { id: a.termId, name: a.termName }])
    ).values()
  );

  const subjectOptions = Array.from(
    new Map(
      assignments
        .filter((a) => a.academicYearId === selectedYearId && a.termId === selectedTermId)
        .map((a) => [a.subjectId, { id: a.subjectId, name: a.subjectName, code: a.subjectCode }])
    ).values()
  );

  const classOptions = Array.from(
    new Map(
      assignments
        .filter(
          (a) =>
            a.academicYearId === selectedYearId &&
            a.termId === selectedTermId &&
            a.subjectId === selectedSubjectId
        )
        .map((a) => [a.classId, { id: a.classId, name: a.className, gradeLevel: a.gradeLevel }])
    ).values()
  );

  // Load roster when valid selection changes
  useEffect(() => {
    if (!selectedClassId || !selectedYearId || !selectedSubjectId) {
      setRoster([]);
      return;
    }

    const loadRoster = async () => {
      setLoadingRoster(true);
      const data = await fetchAuthorizedClassRoster(
        selectedClassId,
        selectedYearId,
        selectedSubjectId
      );
      setRoster(data);
      setLoadingRoster(false);
    };

    loadRoster();
  }, [selectedClassId, selectedYearId, selectedSubjectId]);

  if (loading) {
    return (
      <DashboardShell role="teacher">
        <div className="space-y-5">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardShell>
    );
  }

  const selectedYear = yearOptions.find((y) => y.id === selectedYearId);
  const selectedTerm = termOptions.find((t) => t.id === selectedTermId);
  const selectedSubject = subjectOptions.find((s) => s.id === selectedSubjectId);
  const selectedClass = classOptions.find((c) => c.id === selectedClassId);

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[{ label: "Teacher Portal" }, { label: "Academic Dashboard" }]}
    >
      <div className="space-y-5">
        {/* Profile Identity Card */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-800">
                  <AvatarImage src={identity?.avatarUrl} />
                  <AvatarFallback className="bg-slate-900 text-slate-50 font-bold text-lg dark:bg-slate-100 dark:text-slate-900">
                    {identity ? `${identity.firstName[0]}${identity.lastName[0]}` : "T"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      Welcome, {identity ? `${identity.firstName} ${identity.lastName}` : "Faculty Member"}
                    </h1>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {identity?.employeeCode || "FACULTY"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-medium">{identity?.department || "Department"}</span>
                    <span>•</span>
                    <span>{identity?.qualification || "Qualifications"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Authenticated Faculty Access</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900 text-slate-50 dark:bg-slate-800">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Active Session
                  </span>
                  <span className="text-xs font-bold text-slate-100">
                    {selectedYear ? selectedYear.name : "2026/2027 Academic Year"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Subjects</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {yearOptions.length > 0 ? new Set(assignments.map((a) => a.subjectId)).size : 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Classes</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {new Set(assignments.map((a) => a.classId)).size}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <School className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Assignments</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {assignments.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Announcements */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-slate-500" />
              <span>Recent Announcements</span>
            </CardTitle>
            <CardDescription className="text-xs">
              School notices and updates for teachers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-4">
                <EmptyState
                  title="No Announcements"
                  description="No recent announcements available."
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {announcements.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{item.author}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        {item.targetAudience}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cascading Assignment Selector */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Assignment Scope Selector</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Select an authorized Academic Year, Term, Subject, and Class to view the class roster.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {assignments.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  title="No Authorized Assignments Found"
                  description="No classes or subjects have been assigned to your account for this academic period."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* 1. Academic Year */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Academic Year
                  </label>
                  <select
                    value={selectedYearId}
                    onChange={(e) => {
                      setSelectedYearId(e.target.value);
                      const availableTerms = assignments.filter((a) => a.academicYearId === e.target.value);
                      if (availableTerms.length > 0) {
                        setSelectedTermId(availableTerms[0].termId);
                        setSelectedSubjectId(availableTerms[0].subjectId);
                        setSelectedClassId(availableTerms[0].classId);
                      }
                    }}
                    className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {yearOptions.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Term */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Term</label>
                  <select
                    value={selectedTermId}
                    onChange={(e) => {
                      setSelectedTermId(e.target.value);
                      const availableSubjs = assignments.filter(
                        (a) => a.academicYearId === selectedYearId && a.termId === e.target.value
                      );
                      if (availableSubjs.length > 0) {
                        setSelectedSubjectId(availableSubjs[0].subjectId);
                        setSelectedClassId(availableSubjs[0].classId);
                      }
                    }}
                    className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {termOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Subject */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      const availableClasses = assignments.filter(
                        (a) =>
                          a.academicYearId === selectedYearId &&
                          a.termId === selectedTermId &&
                          a.subjectId === e.target.value
                      );
                      if (availableClasses.length > 0) {
                        setSelectedClassId(availableClasses[0].classId);
                      }
                    }}
                    className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {subjectOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Class */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Class
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {classOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authorized Class Roster */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <span>Class Roster ({selectedClass?.name || "Selected Class"})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Subject: {selectedSubject ? `${selectedSubject.code} - ${selectedSubject.name}` : "Core Subject"}{" "}
                | Term: {selectedTerm?.name || "Term 1"} | Session: {selectedYear?.name || "2026/2027"}
              </CardDescription>
            </div>

            <Badge variant="outline" className="text-xs font-mono font-bold">
              {roster.length} Enrolled Students
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {loadingRoster ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : roster.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Students Found"
                  description="No students are currently enrolled in this authorized class section."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((stu) => (
                      <TableRow key={stu.studentId}>
                        <TableCell className="font-mono text-xs font-semibold text-slate-500">
                          {stu.rollNumber ? `#${stu.rollNumber}` : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          {stu.studentCode}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {stu.firstName} {stu.lastName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {stu.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="capitalize text-[10px]">
                            {stu.status}
                          </Badge>
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
