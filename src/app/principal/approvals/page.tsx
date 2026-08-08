"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchSubmittedResultBatches,
  SubmittedResultBatch,
} from "@/lib/services/principal-approvals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ReviewScoresModal } from "@/components/principal/review-scores-modal";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function PrincipalApprovalsPage() {
  const [batches, setBatches] = useState<SubmittedResultBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");

  const [reviewBatch, setReviewBatch] = useState<SubmittedResultBatch | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSubmittedResultBatches({
      classId: classFilter,
      subjectId: subjectFilter,
      teacherId: teacherFilter,
    });
    setBatches(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [classFilter, subjectFilter, teacherFilter]);

  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "Result Approvals" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Marksheet Submission & Approval Center</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Headmaster review portal for approving or returning teacher marksheets.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1">
            <RefreshCw className="h-3 w-3" />
            Refresh Queue
          </Button>
        </div>

        {/* Executive Workflow Info */}
        <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-900/30 border border-amber-200/70 dark:border-amber-800 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">
              Governance Rule: Approved results become read-only and lock teacher editing. Unapproved results are hidden from student portal until published.
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />

              {/* Class Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Class:</span>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Classes</option>
                  <option value="class-basic8a">Basic 8 - Section A</option>
                  <option value="class-basic9b">Basic 9 - Section B</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Subject:</span>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Subjects</option>
                  <option value="subj-math101">Core Mathematics</option>
                  <option value="subj-sci101">Integrated Science</option>
                </select>
              </div>

              {/* Teacher Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Teacher:</span>
                <select
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Teachers</option>
                  <option value="tch-201">Abena Appiah</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submitted Batches Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Submitted Marksheets Queue</CardTitle>
            <CardDescription className="text-xs">
              Showing {batches.length} submitted marksheets requiring executive decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : batches.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Pending Approvals"
                  description="All teacher marksheets have been reviewed or approved for publication."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject & Code</TableHead>
                    <TableHead>Class Section</TableHead>
                    <TableHead>Submitted By Teacher</TableHead>
                    <TableHead>Enrolled Students</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {batch.subjectName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {batch.subjectCode}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {batch.className}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                        {batch.teacherName}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {batch.totalStudents} Students
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {batch.averageScore}%
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {batch.passRate}%
                      </TableCell>
                      <TableCell>
                        {batch.status === "approved" ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </Badge>
                        ) : batch.status === "returned" ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Returned
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] gap-1">
                            <Clock className="h-3 w-3" /> Awaiting Review
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewBatch(batch)}
                          className="h-7 text-xs gap-1.5 font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Review Scores</span>
                        </Button>
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

      {/* Review & Approval Modal */}
      <ReviewScoresModal
        batch={reviewBatch}
        open={Boolean(reviewBatch)}
        onOpenChange={() => setReviewBatch(null)}
        onActionComplete={loadData}
      />
    </DashboardShell>
  );
}
