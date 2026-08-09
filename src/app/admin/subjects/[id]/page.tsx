"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchSubjectById,
  SubjectDetailRecord,
  updateSubject,
  CreateSubjectPayload,
} from "@/lib/services/subjects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubjectFormModal } from "@/components/admin/subject-form-modal";
import { DeleteSubjectDialog } from "@/components/admin/delete-subject-dialog";
import {
  ArrowLeft,
  BookOpen,
  UserCheck,
  School,
  Edit,
  Trash2,
} from "lucide-react";

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [subjectDetail, setSubjectDetail] = useState<SubjectDetailRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSubjectById(id);
    setSubjectDetail(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateSubject = async (payload: CreateSubjectPayload) => {
    if (!subjectDetail) return { success: false, error: "Subject record not found" };
    const res = await updateSubject(subjectDetail.id, payload);
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

  if (!subjectDetail) {
    return (
      <DashboardShell role="administrator">
        <div className="py-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Subject Record Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The requested subject ID does not exist or has been removed.
          </p>
          <Link href="/admin/subjects">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Subject Directory
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
        { label: "Subject Management", href: "/admin/subjects" },
        { label: subjectDetail.code },
      ]}
    >
      <div className="space-y-5">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Subject Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Subject</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Manage / Delete</span>
            </Button>
          </div>
        </div>

        {/* Profile Card Header */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-md dark:bg-slate-100 dark:text-slate-900">
                  <BookOpen className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {subjectDetail.name}
                    </h1>
                    <Badge variant="outline" className="font-mono text-xs font-bold uppercase">
                      {subjectDetail.code}
                    </Badge>
                    <Badge
                      variant={subjectDetail.status === "active" ? "success" : "secondary"}
                      className="capitalize text-[10px]"
                    >
                      {subjectDetail.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    {subjectDetail.description || "No description provided for this subject."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Assigned Teachers
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {subjectDetail.assignedTeachers.length} Active Instructors
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Assigned Faculty */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-slate-500" />
                <span>Assigned Faculty Members</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Teachers currently authorized to instruct this subject.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {subjectDetail.assignedTeachers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No faculty members currently assigned to this subject.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectDetail.assignedTeachers.map((tch) => (
                      <TableRow key={tch.id}>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {tch.teacherName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {tch.employeeCode}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                          {tch.department}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Assigned Class Sections */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <School className="h-4 w-4 text-slate-500" />
                <span>Assigned Class Sections</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Classes where this subject is actively taught.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {subjectDetail.assignedClasses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No class sections currently assigned to this subject.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Section</TableHead>
                      <TableHead>Grade Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectDetail.assignedClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {cls.className}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">
                          {cls.gradeLevel}
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
      <SubjectFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        subjectRecord={subjectDetail}
        onSubmit={handleUpdateSubject}
      />

      {/* Delete / Deactivate Dialog */}
      <DeleteSubjectDialog
        subjectRecord={subjectDetail}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onActionComplete={() => {
          loadData();
          router.push("/admin/subjects");
        }}
      />
    </DashboardShell>
  );
}
