"use client";

import React from "react";
import { ResultStatusSummary } from "@/lib/services/admin-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSpreadsheet, CheckCircle2, Clock } from "lucide-react";

interface ResultSubmissionStatusProps {
  status: ResultStatusSummary | null;
  loading: boolean;
}

export const ResultSubmissionStatus: React.FC<ResultSubmissionStatusProps> = ({
  status,
  loading,
}) => {
  if (loading || !status) {
    return (
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-slate-500" />
          <span>Result Submission Status</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Academic marksheets submitted vs pending processing.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 text-xs">
        {/* Completion Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Gradebook Completion Rate
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {status.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-300"
              style={{ width: `${Math.min(status.completionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Counts Breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Submitted Results</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {status.totalSubmitted.toLocaleString()} Entries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Pending Review</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 font-bold mt-0.5">
                {status.totalPending} Batches
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
