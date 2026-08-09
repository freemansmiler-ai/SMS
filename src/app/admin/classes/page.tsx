"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchClasses,
  createClass,
  updateClass,
  ClassRecord,
  CreateClassPayload,
} from "@/lib/services/classes";
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
import { ClassFormModal } from "@/components/admin/class-form-modal";
import { DeactivateClassDialog } from "@/components/admin/deactivate-class-dialog";
import {
  School,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  Filter,
  Users,
  GraduationCap,
} from "lucide-react";

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);
  const [deactivatingClass, setDeactivatingClass] = useState<ClassRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchClasses({
      search: searchQuery,
      gradeLevel: gradeFilter,
      status: statusFilter,
    });
    setClasses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, gradeFilter, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (c: ClassRecord) => {
    setEditingClass(c);
    setIsFormOpen(false);
    setTimeout(() => setIsFormOpen(true), 50);
  };

  const handleFormSubmit = async (payload: CreateClassPayload) => {
    if (editingClass) {
      const res = await updateClass(editingClass.id, payload);
      if (res.success) loadData();
      return res;
    } else {
      const res = await createClass(payload);
      if (res.success) loadData();
      return res;
    }
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Class Management" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <School className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Class & Division Management</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage academic class sections, capacity bounds, and assigned class teachers.
            </p>
          </div>

          <Button onClick={handleOpenAddModal} size="sm" className="gap-1.5 font-semibold shrink-0">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Class Section</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search class name, teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Grade:</span>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Grades</option>
                  <option value="Basic 7">Basic 7</option>
                  <option value="Basic 8">Basic 8</option>
                  <option value="Basic 9">Basic 9</option>
                  <option value="SHS 1">SHS 1</option>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Class Directory</CardTitle>
            <CardDescription className="text-xs">
              Showing {classes.length} academic class divisions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : classes.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Classes Found"
                  description="No class sections match your filters. Click 'Add Class Section' to register a new class."
                  actionLabel="Add Class Section"
                  onAction={handleOpenAddModal}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Section</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Enrollment / Capacity</TableHead>
                      <TableHead>Assigned Class Teacher</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-slate-500" />
                            <Link
                              href={`/admin/classes/${c.id}`}
                              className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:underline"
                            >
                              {c.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {c.gradeLevel}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {c.studentCount}
                            </span>
                            <span className="text-slate-400">/ {c.capacity} Students</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {c.classTeacherName || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={c.status === "active" ? "success" : "secondary"}
                            className="capitalize text-[10px]"
                          >
                            {c.status}
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
                              <DropdownMenuLabel className="text-[10px]">Class Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/classes/${c.id}`}
                                  className="text-xs gap-2 cursor-pointer flex items-center"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                                  <span>View Class Details</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs gap-2 cursor-pointer"
                                onClick={() => handleOpenEditModal(c)}
                              >
                                <Edit className="h-3.5 w-3.5 text-slate-500" />
                                <span>Edit Record</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs gap-2 text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
                                onClick={() => setDeactivatingClass(c)}
                              >
                                <UserX className="h-3.5 w-3.5" />
                                <span>Deactivate Class</span>
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

      {/* Form Modal */}
      <ClassFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        classRecord={editingClass}
        onSubmit={handleFormSubmit}
      />

      {/* Deactivate Dialog */}
      <DeactivateClassDialog
        classRecord={deactivatingClass}
        open={Boolean(deactivatingClass)}
        onOpenChange={() => setDeactivatingClass(null)}
        onDeactivated={loadData}
      />
    </DashboardShell>
  );
}
