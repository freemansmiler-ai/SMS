"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTeacherStudents } from "@/lib/services/teacher-students";
import { StudentRecord } from "@/lib/services/students";
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
  Search,
  Eye,
  GraduationCap,
  Filter,
  ShieldCheck,
  Phone,
} from "lucide-react";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [classFilter, setClassFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTeacherStudents({ search: searchQuery, classId: classFilter });
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, classFilter]);

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[
        { label: "Teacher Dashboard", href: "/teacher" },
        { label: "My Students" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Assigned Class Roster</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View students enrolled in your assigned Basic / SHS class sections.
            </p>
          </div>
        </div>

        {/* Security Info Banner */}
        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            Read-Only Assignment Scope: You are authorized to view student records strictly for your assigned classes.
          </span>
        </div>

        {/* Search & Class Filters */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search student name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
                Assigned Class:
              </span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Assigned Classes</option>
                <option value="class-basic8a">Basic 8 - Section A</option>
                <option value="class-basic9b">Basic 9 - Section B</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Student Records Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Assigned Students Roster</CardTitle>
            <CardDescription className="text-xs">
              Showing {students.length} students in your active sections.
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
                  description="No students match your filter or search query in your assigned class sections."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Student Name</TableHead>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Class Section</TableHead>
                    <TableHead>Guardian Phone Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
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
                              href={`/teacher/students/${student.id}`}
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
                      <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {student.className}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        {student.guardianContact ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {student.guardianContact}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not Provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="capitalize text-[10px]">
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/teacher/students/${student.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 font-medium">
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Profile</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
