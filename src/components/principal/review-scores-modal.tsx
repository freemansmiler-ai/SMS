"use client";

import React, { useState } from "react";
import {
  SubmittedResultBatch,
  approveResultBatch,
  returnResultBatch,
  publishApprovedResultBatch,
} from "@/lib/services/principal-approvals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, CheckCircle2, RotateCcw, ShieldCheck, AlertCircle, MessageSquare, Send } from "lucide-react";

interface ReviewScoresModalProps {
  batch: SubmittedResultBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
}

export const ReviewScoresModal: React.FC<ReviewScoresModalProps> = ({
  batch,
  open,
  onOpenChange,
  onActionComplete,
}) => {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!batch) return null;

  const handleApprove = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await approveResultBatch(batch.subjectId, batch.classId, comments);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to approve result batch.");
      return;
    }

    batch.status = "approved";
    onActionComplete();
    onOpenChange(false);
  };

  const handleReturn = async () => {
    if (!comments.trim()) {
      setErrorMsg("A mandatory return reason is required when returning results for correction.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const res = await returnResultBatch(batch.subjectId, batch.classId, comments);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to return result batch.");
      return;
    }

    batch.status = "returned";
    onActionComplete();
    onOpenChange(false);
  };

  const handlePublish = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await publishApprovedResultBatch(batch.subjectId, batch.classId);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to publish results.");
      return;
    }

    batch.status = "published";
    onActionComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            Executive Marksheet Review & Approval
          </DialogTitle>
          <DialogDescription className="text-xs">
            Reviewing scores submitted by <span className="font-bold text-slate-800 dark:text-slate-200">{batch.teacherName}</span> for{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">{batch.subjectName} ({batch.className})</span>.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-1">
          {/* Summary Stats Header */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Enrolled</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{batch.totalStudents} Students</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Class Average</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{batch.averageScore}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Pass Rate</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{batch.passRate}%</span>
            </div>
          </div>

          {/* Student Marksheet Scores */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>CA Score</TableHead>
                  <TableHead>Exam Score</TableHead>
                  <TableHead>Total (100)</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batch.entries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {item.studentName}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{item.studentCode}</TableCell>
                    <TableCell className="text-xs font-medium">
                      {item.continuousAssessmentScore ?? item.classScore ?? 0}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{item.examScore ?? 0}</TableCell>
                    <TableCell className="text-xs font-bold">{item.totalScore ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold text-[10px]">
                        {item.grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Executive Review Comments / Return Reason Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <span>Headmaster Review Comments / Correction Reason (Mandatory if returning) *</span>
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter approval notes or mandatory return reason for correction..."
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Security Audit Trail Notice */}
          <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-600 shrink-0" />
            <span>Audit Trail Active: Executive approvals, returns, and publications are recorded in audit logs.</span>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={loading || batch.status === "published"}
            onClick={handleReturn}
            className="gap-1.5 font-semibold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Return for Correction</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {batch.status === "approved" ? (
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={handlePublish}
                className="gap-1.5 font-semibold text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Publish Results</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={loading || (batch.status as string) === "approved" || (batch.status as string) === "published"}
                onClick={handleApprove}
                className="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve Results</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
