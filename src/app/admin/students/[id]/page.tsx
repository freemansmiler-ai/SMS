"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchStudentById, StudentRecord, updateStudent, CreateStudentPayload } from "@/lib/services/students";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentFormModal } from "@/components/admin/student-form-modal";
import { DeactivateStudentDialog } from "@/components/admin/deactivate-student-dialog";
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  Edit,
  UserX,
  BookOpen,
  Award,
} from "lucide-react";

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState<boolean>(false);

  const loadStudent = async () => {
    setLoading(true);
    const data = await fetchStudentById(id);
    setStudent(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStudent();
  }, [id]);

  const handleUpdateStudent = async (payload: CreateStudentPayload) => {
    if (!student) return { success: false, error: "Student not found" };
    const res = await updateStudent(student.id, payload);
    if (res.success) loadStudent();
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

  if (!student) {
    return (
      <DashboardShell role="administrator">
        <div className="py-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Student Record Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The requested student ID does not exist or has been removed.
          </p>
          <Link href="/admin/students">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Student List
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
        { label: "Student Management", href: "/admin/students" },
        { label: `${student.firstName} ${student.lastName}` },
      ]}
    >
      <div className="space-y-5">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Student Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
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
                    <Badge
                      variant={student.status === "active" ? "success" : "secondary"}
                      className="capitalize text-[10px]"
                    >
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      ID: {student.studentCode}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {student.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <GraduationCap className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Assigned Class
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {student.className || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Personal & Permitted Contact Information */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>Permitted Contact & Personal Info</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Guardian contact numbers and demographic data.
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
                <span className="text-slate-500">Guardian Phone:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.guardianContact || "Not Provided"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.dateOfBirth || "Not Specified"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Gender:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.gender || "Not Specified"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment & Academic History Preservation */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span>Academic Enrollment Record</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Class division, enrollment date, and historical data lock.
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
                <span className="text-slate-500">Enrollment Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.enrollmentDate}
                </span>
              </div>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Academic Preservation Lock Active: All marksheets, grades, and attendance records associated with ID <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{student.studentCode}</span> are permanently tied to this database record.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Modal */}
      <StudentFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        student={student}
        onSubmit={handleUpdateStudent}
      />

      {/* Deactivate Dialog */}
      <DeactivateStudentDialog
        student={student}
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        onDeactivated={() => {
          loadStudent();
          router.push("/admin/students");
        }}
      />
    </DashboardShell>
  );
}
