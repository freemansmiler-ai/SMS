"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchEnrollments,
  updateEnrollmentStatus,
  EnrollmentRecord,
  EnrollmentStatus,
} from "@/lib/services/enrollments";
import { fetchClasses, ClassRecord } from "@/lib/services/classes";
import { fetchAcademicYears, AcademicYearRecord } from "@/lib/services/academic-years";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnrollStudentModal } from "@/components/admin/enroll-student-modal";
import {
  UserCheck,
  UserPlus,
  Search,
  MoreHorizontal,
  Filter,
  GraduationCap,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const [enrData, clsData, yrData] = await Promise.all([
      fetchEnrollments({
        search: searchQuery,
        classId: classFilter !== "all" ? classFilter : undefined,
        academicYearId: yearFilter !== "all" ? yearFilter : undefined,
      }),
      fetchClasses(),
      fetchAcademicYears(),
    ]);

    let filtered = enrData;
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    setEnrollments(filtered);
    setClasses(clsData);
    setAcademicYears(yrData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, classFilter, yearFilter, statusFilter]);

  const handleStatusChange = async (enrollmentId: string, status: EnrollmentStatus) => {
    const res = await updateEnrollmentStatus(enrollmentId, status);
    if (res.success) loadData();
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Student Enrollments" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Student Enrollment & Placement</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage student class enrollments, roll numbers, academic session history, and placements.
            </p>
          </div>

          <Button onClick={() => setIsEnrollModalOpen(true)} size="sm" className="gap-1.5 font-semibold shrink-0">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Enroll Student</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search student code, name, class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Class:</span>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Academic Year:</span>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Academic Years</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Status</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="completed">Completed</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Student Placement Roster</CardTitle>
            <CardDescription className="text-xs">
              Showing {enrollments.length} student enrollment records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Enrollment Records Found"
                  description="No student placements match your filters. Click 'Enroll Student' to place a student in a class."
                  actionLabel="Enroll Student"
                  onAction={() => setIsEnrollModalOpen(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Enrolled Class</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {e.studentCode}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/students/${e.studentId}`}
                            className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:underline"
                          >
                            {e.studentName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                            <span>{e.className}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">
                          {e.academicYearName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {e.rollNumber ? `#${e.rollNumber}` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              e.status === "enrolled"
                                ? "success"
                                : e.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize text-[10px]"
                          >
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-[10px]">Enrollment Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/students/${e.studentId}`}
                                  className="text-xs gap-2 cursor-pointer flex items-center"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                                  <span>View Student Profile</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs gap-2 cursor-pointer"
                                onClick={() => handleStatusChange(e.id, "completed")}
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Mark Completed</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs gap-2 cursor-pointer"
                                onClick={() => handleStatusChange(e.id, "transferred")}
                              >
                                <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
                                <span>Mark Transferred</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs gap-2 text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
                                onClick={() => handleStatusChange(e.id, "withdrawn")}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Withdraw Enrollment</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Enroll Modal */}
      <EnrollStudentModal
        open={isEnrollModalOpen}
        onOpenChange={setIsEnrollModalOpen}
        onEnrolled={loadData}
      />
    </DashboardShell>
  );
}
