"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchTeacherResults,
  saveResultDraft,
  submitResultBatch,
  calculateGESGrade,
  ResultEntry,
  ResultStatus,
} from "@/lib/services/teacher-results";
import { fetchTeacherDashboardData, AssignedSubjectSummary } from "@/lib/services/teacher-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  BookMarked,
  GraduationCap,
  Save,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function TeacherResultsPage() {
  const [assignedSubjects, setAssignedSubjects] = useState<Array<{ id: string; name: string; className: string }>>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("subj-math101");
  const [selectedClassId, setSelectedClassId] = useState<string>("class-basic8a");

  const [results, setResults] = useState<ResultEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load teacher assigned subjects
  useEffect(() => {
    const loadAssignments = async () => {
      const dash = await fetchTeacherDashboardData();
      const subs = dash.subjectsSummary.map((s: AssignedSubjectSummary) => ({
        id: s.subjectId,
        name: s.subjectName,
        className: s.classNames.join(", "),
      }));
      setAssignedSubjects(subs);
      if (subs.length > 0) {
        setSelectedSubjectId(subs[0].id);
      }
    };
    loadAssignments();
  }, []);

  // Load gradebook scores for selected subject & class
  const loadGradebook = async () => {
    setLoading(true);
    setMsg(null);
    const data = await fetchTeacherResults({
      subjectId: selectedSubjectId,
      classId: selectedClassId,
    });
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSubjectId) {
      loadGradebook();
    }
  }, [selectedSubjectId, selectedClassId]);

  const handleScoreChange = (
    id: string,
    field: "classScore" | "projectScore" | "examScore",
    val: string
  ) => {
    const maxVal = field === "classScore" ? 30 : field === "projectScore" ? 20 : 50;
    const num = Math.max(0, Math.min(maxVal, Number(val) || 0));

    setResults((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newClass = (field === "classScore" ? num : item.classScore) ?? 0;
        const newProject = (field === "projectScore" ? num : item.projectScore) ?? 0;
        const newExam = (field === "examScore" ? num : item.examScore) ?? 0;
        const newTotal = newClass + newProject + newExam;
        const { grade, remarks } = calculateGESGrade(newTotal);

        return {
          ...item,
          classScore: newClass,
          projectScore: newProject,
          examScore: newExam,
          totalScore: newTotal,
          grade,
          remarks,
        };
      })
    );
  };

  const handleSaveDrafts = async () => {
    setSaving(true);
    setMsg(null);
    let hasErr = false;

    for (const item of results) {
      if (item.status === "draft" || item.status === "returned") {
        const res = await saveResultDraft(item);
        if (!res.success) {
          hasErr = true;
          setMsg({ type: "error", text: res.error || "Failed to save score entries." });
          break;
        }
      }
    }

    setSaving(false);
    if (!hasErr) {
      setMsg({ type: "success", text: "Gradebook draft entries saved successfully." });
      loadGradebook();
    }
  };

  const handleSubmitBatch = async () => {
    setSubmitting(true);
    setMsg(null);

    // Save current drafts first
    for (const item of results) {
      if (item.status === "draft" || item.status === "returned") {
        await saveResultDraft(item);
      }
    }

    const res = await submitResultBatch(selectedSubjectId, selectedClassId);
    setSubmitting(false);

    if (!res.success) {
      setMsg({ type: "error", text: res.error || "Failed to submit marksheet batch." });
      return;
    }

    setResults((prev) => prev.map((r) => ({ ...r, status: "submitted" })));
    setMsg({
      type: "success",
      text: "Marksheet batch submitted successfully for Headmaster / Principal review.",
    });
  };

  const getStatusBadge = (status: ResultStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
      case "submitted":
        return (
          <Badge variant="warning" className="text-[10px] gap-1">
            <Lock className="h-3 w-3" /> Submitted
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="warning" className="text-[10px] gap-1">
            <Lock className="h-3 w-3" /> Under Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="success" className="text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "published":
        return (
          <Badge variant="success" className="text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Published
          </Badge>
        );
      case "returned":
        return (
          <Badge variant="destructive" className="text-[10px]">
            Returned for Correction
          </Badge>
        );
    }
  };

  const isBatchLocked = results.some(
    (r) => r.status === "submitted" || r.status === "under_review" || r.status === "approved" || r.status === "published"
  );

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[
        { label: "Teacher Dashboard", href: "/teacher" },
        { label: "Gradebook & Result Entry" },
      ]}
    >
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Award className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>GES Gradebook & Result Entry</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter Continuous Assessment, Project Work, and End of Term examination scores.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDrafts}
              disabled={saving || isBatchLocked || loading}
              className="gap-1.5 font-semibold text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving Draft..." : "Save Draft"}</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitBatch}
              disabled={submitting || isBatchLocked || loading}
              className="gap-1.5 font-semibold text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? "Submitting..." : "Submit Batch"}</span>
            </Button>
          </div>
        </div>

        {/* Status Notification Message */}
        {msg && (
          <Alert variant={msg.type === "error" ? "destructive" : "default"} className="py-2.5">
            {msg.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            <AlertTitle className="text-xs font-bold">
              {msg.type === "error" ? "Action Failed" : "Success Notice"}
            </AlertTitle>
            <AlertDescription className="text-xs">{msg.text}</AlertDescription>
          </Alert>
        )}

        {/* Workflow Lifecycle Security Banner */}
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <span>GES Assessment Scheme (Total: 100 Marks)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Class Score (30) + Project Work (20) + Exam (50) = 100
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Note: Once a marksheet batch is submitted, editing is locked to prevent unauthorized changes unless returned by the Headmaster for correction.
          </p>
        </div>

        {/* Subject & Class Selection Bar */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <BookMarked className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Subject:
                </span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="subj-math101">MATH-101 (Core Mathematics)</option>
                  <option value="subj-sci101">SCI-101 (Integrated Science)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Class:
                </span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="class-basic8a">Basic 8 - Section A</option>
                  <option value="class-basic9b">Basic 9 - Section B</option>
                </select>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={loadGradebook} className="h-8 text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Gradebook Score Entry Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Continuous Assessment & Exam Marksheet</CardTitle>
              <CardDescription className="text-xs">
                Term 1 (2026/2027) • Class Tests (30) + Project Work (20) + Exam (50) = Total (100)
              </CardDescription>
            </div>

            {isBatchLocked && (
              <Badge variant="warning" className="gap-1 text-[11px] px-2.5 py-1">
                <Lock className="h-3 w-3" /> Marksheet Locked for Review
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No student marksheets found for this class section.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Student Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="w-[110px]">Class Test (30)</TableHead>
                    <TableHead className="w-[110px]">Project Work (20)</TableHead>
                    <TableHead className="w-[110px]">Exam Score (50)</TableHead>
                    <TableHead>Total (100)</TableHead>
                    <TableHead>WAEC/GES Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((res) => {
                    const isLocked = res.status !== "draft" && res.status !== "returned";
                    return (
                      <TableRow key={res.id}>
                        <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {res.studentName}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-500">
                          {res.studentCode}
                        </TableCell>

                        {/* Class Test Score Input (Max 30) */}
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={30}
                            disabled={isLocked}
                            value={res.classScore}
                            onChange={(e) => handleScoreChange(res.id, "classScore", e.target.value)}
                            className="h-8 w-16 text-xs font-bold text-center bg-slate-50 dark:bg-slate-800"
                          />
                        </TableCell>

                        {/* Project Work Score Input (Max 20) */}
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            disabled={isLocked}
                            value={res.projectScore}
                            onChange={(e) => handleScoreChange(res.id, "projectScore", e.target.value)}
                            className="h-8 w-16 text-xs font-bold text-center bg-slate-50 dark:bg-slate-800"
                          />
                        </TableCell>

                        {/* Exam Score Input (Max 50) */}
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            disabled={isLocked}
                            value={res.examScore}
                            onChange={(e) => handleScoreChange(res.id, "examScore", e.target.value)}
                            className="h-8 w-16 text-xs font-bold text-center bg-slate-50 dark:bg-slate-800"
                          />
                        </TableCell>

                        {/* Total Score (100) */}
                        <TableCell className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {res.totalScore} / 100
                        </TableCell>

                        {/* WAEC Grade */}
                        <TableCell>
                          <Badge
                            variant={
                              res.grade === "A1" || res.grade === "B2" || res.grade === "B3"
                                ? "success"
                                : res.grade === "F9"
                                ? "destructive"
                                : "outline"
                            }
                            className="font-bold text-xs px-2 py-0.5"
                          >
                            {res.grade}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {res.remarks}
                        </TableCell>

                        <TableCell className="text-right">
                          {getStatusBadge(res.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
