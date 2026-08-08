"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, CalendarCheck, FileText, CheckCircle2 } from "lucide-react";

interface TeacherActivityItem {
  id: string;
  title: string;
  timestamp: string;
  category: string;
}

interface TeacherActivitiesProps {
  activities: TeacherActivityItem[];
  loading: boolean;
}

export const TeacherActivities: React.FC<TeacherActivitiesProps> = ({ activities, loading }) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-500" />
          <span>Recent Class Activity & Logins</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Submissions and academic updates for your assigned classes.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            title="No Activity Yet"
            description="Your class activity stream is currently up to date."
          />
        ) : (
          <div className="space-y-2">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {act.category === "attendance" ? (
                    <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : act.category === "academic" ? (
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {act.title}
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  {act.timestamp}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
