"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTeacherStudentById } from "@/lib/services/teacher-students";
import { StudentRecord } from "@/lib/services/students";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  BookOpen,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";

export default function TeacherStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchTeacherStudentById(id);
      setStudent(data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardShell role="teacher">
        <div className="space-y-5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!student) {
    return (
      <DashboardShell role="teacher">
        <div className="py-12 text-center space-y-3">
          <div className="mx-auto w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Unauthorized Student Access
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are not authorized to view this student's profile. Teachers can only access students enrolled in their assigned subjects and classes.
          </p>
          <Link href="/teacher/students">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to My Roster
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[
        { label: "Teacher Dashboard", href: "/teacher" },
        { label: "My Students", href: "/teacher/students" },
        { label: `${student.firstName} ${student.lastName}` },
      ]}
    >
      <div className="space-y-5">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/teacher/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to My Class Roster</span>
          </Link>

          <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Read-Only Faculty View
          </Badge>
        </div>

        {/* Profile Card Header */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700">
                  <AvatarImage src={student.avatarUrl} />
                  <AvatarFallback className="text-xl font-bold bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {student.firstName} {student.lastName}
                    </h1>
                    <Badge variant="success" className="capitalize text-[10px]">
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Code: {student.studentCode}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {student.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <GraduationCap className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Class Section
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {student.className}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Permitted Contact Info */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>Guardian Emergency Contact</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Permitted contact phone numbers for parent communication.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Guardian Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.guardianName || "Not Provided"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Emergency Phone:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.guardianContact || "Not Provided"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.dateOfBirth || "Not Specified"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Class & Attendance Overview */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-slate-500" />
                <span>Class & Attendance Summary</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Academic year placement and class attendance record.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Academic Year:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  2026/2027 Academic Year (Term 1)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Term 1 Attendance:</span>
                <Badge variant="success" className="text-[10px]">
                  96.5% Present
                </Badge>
              </div>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Faculty Access Scoped: Modifications to student profiles or status changes must be submitted through the School Administration Office.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
