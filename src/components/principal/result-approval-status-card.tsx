"use client";

import React from "react";
import { ResultSubmissionStatusSummary } from "@/lib/services/principal-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCheck, Clock, CheckCircle2, Send, AlertCircle } from "lucide-react";

interface ResultApprovalStatusCardProps {
  status: ResultSubmissionStatusSummary | null;
  loading: boolean;
}

export const ResultApprovalStatusCard: React.FC<ResultApprovalStatusCardProps> = ({ status, loading }) => {
  if (loading || !status) {
    return (
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span>Result Submission & Approval Workflow Status</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Executive tracking of marksheets across submission approval states.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Draft */}
          <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold block">Teacher Drafts</span>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {status.draftCount}
            </div>
            <Badge variant="secondary" className="text-[9px]">Draft</Badge>
          </div>

          {/* Submitted (Pending Approval) */}
          <div className="p-2.5 rounded-md bg-amber-50/70 dark:bg-amber-900/30 border border-amber-200/70 dark:border-amber-800 text-center space-y-1">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold block">Submitted</span>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{status.submittedCount}</span>
            </div>
            <Badge variant="warning" className="text-[9px]">Awaiting Approval</Badge>
          </div>

          {/* Under Review */}
          <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold block">Under Review</span>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {status.underReviewCount}
            </div>
            <Badge variant="outline" className="text-[9px]">Review</Badge>
          </div>

          {/* Approved */}
          <div className="p-2.5 rounded-md bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/70 dark:border-emerald-800 text-center space-y-1">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block">Approved</span>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>{status.approvedCount}</span>
            </div>
            <Badge variant="success" className="text-[9px]">Executive Approved</Badge>
          </div>

          {/* Published */}
          <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold block">Published</span>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {status.publishedCount}
            </div>
            <Badge variant="outline" className="text-[9px]">Portal Active</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
