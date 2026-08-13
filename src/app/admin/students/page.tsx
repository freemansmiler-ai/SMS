"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  StudentRecord,
  CreateStudentPayload,
} from "@/lib/services/students";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { StudentFormModal } from "@/components/admin/student-form-modal";
import { DeactivateStudentDialog } from "@/components/admin/deactivate-student-dialog";
import { BulkUploadModal } from "@/components/admin/bulk-upload-modal";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  GraduationCap,
  Filter,
  Upload,
} from "lucide-react";

export default function StudentManagementPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [deactivatingStudent, setDeactivatingStudent] = useState<StudentRecord | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchStudents({ search: searchQuery, status: statusFilter });
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (student: StudentRecord) => {
    setEditingStudent(student);
    setIsFormOpen(false);
    setTimeout(() => setIsFormOpen(true), 50);
  };

  const handleFormSubmit = async (payload: CreateStudentPayload) => {
    if (editingStudent) {
      const res = await updateStudent(editingStudent.id, payload);
      if (res.success) loadData();
      return res;
    } else {
      const res = await createStudent(payload);
      if (res.success) loadData();
      return res;
    }
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Student Management" },
      ]}
    >
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Student Management</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View, register, edit, and manage permitted student profiles and class assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsBulkUploadOpen(true)} 
              variant="outline" 
              size="sm" 
              className="gap-1.5 font-semibold"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Bulk Upload</span>
            </Button>
            <Button onClick={handleOpenAddModal} size="sm" className="gap-1.5 font-semibold shrink-0">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Student</span>
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search name, code, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Student Records Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Student Directory</CardTitle>
            <CardDescription className="text-xs">
              Showing {students.length} registered student records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : students.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Students Found"
                  description="No student records match your search criteria. Click 'Add Student' to create a new profile."
                  actionLabel="Add Student"
                  onAction={handleOpenAddModal}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[220px]">Student Name</TableHead>
                      <TableHead>Student Code</TableHead>
                      <TableHead>Assigned Class</TableHead>
                      <TableHead>Guardian Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700">
                              <AvatarImage src={student.avatarUrl} />
                              <AvatarFallback className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                                {student.firstName[0]}
                                {student.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <Link
                                href={`/admin/students/${student.id}`}
                                className="font-semibold text-xs text-slate-800 dark:text-slate-200 hover:underline"
                              >
                                {student.firstName} {student.lastName}
                              </Link>
                              <span className="text-[10px] text-slate-400">{student.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {student.studentCode}
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                          {student.className || "Unassigned"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                          {student.guardianName ? (
                            <div>
                              <span className="font-medium block text-slate-800 dark:text-slate-200">
                                {student.guardianName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {student.guardianContact || "No Phone"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Not Provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={student.status === "active" ? "success" : "secondary"}
                            className="capitalize text-[10px]"
                          >
                            {student.status}
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
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel className="text-[10px]">Student Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/students/${student.id}`}
                                  className="text-xs gap-2 cursor-pointer flex items-center"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                                  <span>View Profile</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs gap-2 cursor-pointer"
                                onClick={() => handleOpenEditModal(student)}
                              >
                                <Edit className="h-3.5 w-3.5 text-slate-500" />
                                <span>Edit Record</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs gap-2 text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
                                onClick={() => setDeactivatingStudent(student)}
                              >
                                <UserX className="h-3.5 w-3.5" />
                                <span>Deactivate Student</span>
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

      {/* Add / Edit Student Form Modal */}
      <StudentFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={editingStudent}
        onSubmit={handleFormSubmit}
      />

      {/* Deactivate Student Confirmation Dialog */}
      <DeactivateStudentDialog
        student={deactivatingStudent}
        open={Boolean(deactivatingStudent)}
        onOpenChange={() => setDeactivatingStudent(null)}
        onDeactivated={loadData}
      />

      {/* Bulk Upload Students Modal */}
      <BulkUploadModal
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSuccess={loadData}
      />
    </DashboardShell>
  );
}
