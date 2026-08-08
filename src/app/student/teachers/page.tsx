"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentSubjectTeachers,
  StudentTeacherContact,
} from "@/lib/services/student-teachers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  UserCheck,
  Mail,
  Phone,
  PhoneOff,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export default function StudentTeachersPage() {
  const [teachers, setTeachers] = useState<StudentTeacherContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchStudentSubjectTeachers();
      setTeachers(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Dashboard", href: "/student" },
        { label: "My Subject Teachers" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>My Subject Teachers Directory</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official school contact information for faculty members responsible for your current class subjects.
            </p>
          </div>
        </div>

        {/* Security & Privacy Policy Banner */}
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            Privacy & Scope Policy: Displaying only teachers assigned to your current subject curriculum. Private phone contacts not authorized by school administration are restricted.
          </span>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Subject Teachers Assigned"
              description="No subject teachers are currently assigned to your class section."
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-slate-200 dark:border-slate-700">
                      <AvatarImage src={teacher.avatarUrl} />
                      <AvatarFallback className="font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        {teacher.teacherName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {teacher.teacherName}
                      </h3>
                      <Badge variant="outline" className="text-[10px] mt-0.5 font-medium">
                        {teacher.department}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3 text-xs">
                  {/* Subject Assigned Tag */}
                  <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {teacher.subjectCode}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {teacher.subjectName}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {/* Official Email */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        Official Email:
                      </span>
                      <a
                        href={`mailto:${teacher.email}`}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:underline hover:text-blue-600 truncate max-w-[160px]"
                        title={teacher.email}
                      >
                        {teacher.email}
                      </a>
                    </div>

                    {/* Official Phone Contact */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        School Phone:
                      </span>
                      {teacher.isPhoneVisible && teacher.phone ? (
                        <a
                          href={`tel:${teacher.phone}`}
                          className="font-semibold text-slate-800 dark:text-slate-200 hover:underline"
                        >
                          {teacher.phone}
                        </a>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] gap-1 font-normal text-slate-400">
                          <PhoneOff className="h-3 w-3" /> Private Contact
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
