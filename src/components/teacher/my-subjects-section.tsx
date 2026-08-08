"use client";

import React from "react";
import { AssignedSubjectSummary } from "@/lib/services/teacher-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BookMarked, Users, GraduationCap } from "lucide-react";

interface MySubjectsSectionProps {
  subjects: AssignedSubjectSummary[];
  loading: boolean;
}

export const MySubjectsSection: React.FC<MySubjectsSectionProps> = ({ subjects, loading }) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span>My Subjects</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Curriculum subjects assigned to you for teaching this term.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No Assigned Subjects"
            description="You do not have any subjects assigned for the current term."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-semibold text-slate-500 block">
                      {sub.code}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {sub.name}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    GES Core
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                    {sub.className}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {sub.studentCount} Students
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
