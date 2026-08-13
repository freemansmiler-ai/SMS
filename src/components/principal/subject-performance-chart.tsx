"use client";

import React from "react";
import { PerformanceBySubject } from "@/lib/services/principal-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookMarked } from "lucide-react";

interface SubjectPerformanceChartProps {
  data: PerformanceBySubject[];
  loading: boolean;
}

export const SubjectPerformanceChart: React.FC<SubjectPerformanceChartProps> = ({ data, loading }) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span>GES Subject Pass Rates & Averages</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Curriculum subject score distribution across all Basic 1-9 divisions.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">
                    <code className="font-mono text-[10px] text-slate-500 mr-1.5">{item.subjectCode}</code>
                    {item.subjectName}
                  </span>
                  <div className="space-x-3 text-slate-600 dark:text-slate-400">
                    <span>Avg: <strong className="text-slate-900 dark:text-slate-100">{item.averageScore}%</strong></span>
                    <span>Pass: <strong className="text-emerald-600 dark:text-emerald-400">{item.passRate}%</strong></span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-slate-800 dark:bg-slate-200 transition-all duration-300"
                    style={{ width: `${item.averageScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
