"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTeacherById, TeacherRecord, updateTeacher, CreateTeacherPayload } from "@/lib/services/teachers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TeacherFormModal } from "@/components/admin/teacher-form-modal";
import { AssignTeacherModal } from "@/components/admin/assign-teacher-modal";
import { DeactivateTeacherDialog } from "@/components/admin/deactivate-teacher-dialog";
import {
  ArrowLeft,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  Award,
  BookOpen,
  Edit,
  UserX,
  Plus,
} from "lucide-react";

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [teacher, setTeacher] = useState<TeacherRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState<boolean>(false);

  const loadTeacher = async () => {
    setLoading(true);
    const data = await fetchTeacherById(id);
    setTeacher(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTeacher();
  }, [id]);

  const handleUpdateTeacher = async (payload: CreateTeacherPayload) => {
    if (!teacher) return { success: false, error: "Teacher not found" };
    const res = await updateTeacher(teacher.id, payload);
    if (res.success) loadTeacher();
    return res;
  };

  if (loading) {
    return (
      <DashboardShell role="administrator">
        <div className="space-y-5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!teacher) {
    return (
      <DashboardShell role="administrator">
        <div className="py-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Teacher Record Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The requested faculty ID does not exist or has been removed.
          </p>
          <Link href="/admin/teachers">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Faculty Directory
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Teacher Management", href: "/admin/teachers" },
        { label: `${teacher.firstName} ${teacher.lastName}` },
      ]}
    >
      <div className="space-y-5">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Faculty Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssignOpen(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Assign Class/Subject</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Record</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeactivateOpen(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Deactivate</span>
            </Button>
          </div>
        </div>

        {/* Profile Card Header */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700">
                  <AvatarImage src={teacher.avatarUrl} />
                  <AvatarFallback className="text-xl font-bold bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
                    {teacher.firstName[0]}
                    {teacher.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {teacher.firstName} {teacher.lastName}
                    </h1>
                    <Badge
                      variant={teacher.isActive ? "success" : "secondary"}
                      className="capitalize text-[10px]"
                    >
                      {teacher.isActive ? "Active Faculty" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Code: {teacher.employeeCode}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {teacher.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Department
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {teacher.department}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Qualifications & Contact Details */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-500" />
                <span>Contact & Academic Background</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Phone contact, qualifications, and employment details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Phone Contact:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {teacher.phone || "No Phone Registered"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Degrees & Qualifications:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {teacher.qualification || "Not Specified"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Joining Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {teacher.joiningDate}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Relational Subject & Class Assignments */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <span>Relational Subject & Class Assignments</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Relational records in <code className="font-mono text-[10px]">teacher_assignments</code>.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setIsAssignOpen(true)}
              >
                <Plus className="h-3 w-3" />
                Assign
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {teacher.assignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No subject or class assignments currently associated with this teacher.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Class Section</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacher.assignments.map((asgn) => (
                      <TableRow key={asgn.id}>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {asgn.subjectName}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {asgn.subjectCode}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {asgn.className}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Modal */}
      <TeacherFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        teacher={teacher}
        onSubmit={handleUpdateTeacher}
      />

      {/* Relational Assignment Modal */}
      <AssignTeacherModal
        teacher={teacher}
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        onAssigned={loadTeacher}
      />

      {/* Deactivate Dialog */}
      <DeactivateTeacherDialog
        teacher={teacher}
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        onDeactivated={() => {
          loadTeacher();
          router.push("/admin/teachers");
        }}
      />
    </DashboardShell>
  );
}
