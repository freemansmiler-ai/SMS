"use client";

import React from "react";
import { RecentAuditLog } from "@/lib/services/admin-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldAlert, Activity } from "lucide-react";

interface RecentSystemActivityProps {
  logs: RecentAuditLog[];
  loading: boolean;
}

export const RecentSystemActivity: React.FC<RecentSystemActivityProps> = ({
  logs,
  loading,
}) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-500" />
          <span>Recent System Activity</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time audit log events across platform services.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Recent Activity"
            description="System activity log is currently quiet."
          />
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Entity: {log.entityType}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  {log.timestamp}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
