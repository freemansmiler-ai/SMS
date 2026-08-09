"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  SubjectRecord,
  CreateSubjectPayload,
} from "@/lib/services/subjects";
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
import { SubjectFormModal } from "@/components/admin/subject-form-modal";
import { DeleteSubjectDialog } from "@/components/admin/delete-subject-dialog";
import {
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
} from "lucide-react";

export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSubjects({ search: searchQuery });
    setSubjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (s: SubjectRecord) => {
    setEditingSubject(s);
    setIsFormOpen(false);
    setTimeout(() => setIsFormOpen(true), 50);
  };

  const handleFormSubmit = async (payload: CreateSubjectPayload) => {
    if (editingSubject) {
      const res = await updateSubject(editingSubject.id, payload);
      if (res.success) loadData();
      return res;
    } else {
      const res = await createSubject(payload);
      if (res.success) loadData();
      return res;
    }
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Subject Management" },
      ]}
    >
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Curriculum & Subject Management</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage school subjects, course codes, syllabus summaries, and faculty assignments.
            </p>
          </div>

          <Button onClick={handleOpenAddModal} size="sm" className="gap-1.5 font-semibold shrink-0">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Subject</span>
          </Button>
        </div>

        {/* Search */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search subject code, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Curriculum Subjects</CardTitle>
            <CardDescription className="text-xs">
              Showing {subjects.length} registered curriculum subjects.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Subjects Found"
                  description="No subjects match your search criteria. Click 'Add Subject' to register a new course."
                  actionLabel="Add Subject"
                  onAction={handleOpenAddModal}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Code</TableHead>
                      <TableHead>Subject Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned Faculty</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs font-bold uppercase">
                            {s.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {s.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {s.description || "No description provided."}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {s.teacherCount}
                            </span>
                            <span className="text-slate-400">Teachers</span>
                          </div>
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
                              <DropdownMenuLabel className="text-[10px]">Subject Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                className="text-xs gap-2 cursor-pointer"
                                onClick={() => handleOpenEditModal(s)}
                              >
                                <Edit className="h-3.5 w-3.5 text-slate-500" />
                                <span>Edit Subject</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs gap-2 text-rose-600 focus:text-rose-600 dark:text-rose-400 cursor-pointer"
                                onClick={() => setDeletingSubject(s)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Subject</span>
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
      <SubjectFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        subjectRecord={editingSubject}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Dialog */}
      <DeleteSubjectDialog
        subjectRecord={deletingSubject}
        open={Boolean(deletingSubject)}
        onOpenChange={() => setDeletingSubject(null)}
        onDeleted={loadData}
      />
    </DashboardShell>
  );
}
