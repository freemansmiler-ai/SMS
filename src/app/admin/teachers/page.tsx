"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchTeachers,
  createTeacher,
  updateTeacher,
  TeacherRecord,
  CreateTeacherPayload,
} from "@/lib/services/teachers";
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
import { TeacherFormModal } from "@/components/admin/teacher-form-modal";
import { AssignTeacherModal } from "@/components/admin/assign-teacher-modal";
import { DeactivateTeacherDialog } from "@/components/admin/deactivate-teacher-dialog";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  UserCheck,
  BookOpen,
  Filter,
  Plus,
} from "lucide-react";

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);
  const [assigningTeacher, setAssigningTeacher] = useState<TeacherRecord | null>(null);
  const [deactivatingTeacher, setDeactivatingTeacher] = useState<TeacherRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTeachers({ search: searchQuery, department: deptFilter });
    setTeachers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, deptFilter]);

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (teacher: TeacherRecord) => {
    setEditingTeacher(teacher);
    setIsFormOpen(false);
    setTimeout(() => setIsFormOpen(true), 50);
  };

  const handleFormSubmit = async (payload: CreateTeacherPayload) => {
    if (editingTeacher) {
      const res = await updateTeacher(editingTeacher.id, payload);
      if (res.success) loadData();
      return res;
    } else {
      const res = await createTeacher(payload);
      if (res.success) loadData();
      return res;
    }
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Teacher Management" },
      ]}
    >
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Faculty & Teacher Management</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage teacher directory, contact info, and relational subject/class assignments.
            </p>
          </div>

          <Button onClick={handleOpenAddModal} size="sm" className="gap-1.5 font-semibold shrink-0">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Faculty Member</span>
          </Button>
        </div>

        {/* Search & Department Filters */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search teacher name, code, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
                Department:
              </span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="all">All Departments</option>
                <option value="Early Grade">Early Grade</option>
                <option value="Lower Primary">Lower Primary</option>
                <option value="Upper Primary">Upper Primary</option>
                <option value="J.H.S">J.H.S</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Records Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Faculty Directory</CardTitle>
            <CardDescription className="text-xs">
              Showing {teachers.length} registered faculty profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : teachers.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Faculty Members Found"
                  description="No teacher profiles match your search criteria. Click 'Add Faculty Member' to register a new teacher."
                  actionLabel="Add Faculty Member"
                  onAction={handleOpenAddModal}
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Teacher Name</TableHead>
                    <TableHead>Code & Dept</TableHead>
                    <TableHead>Contact Phone</TableHead>
                    <TableHead>Assigned Subjects & Classes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700">
                            <AvatarImage src={teacher.avatarUrl} />
                            <AvatarFallback className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                              {teacher.firstName[0]}
                              {teacher.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Link
                              href={`/admin/teachers/${teacher.id}`}
                              className="font-semibold text-xs text-slate-800 dark:text-slate-200 hover:underline"
                            >
                              {teacher.firstName} {teacher.lastName}
                            </Link>
                            <span className="text-[10px] text-slate-400">{teacher.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-mono text-slate-700 dark:text-slate-300 block font-semibold">
                          {teacher.employeeCode}
                        </span>
                        <span className="text-[10px] text-slate-500">{teacher.department}</span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        {teacher.phone || "No Phone Registered"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          {teacher.assignments.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">No Assignments</span>
                          ) : (
                            teacher.assignments.map((asgn) => (
                              <Badge key={asgn.id} variant="outline" className="text-[9px] px-1 py-0 font-medium">
                                {asgn.subjectCode} ({asgn.className})
                              </Badge>
                            ))
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1"
                            onClick={() => setAssigningTeacher(teacher)}
                            title="Assign subject & class"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={teacher.isActive ? "success" : "secondary"}
                          className="capitalize text-[10px]"
                        >
                          {teacher.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuLabel className="text-[10px]">Faculty Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/teachers/${teacher.id}`}
                                className="text-xs gap-2 cursor-pointer flex items-center"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                <span>View Profile</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs gap-2 cursor-pointer"
                              onClick={() => handleOpenEditModal(teacher)}
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-500" />
                              <span>Edit Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs gap-2 cursor-pointer"
                              onClick={() => setAssigningTeacher(teacher)}
                            >
                              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                              <span>Assign Subject / Class</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-xs gap-2 text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
                              onClick={() => setDeactivatingTeacher(teacher)}
                            >
                              <UserX className="h-3.5 w-3.5" />
                              <span>Deactivate Teacher</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Teacher Modal */}
      <TeacherFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teacher={editingTeacher}
        onSubmit={handleFormSubmit}
      />

      {/* Relational Subject & Class Assignment Modal */}
      <AssignTeacherModal
        teacher={assigningTeacher}
        open={Boolean(assigningTeacher)}
        onOpenChange={() => setAssigningTeacher(null)}
        onAssigned={loadData}
      />

      {/* Deactivate Teacher Dialog */}
      <DeactivateTeacherDialog
        teacher={deactivatingTeacher}
        open={Boolean(deactivatingTeacher)}
        onOpenChange={() => setDeactivatingTeacher(null)}
        onDeactivated={loadData}
      />
    </DashboardShell>
  );
}
