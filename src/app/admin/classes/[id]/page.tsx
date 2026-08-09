"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchClassById,
  ClassDetailRecord,
  updateClass,
  CreateClassPayload,
} from "@/lib/services/classes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassFormModal } from "@/components/admin/class-form-modal";
import { DeactivateClassDialog } from "@/components/admin/deactivate-class-dialog";
import {
  ArrowLeft,
  School,
  Users,
  UserCheck,
  BookOpen,
  Edit,
  UserX,
  GraduationCap,
} from "lucide-react";

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [classDetail, setClassDetail] = useState<ClassDetailRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchClassById(id);
    setClassDetail(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateClass = async (payload: CreateClassPayload) => {
    if (!classDetail) return { success: false, error: "Class section not found" };
    const res = await updateClass(classDetail.id, payload);
    if (res.success) loadData();
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

  if (!classDetail) {
    return (
      <DashboardShell role="administrator">
        <div className="py-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Class Record Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The requested class section ID does not exist or has been removed.
          </p>
          <Link href="/admin/classes">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Class Directory
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
        { label: "Class Management", href: "/admin/classes" },
        { label: classDetail.name },
      ]}
    >
      <div className="space-y-5">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Class Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Class Section</span>
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
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-md dark:bg-slate-100 dark:text-slate-900">
                  <School className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {classDetail.name}
                    </h1>
                    <Badge variant="success" className="capitalize text-[10px]">
                      {classDetail.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Grade: {classDetail.gradeLevel}
                    </span>
                    <span>•</span>
                    <span>{classDetail.academicYearName}</span>
                  </div>
                </div>
              </div>

              {/* Class Teacher Badge */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Assigned Class Teacher
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {classDetail.classTeacherName || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Lists */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Enrolled Students Roster */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-500" />
                  <span>Enrolled Student Roster</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {classDetail.enrolledStudents.length} / {classDetail.capacity} Enrolled
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Students currently registered in this class division.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {classDetail.enrolledStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No students currently enrolled in this class section.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classDetail.enrolledStudents.map((stu) => (
                      <TableRow key={stu.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {stu.studentCode}
                        </TableCell>
                        <TableCell className="font-medium text-xs text-slate-800 dark:text-slate-200">
                          {stu.firstName} {stu.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-[9px]">
                            {stu.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Assigned Subject Teachers */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span>Assigned Subject Teachers</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Subject teachers mapped to this class via <code className="font-mono text-[10px]">teacher_assignments</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {classDetail.subjectTeachers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No subject teachers currently assigned to this class section.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Assigned Faculty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classDetail.subjectTeachers.map((asgn) => (
                      <TableRow key={asgn.id}>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {asgn.subjectName}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-500">
                          {asgn.subjectCode}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {asgn.teacherName}
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
      <ClassFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        classRecord={classDetail}
        onSubmit={handleUpdateClass}
      />

      {/* Deactivate Dialog */}
      <DeactivateClassDialog
        classRecord={classDetail}
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        onDeactivated={() => {
          loadData();
          router.push("/admin/classes");
        }}
      />
    </DashboardShell>
  );
}
