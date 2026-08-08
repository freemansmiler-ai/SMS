"use client";

import React from "react";
import Link from "next/link";
import { AssignedClassSummary } from "@/lib/services/teacher-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Users, Award, CalendarCheck } from "lucide-react";

interface MyClassesSectionProps {
  classes: AssignedClassSummary[];
  loading: boolean;
}

export const MyClassesSection: React.FC<MyClassesSectionProps> = ({ classes, loading }) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>My Classes</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Basic / SHS class sections where you conduct lessons.
          </CardDescription>
        </div>

        <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1 font-semibold">
          <Link href="/teacher/attendance">
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Attendance</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : classes.length === 0 ? (
          <EmptyState
            title="No Assigned Classes"
            description="You are not assigned to any class sections currently."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-semibold text-slate-500 block">
                      {cls.gradeLevel}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {cls.name}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    Active Section
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <Award className="h-3.5 w-3.5 text-slate-400" />
                    {cls.subjectName}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {cls.studentCount} Enrolled
                  </span>
                </div>

                <Button asChild size="sm" variant="secondary" className="w-full h-7 text-xs gap-1 font-semibold">
                  <Link href="/teacher/attendance">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>Take Roll Call</span>
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
