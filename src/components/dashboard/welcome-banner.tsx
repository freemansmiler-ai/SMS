"use client";

import React from "react";
import { useRole } from "@/context/role-context";
import { ROLE_LABELS } from "@/constants/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2, ShieldCheck } from "lucide-react";

export const WelcomeBanner: React.FC = () => {
  const { activeProfile, activeRole } = useRole();

  const getGreetingMessage = () => {
    switch (activeRole) {
      case "administrator":
        return "System configurations, access permissions, and platform security policies are operating normally.";
      case "principal":
        return "Academic performance indicators and faculty operational metrics are updated for the current term.";
      case "teacher":
        return "Class schedules, gradebook logs, and student attendance records are synced for today.";
      case "student":
        return "Overview of registered courses, assignment deadlines, and personal academic progress.";
      default:
        return "Overview of academic activities and platform tools.";
    }
  };

  return (
    <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-medium border-slate-200 dark:border-slate-700">
                <ShieldCheck className="mr-1 h-3 w-3 text-slate-600 dark:text-slate-400 inline" />
                {ROLE_LABELS[activeRole].title}
              </Badge>
              <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome back, {activeProfile.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {getGreetingMessage()}
            </p>
          </div>

          {/* Restrained System Readiness Indicator */}
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <CheckCircle2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <div className="flex flex-col text-[11px]">
                <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  System Active
                </span>
                <span className="text-slate-500 text-[10px]">
                  PostgreSQL Schema Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
